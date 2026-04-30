import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage-angular';
import { firstValueFrom } from 'rxjs';
import { Configuracion } from '../../components/configuracion/configuracion/configuracion.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private static readonly REFRESH_MARGIN_MS = 5 * 60 * 1000;
  private static readonly CLIENT_ID = 'NestoApp';

  private jwtHelper = new JwtHelperService();
  private refreshInFlight: Promise<string> | null = null;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  public async authenticated(): Promise<boolean> {
    const token = await this.storage.get('id_token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  public isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Devuelve un access_token válido. Refresca proactivamente si está cerca de
   * caducar (< 5 min) y hay refresh_token guardado. Si no hay forma de refrescar,
   * devuelve el token tal cual — el servidor decidirá; en caso de 401 el
   * interceptor reactivo tendrá su segundo intento.
   */
  public async getValidToken(): Promise<string | null> {
    const token = await this.storage.get('id_token');
    if (!token) {
      return null;
    }

    if (!this.tokenWillExpireSoon(token)) {
      return token;
    }

    const refreshToken = await this.storage.get('refresh_token');
    if (!refreshToken) {
      return token;
    }

    try {
      return await this.refreshAccessToken();
    } catch {
      return token;
    }
  }

  /**
   * Llama a /oauth/token con grant_type=refresh_token. Comparte una única
   * promise mientras hay un refresh en vuelo para que múltiples requests
   * paralelas no disparen varios refreshes (cada nuevo refresh_token rota
   * e invalida el anterior).
   */
  public refreshAccessToken(): Promise<string> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.doRefresh().finally(() => {
      this.refreshInFlight = null;
    });

    return this.refreshInFlight;
  }

  private async doRefresh(): Promise<string> {
    const refreshToken = await this.storage.get('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh_token available');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const body =
      'grant_type=refresh_token' +
      '&refresh_token=' + encodeURIComponent(refreshToken) +
      '&client_id=' + AuthService.CLIENT_ID;

    const response = await firstValueFrom(
      this.http.post<{ access_token: string; refresh_token?: string }>(
        Configuracion.URL_SERVIDOR + '/oauth/token',
        body,
        { headers }
      )
    );

    // Persistir refresh_token ANTES que access_token. Si la app crashea entre
    // ambas escrituras, el refresh_token nuevo queda guardado y al siguiente
    // arranque se podrá refrescar con normalidad. Si fuera al revés, un crash
    // en medio dejaría el refresh_token viejo (ya revocado en servidor) y el
    // usuario tendría que re-loguearse.
    if (response.refresh_token) {
      await this.storage.set('refresh_token', response.refresh_token);
    }
    await this.storage.set('id_token', response.access_token);

    return response.access_token;
  }

  private tokenWillExpireSoon(token: string): boolean {
    const expDate = this.jwtHelper.getTokenExpirationDate(token);
    if (!expDate) {
      return true;
    }
    return expDate.getTime() - Date.now() < AuthService.REFRESH_MARGIN_MS;
  }
}
