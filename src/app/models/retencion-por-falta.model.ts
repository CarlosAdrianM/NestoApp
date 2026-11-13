/**
 * NestoApp#279 / NestoAPI#858 (punto 4): un pedido «todo junto» al que, al prepararlo, le falta un producto de pago queda
 * retenido en el packing hasta que el vendedor decida: servir lo que hay (sale sin lo que falta, que queda pendiente) o
 * esperar a tenerlo completo. Si nadie contesta en el plazo, la API aplica «esperar».
 *
 * GET  api/PedidosVenta/RetenidosPorFalta                                  → los Pendiente que puede decidir quien pregunta
 * POST api/PedidosVenta/{empresa}/{pedido}/RetencionPorFalta/Decidir       { Decision } → 200 con el mismo DTO; 400/403/409 con Message
 */

export type EstadoRetencionPorFalta = 'Pendiente' | 'ServirLoQueHay' | 'Esperar';
export type DecisionRetencionPorFalta = 'ServirLoQueHay' | 'Esperar';

export interface RetencionPorFalta {
  Id: number;
  Empresa: string;
  Pedido: number;
  Picking: number;
  Cliente: string;
  Contacto: string;
  NombreCliente: string;
  /** Lo que falta, ya en texto. */
  Productos: string;
  Fecha: string;
  /** Hasta cuándo puede decidir el vendedor (hora local, sin zona). */
  Plazo: string;
  Estado: EstadoRetencionPorFalta | string;
  UsuarioDecision: string | null;
  FechaDecision: string | null;
  /** Se decidió «esperar» porque venció el plazo. */
  PorPlazo: boolean;
  PuedeDecidir: boolean;
  Mensaje: string | null;
}

const dosCifras = (n: number) => String(n).padStart(2, '0');

/** «antes de las 12:30» (hoy) o «antes del 14/11 a las 09:05». */
export function textoPlazoRetencionPorFalta(plazo: string | null | undefined, hoy: Date = new Date()): string {
  if (!plazo) {
    return '';
  }
  // Sin zona: JavaScript la lee como hora local, que es como la manda la API.
  const fecha = new Date(plazo.toString().replace(/Z$/, ''));
  if (isNaN(fecha.getTime())) {
    return '';
  }
  const hora = `${dosCifras(fecha.getHours())}:${dosCifras(fecha.getMinutes())}`;
  const mismoDia = fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth() && fecha.getDate() === hoy.getDate();
  return mismoDia ? `antes de las ${hora}` : `antes del ${dosCifras(fecha.getDate())}/${dosCifras(fecha.getMonth() + 1)} a las ${hora}`;
}

/** La banda del pedido: «Retenido por una falta (41234 CHAMPÚ). Decida antes de las 12:30; si no, se esperará a tenerlo completo.» */
export function textoRetencionPorFalta(retencion: RetencionPorFalta | null | undefined, hoy: Date = new Date()): string {
  if (!retencion) {
    return '';
  }
  const productos = (retencion.Productos || '').trim();
  const plazo = textoPlazoRetencionPorFalta(retencion.Plazo, hoy);
  const falta = productos ? `Retenido por una falta (${productos}).` : 'Retenido por una falta.';
  return plazo ? `${falta} Decida ${plazo}; si no, se esperará a tenerlo completo.` : falta;
}

/** La retención Pendiente de un pedido, o null. */
export function retencionPendienteDelPedido(lista: RetencionPorFalta[] | null | undefined, empresa: string, pedido: number): RetencionPorFalta | null {
  const emp = (empresa || '1').toString().trim();
  return (lista || []).find(r => !!r && (r.Empresa || '1').toString().trim() === emp && +r.Pedido === +pedido && r.Estado === 'Pendiente') || null;
}

/** Las Pendiente, del plazo más cercano al más lejano. */
export function retencionesPendientes(lista: RetencionPorFalta[] | null | undefined): RetencionPorFalta[] {
  return (lista || [])
    .filter(r => !!r && r.Estado === 'Pendiente')
    .sort((a, b) => (a.Plazo || '').localeCompare(b.Plazo || ''));
}

/** El aviso de la lista de pedidos: «1 pedido retenido por una falta: decida antes de las 12:30». */
export function textoAvisoRetenidosPorFalta(lista: RetencionPorFalta[] | null | undefined, hoy: Date = new Date()): string {
  const pendientes = retencionesPendientes(lista);
  if (pendientes.length === 0) {
    return '';
  }
  const plazo = textoPlazoRetencionPorFalta(pendientes[0].Plazo, hoy);
  if (pendientes.length === 1) {
    return `1 pedido retenido por una falta${plazo ? `: decida ${plazo}` : ''}`;
  }
  return `${pendientes.length} pedidos retenidos por una falta${plazo ? `: el primero, ${plazo}` : ''}`;
}
