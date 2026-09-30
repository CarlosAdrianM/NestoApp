/**
 * NestoApp#198 / NestoAPI#519 (Nesto#496): pasar a otro cliente un pedido que todavía no ha salido
 * (típico: el cliente se ha dado de alta en una ficha nueva y el pedido estaba en la vieja).
 * POST api/PedidosVenta/{empresa}/{numero}/CambiarCliente. La API recalcula todo (condiciones de
 * pago, CCC, IVA, vendedor, ruta, precios, portes...); la app solo enseña lo que ha cambiado.
 * No se hace con el PUT de siempre: copia el cliente sin recalcular y el trigger puede rechazarlo.
 */
export interface CambiarClientePedidoPeticion {
  Cliente: string;
  /** Vacío = el contacto principal del cliente nuevo. */
  Contacto: string;
  Usuario: string;
  CreadoSinPasarValidacion: boolean;
}

export interface CambiarClientePedidoRespuesta {
  Empresa: string;
  Numero: number;
  ClienteAnterior: string;
  ContactoAnterior: string;
  Cliente: string;
  Contacto: string;
  /** «Forma de pago: EFC → RCB», «Línea nueva: 62400003 Portes (5,00 €)»... */
  Cambios: string[];
}

/**
 * Solo se ofrece con el pedido guardado y ninguna línea con picking, en albarán o factura, o ya
 * facturada. Aun así la API tiene la última palabra (envíos, cobros con tarjeta, prepagos...).
 */
export function puedeCambiarClientePedido(pedido: { numero?: number; Lineas?: any[] } | null | undefined): boolean {
  if (!pedido || !pedido.numero) {
    return false;
  }
  return !(pedido.Lineas || []).some(l => (l.picking || 0) > 0 || (l.estado || 0) > 1 || !!l.yaFacturado);
}

function escaparHtml(texto: string): string {
  return (texto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const clienteContacto = (cliente: string, contacto: string) => `${(cliente || '').trim()}/${(contacto || '').trim()}`;

/** El resumen para la alerta (HTML escapado, un cambio por línea). */
export function mensajeCambiosCliente(respuesta: CambiarClientePedidoRespuesta): string {
  const cabecera = `Pedido ${respuesta.Numero}: del cliente ${clienteContacto(respuesta.ClienteAnterior, respuesta.ContactoAnterior)}` +
    ` al ${clienteContacto(respuesta.Cliente, respuesta.Contacto)}.`;
  const cambios = respuesta.Cambios || [];
  if (cambios.length === 0) {
    return escaparHtml(cabecera) + '<br><br>No ha cambiado nada más del pedido.';
  }
  return escaparHtml(cabecera) + '<br><br>' + cambios.map(c => escaparHtml(c) + '<br>').join('');
}
