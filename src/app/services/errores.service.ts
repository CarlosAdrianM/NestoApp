import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { Usuario } from '../models/Usuario';

export interface ReporteError {
  Aplicacion?: string;
  Version?: string;
  Plataforma?: string;
  TipoExcepcion?: string;
  Mensaje: string;
  StackTrace?: string;
  Contexto?: string;
  UsuarioCliente?: string;
}

/**
 * Issue #123: reporta errores no controlados al endpoint AllowAnonymous /Errores de NestoAPI
 * para que queden registrados en ELMAH. Best-effort: nunca lanza.
 */
@Injectable({ providedIn: 'root' })
export class ErroresService {

  constructor(private http: HttpClient, private usuario: Usuario) { }

  public reportar(error: any, contexto?: string): void {
    try {
      const body = this.construirCuerpo(error, contexto);
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.http.post(Configuracion.API_URL + '/Errores', body, { headers }).subscribe({
        error: e => { try { console.warn('No se pudo reportar error a ELMAH:', e); } catch { } }
      });
    } catch (e) {
      try { console.warn('Fallo construyendo reporte de error:', e); } catch { }
    }
  }

  private construirCuerpo(error: any, contexto?: string): ReporteError {
    const plataforma = this.plataforma();
    const mensaje = this.mensaje(error);
    return {
      Aplicacion: 'NestoApp',
      Version: Configuracion.VERSION,
      Plataforma: plataforma,
      TipoExcepcion: error?.name || (error?.constructor && error.constructor.name) || 'Error',
      Mensaje: mensaje,
      StackTrace: error?.stack,
      Contexto: contexto,
      UsuarioCliente: this.usuario?.nombre
    };
  }

  private plataforma(): string {
    const p = Capacitor.getPlatform();
    if (p === 'android') return 'Android';
    if (p === 'ios') return 'iOS';
    return 'Web';
  }

  private mensaje(error: any): string {
    if (!error) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error.message) return String(error.message);
    try { return JSON.stringify(error); } catch { return String(error); }
  }
}
