/** NestoApp#193 / NestoAPI f0b42b1c: «Te han contestado en Novedades» y las @menciones (#194). */
export const TIPO_NOTIFICACION_NOVEDAD_COMENTARIO = 'NovedadComentario';
/** NestoApp#236 / NestoAPI#666: la agencia ha puesto una incidencia en un envío. */
export const TIPO_NOTIFICACION_INCIDENCIA_ENVIO_AGENCIA = 'IncidenciaEnvioAgencia';
/** NestoApp#247 / NestoAPI#692: se ha anunciado un evento nuevo (trae eventoId). */
export const TIPO_NOTIFICACION_ANUNCIO_EVENTO = 'AnuncioEvento';
/** NestoApp#254 / NestoAPI#698: un pedido retenido se ha liberado solo o sigue retenido (trae pedido). */
export const TIPO_NOTIFICACION_PEDIDO_RETENIDO = 'PedidoRetenido';
/** NestoApp#267 / NestoAPI#699: la agencia ha devuelto un envío: ¿el cliente lo sigue queriendo? (trae envio, pedido, cliente). */
export const TIPO_NOTIFICACION_DEVOLUCION_ENVIO_AGENCIA = 'DevolucionEnvioAgencia';
/** NestoApp#274 / NestoAPI#623: ha entrado un lead de campaña, o lleva el plazo sin llamar (traen empresa, cliente, contacto). */
export const TIPO_NOTIFICACION_LEAD_NUEVO = 'LeadNuevo';
export const TIPO_NOTIFICACION_LEAD_SIN_LLAMAR = 'LeadSinLlamar';
/** Los avisos que, sin pedido, abren la ficha del cliente. */
const TIPOS_QUE_ABREN_EL_CLIENTE = [TIPO_NOTIFICACION_INCIDENCIA_ENVIO_AGENCIA, TIPO_NOTIFICACION_LEAD_NUEVO, TIPO_NOTIFICACION_LEAD_SIN_LLAMAR];

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
  // NestoApp#247: el anuncio de un evento abre su ficha (solo lectura), para poder ofrecérselo al cliente.
  const eventoId = (datos['eventoId'] ?? '').toString().trim();
  if (datos['tipo'] === TIPO_NOTIFICACION_ANUNCIO_EVENTO && /^\d+$/.test(eventoId)) {
    return `/evento?id=${eventoId}&aviso=${aviso}`;
  }
  // NestoApp#267: el envío devuelto abre su pantalla de decisión (trae pedido, pero manda el envío). Antes de la regla del pedido.
  const envio = (datos['envio'] ?? '').toString().trim();
  if (datos['tipo'] === TIPO_NOTIFICACION_DEVOLUCION_ENVIO_AGENCIA && /^\d+$/.test(envio)) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    return `/envio-devuelto?empresa=${encodeURIComponent(empresa)}&envio=${envio}&aviso=${aviso}`;
  }
  // NestoApp#202 / NestoAPI#555: regla genérica, como en Nesto: cualquier aviso que lleve el dato
  // «pedido» abre ese pedido (el de coger picking con importe, el retenido que se libera (#254) y los que vengan).
  const pedido = (datos['pedido'] ?? '').toString().trim();
  if (/^\d+$/.test(pedido)) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    return `/pedido-venta?empresa=${encodeURIComponent(empresa)}&numero=${pedido}`;
  }
  // Un envío sin pedido, o un lead (#274): la ficha del cliente. Si la push no trae contacto, el 0 es el principal.
  const cliente = (datos['cliente'] ?? '').toString().trim();
  if (TIPOS_QUE_ABREN_EL_CLIENTE.includes(datos['tipo']) && cliente) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    const contacto = (datos['contacto'] ?? '').toString().trim() || '0';
    return `/cliente?empresa=${encodeURIComponent(empresa)}&cliente=${encodeURIComponent(cliente)}&contacto=${encodeURIComponent(contacto)}`;
  }
  return null;
}
