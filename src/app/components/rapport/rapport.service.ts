import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { Usuario } from 'src/app/models/Usuario';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { Event } from '@microsoft/microsoft-graph-types';

@Injectable({
  providedIn: 'root'
})
export class RapportService {

  static ngInjectableDef = undefined;

  constructor(private http: HttpClient,
    private usuario: Usuario,
    private authService: AuthService) {    }

  private _baseUrl: string = Configuracion.API_URL + '/SeguimientosClientes';
  private _clientesUrl: string = Configuracion.API_URL + '/Clientes';

  public crearRapport(rapport: any): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      if (rapport.Id == 0) {
          return this.http.post(this._baseUrl, JSON.stringify(rapport), { headers: headers });
      } else {
          return this.http.put(this._baseUrl, JSON.stringify(rapport), { headers: headers });
      }
  }

  public getCliente(cliente: string, contacto: string): Observable<any> {
      let params: HttpParams = new HttpParams();
      params = params.append('empresa', Configuracion.EMPRESA_POR_DEFECTO);
      params = params.append('cliente', cliente);
      params = params.append('contacto', contacto);

      return this.http.get(this._clientesUrl, { params: params });
  }

  public dejarDeVisitar(rapport: any, vendedorEstetica: string, vendedorPeluqueria: string): Observable<any> {
      let headers: any = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      let clienteCrear: any = {
          empresa: rapport.Empresa,
          cliente: rapport.Cliente,
          contacto: rapport.Contacto,
          usuario: rapport.Usuario
      }

      if (vendedorEstetica == this.usuario.vendedor) {
          clienteCrear.vendedorEstetica = Configuracion.VENDEDOR_GENERAL;
      }
      if (vendedorPeluqueria == this.usuario.vendedor) {
          clienteCrear.vendedorPeluqueria = Configuracion.VENDEDOR_GENERAL;
      }
      return this.http.put(this._clientesUrl+'/DejarDeVisitar', JSON.stringify(clienteCrear), { headers: headers });
  }

  /**
   * Issue #88: crea el evento en el calendario del usuario via Graph API. Llama a fetch
   * directamente (sin SDK Microsoft Graph) usando el access_token gestionado por AuthService.
   * Si el token está caducado, AuthService.getAccessToken() lo refresca de forma transparente.
   */
  async addEventToCalendar(newEvent: Event): Promise<void> {
    const accessToken = await this.authService.getAccessToken();
    // CapacitorHttp en vez de fetch: la request sale desde Java nativo sin cabecera Origin,
    // que Microsoft rechaza en clientes registrados como Android (no SPA).
    const resp = await CapacitorHttp.post({
      url: 'https://graph.microsoft.com/v1.0/me/events',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: newEvent
    });
    if (resp.status < 200 || resp.status >= 300) {
      const detalle = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      throw new Error('Microsoft Graph rechazó la cita (HTTP ' + resp.status + '): ' + detalle);
    }
  }

}
