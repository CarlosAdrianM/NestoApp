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
/** NestoApp#259 / NestoAPI#855: la recogida que pidió el vendedor se ha confirmado o rechazado, nadie la contesta o se ha anulado. */
export const TIPOS_NOTIFICACION_RECOGIDA_SOLICITADA = ['RecogidaSolicitadaResuelta', 'RecogidaSolicitadaSinRespuesta', 'RecogidaSolicitadaAnulada',
  // NestoApp#290 (punto 5 de recogidas, 19/11/26): el repartidor no la recogió, o la recogió con un comentario.
  'RecogidaSolicitadaNoRecogida', 'RecogidaSolicitadaComentario'];
/** NestoApp#279 / NestoAPI#858: vence el plazo de un «todo junto» retenido por una falta y se espera (trae pedido: abre el pedido). */
export const TIPO_NOTIFICACION_PEDIDO_RETENIDO_POR_FALTA_ESPERAR = 'PedidoRetenidoPorFaltaEsperar';
/**
 * NestoApp#287 / NestoAPI (caso 931007): Almacén ha contestado si lo añadido a un pedido en preparación entra en el mismo envío
 * (estado Entra / NoEntra / SinRespuesta; trae pedido y, si lo añadido ha pasado a otro, pedidoNuevo: abre ese).
 */
export const TIPO_NOTIFICACION_AMPLIACION_PEDIDO_EN_PREPARACION = 'AmpliacionPedidoEnPreparacion';
/** NestoApp#287 (sugerencia 1340): un pedido «junto con lo pendiente» lleva 15 días esperando (trae pedido: abre el pedido). */
export const TIPO_NOTIFICACION_PEDIDO_JUNTO_CON_PENDIENTE_ESPERANDO = 'PedidoJuntoConPendienteEsperando';
/** NestoApp#290 / NestoAPI#880: faltó algún bulto en una entrega del reparto propio (trae envio y, si lo hay, pedido: abre el pedido). */
export const TIPO_NOTIFICACION_ENTREGA_INCOMPLETA_REPARTO = 'EntregaIncompletaReparto';
/** NestoApp#291 / NestoAPI#885: el cliente no ha asistido al curso de un cupón adelantado por excepción (abre el cliente). */
export const TIPO_NOTIFICACION_CUPON_ADELANTADO_SIN_ASISTIR = 'CuponAdelantadoSinAsistir';
/**
 * NestoApp#280/#290 (Novedades 1258): han autorizado o denegado el pedido que el vendedor pidió que le crearan (trae id, estado
 * y, si se autorizó, pedido: abre el pedido creado; denegado, la solicitud con su motivo).
 */
export const TIPO_NOTIFICACION_AUTORIZACION_PEDIDO_RESUELTA = 'AutorizacionPedidoResuelta';
/** Los avisos que, sin pedido, abren la ficha del cliente. */
const TIPOS_QUE_ABREN_EL_CLIENTE = [TIPO_NOTIFICACION_INCIDENCIA_ENVIO_AGENCIA, TIPO_NOTIFICACION_LEAD_NUEVO, TIPO_NOTIFICACION_LEAD_SIN_LLAMAR,
  TIPO_NOTIFICACION_CUPON_ADELANTADO_SIN_ASISTIR];

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
  // NestoApp#259: las recogidas solicitadas abren la pantalla de recogidas de ese cliente (con el código NR, si la recoge él).
  const clienteRecogida = (datos['cliente'] ?? '').toString().trim();
  if (TIPOS_NOTIFICACION_RECOGIDA_SOLICITADA.includes(datos['tipo']) && clienteRecogida) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    const contacto = (datos['contacto'] ?? '').toString().trim() || '0';
    return `/recogidas?empresa=${encodeURIComponent(empresa)}&cliente=${encodeURIComponent(clienteRecogida)}&contacto=${encodeURIComponent(contacto)}&aviso=${aviso}`;
  }
  // NestoApp#287: si lo añadido a un pedido en preparación ha acabado en un pedido nuevo, se abre ese (lo añadido está ahí).
  const pedidoNuevo = (datos['pedidoNuevo'] ?? '').toString().trim();
  if (datos['tipo'] === TIPO_NOTIFICACION_AMPLIACION_PEDIDO_EN_PREPARACION && /^\d+$/.test(pedidoNuevo)) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    return `/pedido-venta?empresa=${encodeURIComponent(empresa)}&numero=${pedidoNuevo}`;
  }
  // NestoApp#202 / NestoAPI#555: regla genérica, como en Nesto: cualquier aviso que lleve el dato
  // «pedido» abre ese pedido (el de coger picking con importe, el retenido que se libera (#254) y los que vengan).
  const pedido = (datos['pedido'] ?? '').toString().trim();
  if (/^\d+$/.test(pedido)) {
    const empresa = (datos['empresa'] ?? '').toString().trim() || '1';
    return `/pedido-venta?empresa=${encodeURIComponent(empresa)}&numero=${pedido}`;
  }
  // NestoApp#280/#290: una autorización denegada (sin pedido) abre la solicitud, con el motivo.
  const autorizacion = (datos['id'] ?? '').toString().trim();
  if (datos['tipo'] === TIPO_NOTIFICACION_AUTORIZACION_PEDIDO_RESUELTA && /^\d+$/.test(autorizacion)) {
    return `/autorizaciones-pedido?id=${autorizacion}&aviso=${aviso}`;
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
