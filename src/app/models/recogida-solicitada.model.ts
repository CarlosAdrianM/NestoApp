/**
 * NestoApp#259 / NestoAPI#855 (gemela Nesto#635): el vendedor pide desde la app una nota de recogida («recoged el aparato X
 * para reparar») y el almacén la confirma o la rechaza en Nesto. La recoge el reparto (solo contactos de ruta propia) o el
 * propio vendedor («la recojo yo»): entonces, ya confirmada, enseña `CodigoDocumento` (NR{pedido}) como Code128 al llegar a Algete.
 *
 * POST   api/NotasEntrega/Recogidas/Solicitudes                       → 201; 400 / 403 / 404 / 409 / 503 con { Message }
 * GET    api/NotasEntrega/Recogidas/Solicitudes?empresa=&cliente=&contacto= → las del cliente, la más reciente primero (máx. 50)
 * DELETE api/NotasEntrega/Recogidas/Solicitudes/{id}?motivo=          → 200 «Anulada»; 403 ya en marcha; 409 resuelta
 */

export type EstadoRecogida = 'Solicitada' | 'Confirmada' | 'EnReparto' | 'Recogida' | 'Rechazada' | 'Anulada';
export type QuienRecoge = 'Reparto' | 'Vendedor';

export interface RecogidaSolicitada {
  Id: number;
  Empresa: string;
  Cliente: string;
  Contacto: string;
  NombreCliente?: string | null;
  Direccion?: string | null;
  CodPostal?: string | null;
  Poblacion?: string | null;
  Telefono?: string | null;
  Ruta?: string | null;
  Texto: string;
  Bultos: number;
  FacturaOriginal: string | null;
  QuienRecoge: QuienRecoge | string;
  Vendedor?: string | null;
  UsuarioSolicita?: string | null;
  FechaSolicitud: string;
  Estado: EstadoRecogida | string;
  PedidoNota: number | null;
  /** «NR{pedido}», ya confirmada. */
  CodigoDocumento: string | null;
  CodigosBultos: string[] | null;
  UsuarioResuelve?: string | null;
  FechaResolucion?: string | null;
  MotivoRechazo: string | null;
  UsuarioAnula?: string | null;
  FechaAnulacion?: string | null;
  MotivoAnulacion?: string | null;
}

export interface SolicitarRecogida {
  Empresa?: string;
  Cliente: string;
  Contacto: string;
  Texto: string;
  Bultos?: number;
  FacturaOriginal?: string | null;
  QuienRecoge?: QuienRecoge;
}

const TEXTOS_ESTADO: { [estado: string]: string } = {
  Solicitada: 'Pendiente de confirmar',
  Confirmada: 'Confirmada',
  EnReparto: 'En reparto',
  Recogida: 'Recogida',
  Rechazada: 'Rechazada',
  Anulada: 'Anulada'
};

export function textoEstadoRecogida(estado: string | null | undefined): string {
  const e = (estado || '').trim();
  return TEXTOS_ESTADO[e] || e;
}

/** Sin tocar la paleta: verde lo terminado, rojo lo rechazado, amarillo lo que espera al almacén. */
export function colorEstadoRecogida(estado: string | null | undefined): string {
  switch ((estado || '').trim()) {
    case 'Solicitada': return 'warning';
    case 'Confirmada':
    case 'EnReparto': return 'primary';
    case 'Recogida': return 'success';
    case 'Rechazada': return 'danger';
    default: return 'medium';
  }
}

/** «La recoge el reparto · 1 bulto» / «La recoge usted · 3 bultos · factura NV26/001234». */
export function textoRecogida(recogida: RecogidaSolicitada | null | undefined): string {
  if (!recogida) {
    return '';
  }
  const bultos = +(recogida.Bultos || 1);
  const partes = [
    recogida.QuienRecoge === 'Vendedor' ? 'La recoge usted' : 'La recoge el reparto',
    `${bultos} ${bultos === 1 ? 'bulto' : 'bultos'}`
  ];
  const factura = (recogida.FacturaOriginal || '').trim();
  if (factura) {
    partes.push(`factura ${factura}`);
  }
  return partes.join(' · ');
}

/** Quien la pidió la puede anular mientras esté pendiente o confirmada sin empezar (después, 403). */
export function puedeAnularRecogida(recogida: RecogidaSolicitada | null | undefined): boolean {
  return recogida?.Estado === 'Solicitada' || recogida?.Estado === 'Confirmada';
}

/** «La recojo yo» ya confirmada: el código NR se enseña como código de barras para que lo lean en Algete. */
export function tieneCodigoParaEnsenar(recogida: RecogidaSolicitada | null | undefined): boolean {
  return !!recogida && recogida.QuienRecoge === 'Vendedor' && recogida.Estado === 'Confirmada' && !!(recogida.CodigoDocumento || '').trim();
}

/** Las que no se han resuelto todavía: mientras haya una, la API no deja pedir otra para el contacto (409). */
export function recogidasSinResolver(lista: RecogidaSolicitada[] | null | undefined): RecogidaSolicitada[] {
  return (lista || []).filter(r => !!r && ['Solicitada', 'Confirmada', 'EnReparto'].includes(r.Estado));
}

/** Lo mismo que valida la API, para no mandar lo que va a rechazar. '' si está bien. */
export function solicitudValida(solicitud: SolicitarRecogida): string {
  const texto = (solicitud?.Texto || '').trim();
  if (!texto) {
    return 'Diga qué hay que recoger.';
  }
  if (texto.length > 500) {
    return 'El texto no puede pasar de 500 caracteres.';
  }
  const bultos = Number(solicitud.Bultos ?? 1);
  if (!Number.isInteger(bultos) || bultos < 1 || bultos > 999) {
    return 'El número de bultos tiene que estar entre 1 y 999.';
  }
  return '';
}

/** 503 (sin el script) o 404 sin mensaje (API anterior): aún no está disponible. Si no, el `Message` de la API. */
export function mensajeErrorRecogida(error: any): string {
  const status = error?.status;
  const cuerpo = error?.error;
  const mensaje = typeof cuerpo === 'string' ? cuerpo : (cuerpo?.Message || cuerpo?.message || '');
  if (status === 0) {
    return 'No hay conexión con el servidor. Inténtelo otra vez en un rato.';
  }
  if (status === 503 || (status === 404 && (!mensaje || /No HTTP resource/i.test(mensaje)))) {
    return 'Las recogidas todavía no están disponibles en el servidor.';
  }
  return mensaje || 'No se ha podido completar. Inténtelo otra vez en un rato.';
}
