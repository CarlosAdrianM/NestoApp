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
 *
 * Issue #130: anti-flood. Un error en un getter de template se repite en cada ciclo de change
 * detection (decenas de veces por segundo). Sin protección, un solo bug genera miles de POSTs
 * y satura ELMAH y la batería/datos del dispositivo. Aplicamos dos límites:
 *  - Cooldown por error: el mismo Mensaje+TipoExcepcion+Contexto se envía como mucho 1 vez/min.
 *  - Cap global por minuto: no más de MAX_POR_MINUTO envíos totales por minuto.
 */
@Injectable({ providedIn: 'root' })
export class ErroresService {

  private static readonly COOLDOWN_MS = 60_000;
  private static readonly MAX_POR_MINUTO = 30;

  private ultimoEnvioPorClave: Map<string, number> = new Map();
  private timestampsEnvios: number[] = [];

  constructor(private http: HttpClient, private usuario: Usuario) { }

  public reportar(error: any, contexto?: string): void {
    try {
      const body = this.construirCuerpo(error, contexto);
      if (!this.debeEnviar(body)) return;
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.http.post(Configuracion.API_URL + '/Errores', body, { headers }).subscribe({
        error: e => { try { console.warn('No se pudo reportar error a ELMAH:', e); } catch { } }
      });
    } catch (e) {
      try { console.warn('Fallo construyendo reporte de error:', e); } catch { }
    }
  }

  private debeEnviar(body: ReporteError): boolean {
    const ahora = Date.now();
    const limite = ahora - ErroresService.COOLDOWN_MS;

    // Limpia los timestamps fuera de ventana antes de decidir.
    this.timestampsEnvios = this.timestampsEnvios.filter(t => t >= limite);

    // Cap global por minuto: protege incluso ante muchos errores DISTINTOS.
    if (this.timestampsEnvios.length >= ErroresService.MAX_POR_MINUTO) return false;

    // Cooldown por mismo error (mensaje + tipo + contexto). Sin esto un getter roto
    // dispara N reportes por segundo (issue #130).
    const clave = `${body.TipoExcepcion || ''}|${body.Mensaje}|${body.Contexto || ''}`;
    const ultimo = this.ultimoEnvioPorClave.get(clave);
    if (ultimo !== undefined && ultimo >= limite) return false;

    this.ultimoEnvioPorClave.set(clave, ahora);
    this.timestampsEnvios.push(ahora);

    // Purga periódica del mapa para que no crezca indefinidamente.
    if (this.ultimoEnvioPorClave.size > 100) {
      for (const [k, t] of this.ultimoEnvioPorClave) {
        if (t < limite) this.ultimoEnvioPorClave.delete(k);
      }
    }

    return true;
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
