import { Injectable } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { CapacitorHttp } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { OAuthSettings } from '../oauth';
import { User } from './user';

/**
 * Issue #88: integración con Outlook (Microsoft Graph) para crear citas desde Rapports.
 *
 * El flujo MSAL clásico (loginPopup / loginRedirect) NO funciona en Capacitor porque el WebView
 * sirve la app desde `https://localhost` y los redirects salen fuera del WebView. La solución
 * actual usa el OAuth2 Authorization Code Flow con PKCE directamente:
 *  1. Abrimos la página de login de Microsoft en `@capacitor/browser` (Chrome Custom Tabs).
 *  2. Microsoft redirige al `msauth://...` registrado en Azure como plataforma Android.
 *  3. Android entrega ese deep link a NUESTRA app (vía intent-filter en AndroidManifest).
 *  4. `App.addListener('appUrlOpen')` recibe la URL con `?code=...&state=...`.
 *  5. POST manual al token endpoint para canjear el code por access_token + refresh_token.
 *  6. Para crear citas usamos `fetch` directo a Graph (`/me/events`); no necesitamos MSAL ni el
 *     SDK de Microsoft Graph.
 *
 * El refresh del access_token (que vive 1h) lo hace `getAccessToken()` de forma transparente
 * mientras tengamos `refresh_token` (scope `offline_access`).
 */

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

interface AccountInfo {
  displayName?: string;
  email?: string;
  timeZone?: string;
}

interface SesionOutlook {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  account: AccountInfo;
}

const STORAGE_KEY_SESION = 'outlook_sesion';
// Tenant ID de Nueva Visión: restringe el login a cuentas corporativas (no acepta Hotmail ni
// cuentas de empresa de otros tenants), para que las citas vayan siempre al calendario nuevavision.es.
const TENANT = '16d9b0cd-12c6-4639-8c26-779abc0dc0ad';

/** Issue #88: error específico para que el componente pueda reconocer caducidad de sesión y mostrar un mensaje amistoso al vendedor. */
export class SesionOutlookCaducadaError extends Error {
  constructor() {
    super('Tu sesión de Office ha caducado. Pulsa "Iniciar sesión en Office" para volver a entrar.');
    this.name = 'SesionOutlookCaducadaError';
  }
}
const AUTH_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize`;
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
const PKCE_VERIFIER_LENGTH = 64;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user?: User;
  private sesion: SesionOutlook | null = null;
  private appUrlListenerRegistered = false;
  private browserFinishedListenerRegistered = false;
  private signInPending: {
    resolve: () => void;
    reject: (err: any) => void;
    codeVerifier: string;
    state: string;
  } | null = null;

  constructor(private storage: Storage) {
    this.restaurarSesion();
  }

  public get authenticated(): boolean {
    return this.sesion !== null && this.sesion.expiresAt > Date.now();
  }

  public async signIn(): Promise<void> {
    const codeVerifier = this.randomString(PKCE_VERIFIER_LENGTH);
    const codeChallenge = await this.pkceChallenge(codeVerifier);
    const state = this.randomString(32);

    if (!this.appUrlListenerRegistered) {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => this.onAppUrlOpen(event.url));
      this.appUrlListenerRegistered = true;
    }
    if (!this.browserFinishedListenerRegistered) {
      // Si el usuario cierra el browser sin completar el login, browserFinished se dispara antes
      // de recibir el deep link msauth://. Sin este handler, signInPending quedaba colgado para
      // siempre y la próxima vez que el usuario reintentara mezclaba estados.
      Browser.addListener('browserFinished', () => this.onBrowserFinished());
      this.browserFinishedListenerRegistered = true;
    }

    const url = this.buildAuthUrl(codeChallenge, state);
    return new Promise<void>((resolve, reject) => {
      this.signInPending = { resolve, reject, codeVerifier, state };
      Browser.open({ url }).catch(reject);
    });
  }

  private onBrowserFinished(): void {
    if (!this.signInPending) return;
    // Si el login fue correcto, el callback msauth:// llega casi a la vez que browserFinished
    // y el orden no está garantizado. Damos margen al deep link antes de rechazar.
    setTimeout(() => {
      if (!this.signInPending) return;
      const pendiente = this.signInPending;
      this.signInPending = null;
      pendiente.reject(new Error('Inicio de sesión cancelado'));
    }, 500);
  }

  public async signOut(): Promise<void> {
    this.sesion = null;
    this.user = undefined;
    await this.storage.remove(STORAGE_KEY_SESION);
  }

  /**
   * Devuelve un access_token válido para llamar a Graph. Refresca silenciosamente si está
   * cerca de caducar y hay refresh_token. Lanza si la sesión no es recuperable — el llamante
   * debe pedirle al usuario que vuelva a entrar con signIn().
   */
  public async getAccessToken(): Promise<string> {
    if (!this.sesion) {
      throw new SesionOutlookCaducadaError();
    }
    if (this.sesion.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
      return this.sesion.accessToken;
    }
    if (!this.sesion.refreshToken) {
      await this.signOut();
      throw new SesionOutlookCaducadaError();
    }
    try {
      const renovada = await this.refrescarToken(this.sesion.refreshToken);
      this.sesion = renovada;
      await this.storage.set(STORAGE_KEY_SESION, renovada);
      return renovada.accessToken;
    } catch (e) {
      // Refresh revocado por Microsoft (cambio de contraseña, > 90 días sin uso, etc.). Limpiamos
      // la sesión y devolvemos el error específico para que el componente lo muestre amistoso.
      await this.signOut();
      throw new SesionOutlookCaducadaError();
    }
  }

  private async restaurarSesion(): Promise<void> {
    try {
      const raw = await this.storage.get(STORAGE_KEY_SESION);
      if (raw) {
        this.sesion = raw as SesionOutlook;
        this.actualizarUser();
      }
    } catch (e) {
      console.warn('No se pudo restaurar sesión Outlook:', e);
    }
  }

  private async onAppUrlOpen(url: string): Promise<void> {
    if (!this.signInPending) return;
    if (!url.startsWith('msauth://')) return;

    const pendiente = this.signInPending;
    this.signInPending = null;

    try {
      const params = this.extractParams(url);
      const errorCode = params.get('error');
      if (errorCode) {
        throw new Error(`Microsoft devolvió error: ${params.get('error_description') || errorCode}`);
      }
      if (params.get('state') !== pendiente.state) {
        throw new Error('state del callback no coincide');
      }
      const code = params.get('code');
      if (!code) throw new Error('callback sin code');

      const sesion = await this.intercambiarCodePorTokens(code, pendiente.codeVerifier);
      sesion.account = await this.obtenerAccount(sesion.accessToken);
      this.sesion = sesion;
      await this.storage.set(STORAGE_KEY_SESION, sesion);
      this.actualizarUser();
      pendiente.resolve();
    } catch (e) {
      pendiente.reject(e);
    } finally {
      await Browser.close().catch(() => {});
    }
  }

  private buildAuthUrl(codeChallenge: string, state: string): string {
    const params = new URLSearchParams({
      client_id: OAuthSettings.appId,
      response_type: 'code',
      redirect_uri: OAuthSettings.redirectUri,
      response_mode: 'query',
      scope: this.scopeString(),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    return `${AUTH_URL}?${params.toString()}`;
  }

  /**
   * Usamos CapacitorHttp en vez de fetch para que la request salga desde el código Java nativo
   * y NO lleve cabecera Origin. Microsoft rechaza el token redemption con Origin cuando la app
   * está registrada como Android (no SPA): "Cross-origin token redemption is permitted only for
   * the single page application client type".
   */
  private async postFormUrlEncoded(url: string, params: Record<string, string>): Promise<any> {
    const data = new URLSearchParams(params).toString();
    const resp = await CapacitorHttp.post({
      url,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      data
    });
    if (resp.status < 200 || resp.status >= 300) {
      const detalle = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      throw new Error(`HTTP ${resp.status}: ${detalle}`);
    }
    return typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
  }

  private async getJson(url: string, accessToken: string): Promise<any> {
    const resp = await CapacitorHttp.get({
      url,
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
    });
    if (resp.status < 200 || resp.status >= 300) {
      throw new Error(`HTTP ${resp.status}`);
    }
    return typeof resp.data === 'string' ? JSON.parse(resp.data) : resp.data;
  }

  private async intercambiarCodePorTokens(code: string, codeVerifier: string): Promise<SesionOutlook> {
    const data: TokenResponse = await this.postFormUrlEncoded(TOKEN_URL, {
      client_id: OAuthSettings.appId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: OAuthSettings.redirectUri,
      code_verifier: codeVerifier,
      scope: this.scopeString()
    });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      account: {}
    };
  }

  private async refrescarToken(refreshToken: string): Promise<SesionOutlook> {
    const data: TokenResponse = await this.postFormUrlEncoded(TOKEN_URL, {
      client_id: OAuthSettings.appId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: this.scopeString()
    });
    return {
      accessToken: data.access_token,
      // Microsoft devuelve un refresh_token nuevo cada vez (rota). Si no llegase, mantenemos el anterior.
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: Date.now() + (data.expires_in * 1000),
      account: this.sesion?.account ?? {}
    };
  }

  private async obtenerAccount(accessToken: string): Promise<AccountInfo> {
    const cuenta: AccountInfo = {};
    try {
      const me = await this.getJson('https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName', accessToken);
      cuenta.displayName = me.displayName;
      cuenta.email = me.mail ?? me.userPrincipalName;
    } catch { }
    try {
      const tz = await this.getJson('https://graph.microsoft.com/v1.0/me/mailboxSettings/timeZone', accessToken);
      cuenta.timeZone = tz.value;
    } catch { }
    cuenta.timeZone = cuenta.timeZone ?? 'UTC';
    return cuenta;
  }

  private actualizarUser(): void {
    if (!this.sesion) {
      this.user = undefined;
      return;
    }
    const u = new User();
    u.displayName = this.sesion.account.displayName ?? '';
    u.email = this.sesion.account.email ?? '';
    u.timeZone = this.sesion.account.timeZone ?? 'UTC';
    u.avatar = '/assets/no-profile-photo.png';
    this.user = u;
  }

  private scopeString(): string {
    return [...OAuthSettings.scopes, 'offline_access', 'openid', 'profile'].join(' ');
  }

  private extractParams(url: string): URLSearchParams {
    const queryIndex = url.indexOf('?');
    if (queryIndex < 0) return new URLSearchParams();
    return new URLSearchParams(url.substring(queryIndex + 1));
  }

  private randomString(length: number): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  private async pkceChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = new Uint8Array(hashBuffer);
    let binary = '';
    for (let i = 0; i < hash.length; i++) {
      binary += String.fromCharCode(hash[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
