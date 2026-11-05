/**
 * NestoApp#264 (gemela de NestoAPI#764): avisos NO bloqueantes que la API devuelve al grabar un pedido.
 * En el POST vienen en `PedidoVentaDTO.AvisosGrabacion`; en el PUT, en `RespuestaModificacionPedidoDTO.Avisos`
 * (misma forma). P. ej. «ClienteCierraDiaReparto»: «El cliente cierra el martes, que es su día de reparto por
 * nuestra ruta: envíelo por agencia o cambie el día.». PascalCase, como los serializa NestoAPI.
 */
export interface AvisoPedido {
  Tipo?: string | null;
  Mensaje?: string | null;
  Datos?: any;
}

/** Los mensajes, uno por párrafo; '' si no hay ninguno (o la API es anterior y no manda la lista). */
export function textoAvisosPedido(avisos: AvisoPedido[] | null | undefined): string {
  return (avisos || [])
    .map(a => (a?.Mensaje || '').toString().trim())
    .filter(m => !!m)
    .join('\n\n');
}
