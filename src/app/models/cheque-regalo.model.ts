/**
 * NestoApp#222 (gemela de NestoAPI#593 c5): cheque regalo del cliente en una campaña activa.
 * GET api/ChequesRegalo/Cliente?empresa=&cliente= (404 = no tiene). PascalCase, como lo serializa NestoAPI.
 *
 * Para canjearlo basta una línea del producto del cheque, cantidad 1: el servidor la normaliza
 * (cantidad −1, precio = importe, IVA del producto) y es quien decide si llega al mínimo.
 */
export type EstadoChequeRegalo = 'Disponible' | 'EnPedido' | 'Canjeado' | 'Caducado' | 'Anulado' | 'PendienteDeActivar';

export interface ChequeRegaloCliente {
  Producto: string;
  /** Base imponible que descuenta. */
  Importe: number;
  /** Base de producto computable que tiene que superar el pedido. */
  MinimoCanje: number;
  CanjeHasta: string;
  PrefijosNombreExcluidosMinimo: string[];
  GruposExcluidosMinimo: string[];
  Estado: EstadoChequeRegalo;
  /** Solo true con «Disponible». */
  SePuedeUsar: boolean;
  /** Frase lista para enseñar al vendedor. */
  Mensaje: string;
  PedidoCanje: number | null;
  TextoLinea: string;
}

const redondear = (valor: number) => Math.round(valor * 100) / 100;
const normalizar = (texto: any) => (texto ?? '').toString().trim().toUpperCase();

export function esLineaChequeRegalo(linea: { producto?: any }, cheque: ChequeRegaloCliente | null): boolean {
  return !!cheque && normalizar(linea?.producto) === normalizar(cheque.Producto);
}

/**
 * Aproximación local de la base que cuenta para el mínimo (manda el servidor): sin peluquería, sin
 * los «PACK 26» y sin la propia línea del cheque. Las cuentas contables y ficticios no llegan a la plantilla.
 */
export function baseComputableCheque(lineas: any[], cheque: ChequeRegaloCliente): number {
  const grupos = (cheque.GruposExcluidosMinimo || []).map(normalizar);
  const prefijos = (cheque.PrefijosNombreExcluidosMinimo || []).map(normalizar);
  const base = (lineas || [])
    .filter(l => l && l.producto && +l.cantidad > 0)
    .filter(l => !esLineaChequeRegalo(l, cheque))
    .filter(l => !grupos.includes(normalizar(l.grupo)))
    .filter(l => !prefijos.some(p => normalizar(l.texto).startsWith(p)))
    .reduce((suma, l) => suma + (+l.cantidad) * (+l.precio || 0) * (1 - (+l.descuento || 0)), 0);
  return redondear(base);
}

/** Lo que falta para pasar del mínimo («más de 250 €»): 0 si ya lo supera. */
export function faltaParaMinimoCheque(baseComputable: number, cheque: ChequeRegaloCliente): number {
  if (baseComputable > cheque.MinimoCanje) {
    return 0;
  }
  return redondear(cheque.MinimoCanje - baseComputable + 0.01);
}
