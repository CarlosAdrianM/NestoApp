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
  // NestoApp#188 / NestoAPI#520: feedback. Sin estos campos (tablas aún no creadas), no hay botones.
  VotosPositivos?: number | null;
  VotosNegativos?: number | null;
  /** 1 / -1, o null si no ha votado. */
  MiVoto?: number | null;
  NumeroComentarios?: number | null;
}

/** NestoApp#188: comentario de una novedad (la imagen se pide aparte, por su Id). */
export interface ComentarioNovedad {
  Id: number;
  NovedadId: number;
  NombreVisible: string;
  Cliente: string;
  VersionCliente: string;
  Texto: string;
  Fecha: string;
  TieneImagen: boolean;
  /** Es de quien pregunta: puede borrarlo. */
  EsMio: boolean;
}

export interface NuevoComentarioNovedad {
  Texto: string;
  /** Admite el prefijo «data:image/...;base64,». */
  ImagenBase64?: string;
  ImagenTipo?: string;
  VersionCliente?: string;
}

/** La API trae los contadores de votos: se puede votar y comentar. */
export function tieneFeedback(novedad: Novedad): boolean {
  return novedad?.VotosPositivos !== undefined && novedad?.VotosPositivos !== null;
}

/**
 * NestoApp#188: un voto por usuario y novedad. Pulsar el mismo lo quita (se manda 0) y pulsar el
 * otro lo cambia. Devuelve la novedad con los recuentos ya ajustados (para pintarla al momento).
 */
export function aplicarVoto(novedad: Novedad, pulsado: 1 | -1): { novedad: Novedad; voto: number } {
  const anterior = novedad.MiVoto ?? null;
  const voto = anterior === pulsado ? 0 : pulsado;
  let positivos = novedad.VotosPositivos || 0;
  let negativos = novedad.VotosNegativos || 0;
  if (anterior === 1) positivos--;
  if (anterior === -1) negativos--;
  if (voto === 1) positivos++;
  if (voto === -1) negativos++;
  return {
    novedad: { ...novedad, VotosPositivos: positivos, VotosNegativos: negativos, MiVoto: voto === 0 ? null : voto },
    voto
  };
}

/** Mismo límite que la API (NestoAPI#520): se avisa antes de mandar. */
export const TAMANO_MAXIMO_IMAGEN = 2 * 1024 * 1024;
export const TIPOS_IMAGEN_ADMITIDOS = ['image/png', 'image/jpeg'];

/** null si la imagen vale; si no, el motivo (los mismos textos que la API). */
export function validarImagen(tipo: string, tamano: number): string | null {
  if (!TIPOS_IMAGEN_ADMITIDOS.includes((tipo || '').toLowerCase())) {
    return 'Solo se admiten imágenes PNG o JPEG.';
  }
  if (tamano > TAMANO_MAXIMO_IMAGEN) {
    return 'La imagen es demasiado grande (máximo 2 MB). Recorta solo la parte que importa.';
  }
  return null;
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

  /** NestoApp#188: 1 me gusta, -1 no me gusta, 0 quitar el voto. */
  public votar(idNovedad: number, voto: number): Observable<void> {
    return this.http.put<void>(`${Configuracion.API_URL}/Novedades/${idNovedad}/Voto`, { Voto: voto });
  }

  public leerComentarios(idNovedad: number): Observable<ComentarioNovedad[]> {
    return this.http.get<ComentarioNovedad[]>(`${Configuracion.API_URL}/Novedades/${idNovedad}/Comentarios`).pipe(
      map(comentarios => comentarios || [])
    );
  }

  public crearComentario(idNovedad: number, comentario: NuevoComentarioNovedad): Observable<ComentarioNovedad> {
    return this.http.post<ComentarioNovedad>(`${Configuracion.API_URL}/Novedades/${idNovedad}/Comentarios`, comentario);
  }

  /** Solo el autor (EsMio); a otro la API le da 403. */
  public borrarComentario(idComentario: number): Observable<void> {
    return this.http.delete<void>(`${Configuracion.API_URL}/Novedades/Comentarios/${idComentario}`);
  }

  /** La captura va con el JWT, así que no vale un <img src> a la URL: se baja como blob. */
  public leerImagenComentario(idComentario: number): Observable<Blob> {
    return this.http.get(`${Configuracion.API_URL}/Novedades/Comentarios/${idComentario}/Imagen`, { responseType: 'blob' });
  }
}
