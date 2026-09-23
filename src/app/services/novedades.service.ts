import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/**
 * NestoApp#177: entrada del changelog de cara al usuario, de la tabla Novedades de la API
 * (Nesto#372). Campos en PascalCase, como los serializa NestoAPI.
 */
export interface Novedad {
  Id: number;
  Version: string;
  Fecha: string;
  /** Nuevo / Mejorado / Corregido */
  Categoria: string;
  Titulo: string;
  Descripcion?: string;
  /** Nesto / NestoAPI / NestoApp */
  Ambito: string;
}

export interface GrupoNovedades {
  version: string;
  fecha: string;
  novedades: Novedad[];
}

/** Agrupa por versión conservando el orden del servidor (versión descendente). */
export function agruparPorVersion(novedades: Novedad[]): GrupoNovedades[] {
  const grupos: GrupoNovedades[] = [];
  for (const novedad of novedades || []) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.version === novedad.Version) {
      ultimo.novedades.push(novedad);
    } else {
      grupos.push({ version: novedad.Version, fecha: novedad.Fecha, novedades: [novedad] });
    }
  }
  return grupos;
}

/** Colores de siempre, sin tocar la paleta (regla de CLAUDE.md). */
export function colorCategoria(categoria: string): string {
  switch (categoria) {
    case 'Nuevo': return 'success';
    case 'Mejorado': return 'primary';
    case 'Corregido': return 'warning';
    default: return 'medium';
  }
}

@Injectable({
  providedIn: 'root'
})
export class NovedadesService {

  constructor(private http: HttpClient) { }

  /**
   * #186: solo las de la app. Sin ámbito, NestoAPI (#489) devuelve las del escritorio y nunca
   * las de NestoApp. Sin desdeVersion: el perfil enseña el histórico completo.
   */
  public leerNovedades(): Observable<Novedad[]> {
    const url = Configuracion.API_URL + '/Novedades';
    const params = new HttpParams().set('ambito', 'NestoApp');
    return this.http.get<Novedad[]>(url, { params }).pipe(
      map(novedades => novedades || [])
    );
  }
}
