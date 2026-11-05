/**
 * NestoApp#217 (corte 2, gemela de NestoAPI#613): cupones de descuento del cliente.
 * GET api/Clientes/{empresa}/{cliente}/Cupones (por defecto, los Activos y Emitidos, primero los que
 * se pueden usar). PascalCase, como los serializa NestoAPI.
 *
 * Para aplicarlo basta una línea con `CodigoCupon`: el servidor pone el producto, la cantidad −1, el
 * precio (el importe sin IVA del cliente), el texto y el IVA, y comprueba las reglas (uno por pedido,
 * fechas, pedido mínimo de productos…), con un mensaje claro si no se puede.
 */
export type EstadoCupon = 'Emitido' | 'Activo' | 'Usado' | 'Anulado' | 'Caducado';

export interface CuponCliente {
  Id: number;
  Codigo: string;
  Empresa: string;
  Cliente: string;
  Contacto?: string | null;
  /** IVA incluido. */
  Importe: number;
  /** De productos, IVA incluido. NestoApp#256 / NestoAPI#613: lo define cada evento (0 = sin mínimo); ya no es 2 × Importe. */
  PedidoMinimo: number;
  Origen: 'Evento' | 'Manual' | string;
  Evento?: string | null;
  Motivo?: string | null;
  ValidoDesde: string;
  Caducidad: string;
  Estado: EstadoCupon;
  /** Solo true con «Activo». */
  SePuedeUsar: boolean;
  /** Frase lista para enseñar al vendedor. */
  Mensaje: string;
  /** CUPONEVENTO */
  Producto: string;
  TextoLinea: string;
  UsadoEnPedido?: number | null;
}

const normalizar = (texto: any) => (texto ?? '').toString().trim().toUpperCase();

/** La línea de un cupón (al editar un pedido que ya lo lleva). */
export function esLineaCupon(linea: { producto?: any }, cupones: CuponCliente[]): boolean {
  const producto = normalizar(linea?.producto);
  return !!producto && (cupones || []).some(c => normalizar(c.Producto) === producto);
}

/**
 * NestoApp#256: la condición de pedido mínimo del cupón aplicado, con lo que diga la API (`PedidoMinimo`), nunca
 * calculada aquí. Con 0 (o sin dato) no se habla de mínimo.
 */
export function textoPedidoMinimoCupon(cupon: CuponCliente | null | undefined, formatearEuros: (importe: number) => string): string {
  if (!cupon) {
    return '';
  }
  const minimo = +(cupon.PedidoMinimo || 0);
  if (minimo > 0) {
    return `El pedido tiene que llevar al menos ${formatearEuros(minimo)} de productos (IVA incluido, sin contar cursos ni portes). Al guardar lo comprueba el servidor.`;
  }
  return 'Vale para cualquier pedido de productos, sin pedido mínimo (no se aplica a cursos ni portes). Al guardar lo comprueba el servidor.';
}

export function cuponesUsables(cupones: CuponCliente[]): CuponCliente[] {
  return (cupones || []).filter(c => c?.SePuedeUsar && !!c.Codigo);
}
