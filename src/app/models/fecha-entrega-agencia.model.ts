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
  /** NestoApp#266 / NestoAPI#606 (09/10): de dónde sale cada producto. Una API vieja no lo manda. */
  Desglose?: PartidaFechaEntregaAgencia[] | null;
}

/**
 * NestoApp#266 (gemela de Nesto#599) y #207 (NestoAPI#577): unidades de un producto que salen del mismo sitio el
 * mismo día. Origen: Picking, Algete, Kit, Tienda, EnCamino, Proveedor o SinStock.
 */
export interface PartidaFechaEntregaAgencia {
  Origen: string;
  Producto: string;
  Unidades: number;
  /** Solo Tienda: REI, ALC. */
  Tienda?: string | null;
  /** Solo Kit: el kit que se desmonta. */
  Kit?: string | null;
  /** Solo Tienda: cuándo suele llegar a Algete la reposición que lo trae (NestoAPI#577). */
  LlegaAAlgete?: string | null;
  /** Primer día en que puede salir a la agencia. Null = sin fecha. */
  PuedeSalirEl?: string | null;
  /** Solo Proveedor. */
  FechaPrevistaProveedor?: string | null;
  /** Solo con la prevista del proveedor vencida: el día que se ha supuesto que llega. */
  LlegadaSupuesta?: string | null;
  PedidoProveedor?: number | null;
  MotivoSinFecha?: string | null;
  ANotaDeEntrega?: boolean;
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

/** «hoy», «mañana» o «(el) jueves 15/10» (con el año si no es el de hoy), como Nesto. */
export function formatearDiaRelativo(fecha: string | null | undefined, hoy: Date, conArticulo: boolean): string {
  const dia = leerDia(fecha);
  if (!dia) {
    return '';
  }
  const hoyDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const diferencia = Math.round((dia.getTime() - hoyDia.getTime()) / 86400000);
  if (diferencia === 0) {
    return 'hoy';
  }
  if (diferencia === 1) {
    return 'mañana';
  }
  const dd = String(dia.getDate()).padStart(2, '0');
  const mm = String(dia.getMonth() + 1).padStart(2, '0');
  const anno = dia.getFullYear() === hoyDia.getFullYear() ? '' : `/${dia.getFullYear()}`;
  return `${conArticulo ? 'el ' : ''}${DIAS[dia.getDay()]} ${dd}/${mm}${anno}`;
}

function nombreTienda(codigo: string | null | undefined): string {
  switch ((codigo || '').trim().toUpperCase()) {
    case 'REI': return 'Reina';
    case 'ALC': return 'Alcobendas';
    case 'ALG': return 'Algete';
    default: return (codigo || '').trim() || 'una tienda';
  }
}

/**
 * NestoApp#266: la frase de una partida, con los mismos textos que Nesto (TextosFechaEntregaAgencia.FraseDetalle).
 * Lo que ya está en Algete o en picking no se explica (null). NestoApp#207: en las tiendas se dice también qué día
 * llega la reposición a Algete, si la API lo manda.
 */
export function fraseDetallePartida(p: PartidaFechaEntregaAgencia | null | undefined, hoy: Date): string | null {
  if (!p || !(p.Producto || '').trim() || !(+p.Unidades > 0)) {
    return null;
  }
  const una = +p.Unidades === 1;
  const n = una ? '' : 'n';
  const cuantas = `${p.Producto.trim()}: ${p.Unidades} ${una ? 'unidad' : 'unidades'}`;
  const saleEl = p.PuedeSalirEl ? ` y puede${n} salir ${formatearDiaRelativo(p.PuedeSalirEl, hoy, true)}` : '';
  switch (p.Origen) {
    case 'Kit':
      return `${cuantas} sale${n} desmontando el kit ${(p.Kit || '').trim()}.`;
    case 'Tienda': {
      const llega = p.LlegaAAlgete ? ` ${formatearDiaRelativo(p.LlegaAAlgete, hoy, true)}` : '';
      return `${cuantas} en ${nombreTienda(p.Tienda)}: llega${n} con la reposición${llega}${saleEl}.`;
    }
    case 'EnCamino':
      return `${cuantas} ya viene${n} de camino desde una tienda${saleEl}.`;
    case 'Proveedor': {
      const prevista = !p.FechaPrevistaProveedor ? ''
        : p.LlegadaSupuesta ? ` (la fecha prevista, ${formatearDiaRelativo(p.FechaPrevistaProveedor, hoy, false)}, ya pasó)`
        : ` (prevista ${formatearDiaRelativo(p.FechaPrevistaProveedor, hoy, true)})`;
      return `${cuantas} del proveedor${prevista}${saleEl}.`;
    }
    case 'SinStock':
      return (p.MotivoSinFecha || '').trim()
        ? `${cuantas} sin fecha: ${p.MotivoSinFecha.trim().replace(/\.+$/, '')}.`
        : `${cuantas} sin stock y sin fecha de llegada.`;
    default:
      return null; // Algete, picking u origen desconocido: no hay nada que explicar
  }
}

/** NestoApp#266: una frase por producto que no sale directamente de Algete. [] sin Desglose (API vieja). */
export function detallePorLinea(fecha: FechaEntregaAgencia | null | undefined, hoy: Date = new Date()): string[] {
  return (fecha?.Desglose || [])
    .map(p => fraseDetallePartida(p, hoy))
    .filter((frase): frase is string => !!frase);
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
