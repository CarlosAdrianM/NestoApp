/**
 * NestoApp#254 / NestoAPI#698: retener un pedido «hasta nuevo aviso» (o hasta una fecha de revisión).
 * Pasa al modo de servicio 5, que no sale en el picking, sin tocar la fecha de entrega. Retienen y
 * liberan el vendedor y el almacén. Los nombres se serializan tal cual (sin camelCase).
 */
export interface RetencionPedido {
  Id: number;
  Empresa: string;
  Pedido: number;
  Motivo: string;
  /** Null = hasta nuevo aviso. */
  HastaFecha: string | null;
  ModoServicioAnterior: number | null;
  /** Con dominio («NUEVAVISION\Alfredo»), como lo resuelve el servidor. */
  Usuario: string;
  Fecha: string;
  Liberado: string | null;
  UsuarioLiberacion: string | null;
  MotivoLiberacion: string | null;
  UltimoRecordatorio: string | null;
}

/** GET api/PedidosVenta/Retenidos: una retención viva con el cliente y el vendedor del pedido. */
export interface PedidoRetenidoListado extends RetencionPedido {
  Cliente: string;
  NombreCliente: string;
  Vendedor: string;
}

export interface RetenerPedidoPeticion {
  Motivo: string;
  /** yyyy-MM-dd o null = hasta nuevo aviso. */
  HastaFecha: string | null;
  Usuario?: string;
}

/** «Alfredo» a partir de «NUEVAVISION\Alfredo». */
export function nombreUsuarioSinDominio(usuario: string | null | undefined): string {
  const limpio = (usuario || '').trim();
  if (!limpio) {
    return 'alguien';
  }
  const barra = limpio.lastIndexOf('\\');
  return barra >= 0 && barra < limpio.length - 1 ? limpio.substring(barra + 1) : limpio;
}

function fechaCorta(fecha: string | null | undefined): string {
  if (!fecha) {
    return '';
  }
  const d = new Date(fecha);
  if (isNaN(d.getTime())) {
    return fecha;
  }
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** «Retenido por Alfredo desde el 22/10/2026 hasta el 15/11/2026: motivo» (como TextosRetencion.Descripcion de la API). */
export function textoRetencion(retencion: RetencionPedido | null | undefined): string {
  if (!retencion) {
    return '';
  }
  const hasta = retencion.HastaFecha ? `hasta el ${fechaCorta(retencion.HastaFecha)}` : 'hasta nuevo aviso';
  const motivo = (retencion.Motivo || '').trim();
  return `Retenido por ${nombreUsuarioSinDominio(retencion.Usuario)} desde el ${fechaCorta(retencion.Fecha)} ${hasta}${motivo ? ': ' + motivo : ''}`;
}

/** La fecha «Hasta el» del diálogo, en yyyy-MM-dd; null si se deja vacía. Tiene que ser posterior a hoy (lo comprueba la API). */
export function hastaFechaParaApi(valor: string | null | undefined): string | null {
  const texto = (valor || '').toString().trim();
  return texto.length >= 10 ? texto.substring(0, 10) : null;
}

/** Los números de los pedidos retenidos ahora mismo, para marcarlos en una lista. */
export function numerosRetenidos(retenidos: PedidoRetenidoListado[] | null | undefined): Set<number> {
  return new Set((retenidos || []).filter(r => r && !r.Liberado).map(r => +r.Pedido));
}
