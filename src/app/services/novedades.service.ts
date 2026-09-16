import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   * CHAPUZA TEMPORAL (NestoApp#177): la API aún no filtra por ámbito, así que se baja todo
   * y se filtra aquí. Tampoco se manda desdeVersion: el servidor compararía las versiones
   * de Nesto (1.10.x) con las de la app (2.x). Cuando NestoAPI#489 esté publicado, pasar a
   * GET api/Novedades?ambito=NestoApp y retirar el filtro en cliente.
   */
  public leerNovedades(): Observable<Novedad[]> {
    const url = Configuracion.API_URL + '/Novedades';
    return this.http.get<Novedad[]>(url).pipe(
      map(novedades => (novedades || []).filter(n => n.Ambito === 'NestoApp'))
    );
  }
}
