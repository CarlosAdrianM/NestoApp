/**
 * NestoApp#215 (gemela de NestoAPI#606): qué día entregamos el pedido a la agencia. Es un campo
 * calculado (cambia con el stock, las reposiciones, el modo…) y, en el detalle, también la fecha
 * que se prometió al crear el pedido. PascalCase, como lo serializa NestoAPI. Fechas sin hora.
 *
 * POST api/PedidosVenta/FechaEntregaAgencia (plantilla) y GET api/PedidosVenta/{empresa}/{numero}/FechaEntregaAgencia.
 */
export interface FechaEntregaAgencia {
  PrimeraEntrega: string | null;
  EntregaCompleta: string | null;
  /** La que aplica. Null = sin fecha (falta de proveedor o sobre pedido). */
  FechaEntregaAgencia: string | null;
  /** "Primera" o "Completa". */
  Aplica: string;
  Entregas: string[];
  /** Por qué, en castellano. */
  Motivo: string | null;
  /** Null en la plantilla. */
  FechaPrometida: string | null;
  /** Aviso para la plantilla (no es un error). Una API sin la propiedad no lo manda. */
  Aviso?: string | null;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** «2026-10-15T00:00:00» → día local, sin que la zona horaria lo mueva. */
function leerDia(fecha: string | null | undefined): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  return partes ? new Date(+partes[1], +partes[2] - 1, +partes[3]) : null;
}

/** «jueves 15/10» */
export function formatearDiaEntrega(fecha: string | null | undefined): string {
  const dia = leerDia(fecha);
  if (!dia) {
    return '';
  }
  const dd = String(dia.getDate()).padStart(2, '0');
  const mm = String(dia.getMonth() + 1).padStart(2, '0');
  return `${DIAS[dia.getDay()]} ${dd}/${mm}`;
}

export function mismoDia(a: string | null | undefined, b: string | null | undefined): boolean {
  return (a || '').substring(0, 10) === (b || '').substring(0, 10);
}

/** La frase principal: «Se entrega a la agencia el jueves 15/10». */
export function textoFechaEntregaAgencia(fecha: FechaEntregaAgencia | null): string {
  if (!fecha) {
    return '';
  }
  if (!fecha.FechaEntregaAgencia) {
    return 'Todavía no hay fecha de entrega a la agencia';
  }
  const parte = fecha.Aplica === 'Primera' && fecha.EntregaCompleta && !mismoDia(fecha.EntregaCompleta, fecha.FechaEntregaAgencia)
    ? ` (lo que falta, el ${formatearDiaEntrega(fecha.EntregaCompleta)})`
    : '';
  return `Se entrega a la agencia el ${formatearDiaEntrega(fecha.FechaEntregaAgencia)}${parte}`;
}

/** En el detalle: la prometida, solo si la hay y no coincide con la de ahora. */
export function textoFechaPrometida(fecha: FechaEntregaAgencia | null): string {
  if (!fecha?.FechaPrometida || mismoDia(fecha.FechaPrometida, fecha.FechaEntregaAgencia)) {
    return '';
  }
  return `Al crear el pedido se prometió el ${formatearDiaEntrega(fecha.FechaPrometida)}`;
}
