/** NestoApp#193 / NestoAPI f0b42b1c: «Te han contestado en Novedades» y las @menciones (#194). */
export const TIPO_NOTIFICACION_NOVEDAD_COMENTARIO = 'NovedadComentario';

/**
 * A dónde lleva tocar una push (o el «Ver» del aviso con la app abierta), o null si a ningún sitio.
 * `aviso` distingue dos toques seguidos a la misma novedad: si la URL no cambia, el perfil no se entera.
 */
export function rutaDeNotificacion(datos: { [clave: string]: any } | null | undefined, aviso: number = Date.now()): string | null {
  if (!datos) {
    return null;
  }
  if (datos['ruta']) {
    return datos['ruta'] as string;
  }
  if (datos['tipo'] === TIPO_NOTIFICACION_NOVEDAD_COMENTARIO && datos['novedadId']) {
    const comentario = datos['comentarioId'] ? `&comentario=${datos['comentarioId']}` : '';
    return `/profile?novedad=${datos['novedadId']}${comentario}&aviso=${aviso}`;
  }
  return null;
}
