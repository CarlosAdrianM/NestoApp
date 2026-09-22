/**
 * NestoApp#169 / NestoAPI#457: ofertas que el pedido podría aplicar y no está aplicando.
 * Toda la lógica (qué se sugiere y con qué texto) es del servidor: aquí no se replica ninguna
 * regla de ofertas ni se redactan mensajes, solo se pintan y se aplican. Los campos llegan en
 * PascalCase, como los serializa NestoAPI.
 */
export interface SugerenciaOferta {
  /** OfertaNoAplicada | AmpliarCantidad | RegaloNoAplicado | AmpliarImporte | DescuentoNoAplicado | AmpliarCantidadEscalonada */
  Tipo: string;
  Producto: string;
  /** Unidades cobradas que hay ahora en el pedido. */
  CantidadActual: number;
  /** Unidades cobradas que tiene que haber para que aplique. */
  CantidadSugerida: number;
  /** Unidades de regalo que se llevaría con la cantidad sugerida. */
  CantidadRegalo: number;
  /** Lo que falta para llegar al importe del regalo (0 en las de cantidad). */
  ImporteQueFalta: number;
  ImportePedido: number;
  Texto: string;
  Oferta?: number;
  Descuento: number;
  OfertaEscalonada?: number;
}

/**
 * Una sugerencia se puede aplicar de un toque cuando dice qué producto y cuántas unidades.
 * Las de importe de pedido (llegar a X €) solo informan: no hay una línea concreta que tocar.
 */
export function esAccionable(sugerencia: SugerenciaOferta): boolean {
  return !!sugerencia
    && !!sugerencia.Producto
    && +sugerencia.CantidadSugerida > 0;
}

/** Texto del plegable, que es lo único que se ve hasta que el vendedor lo abre. */
export function resumenSugerencias(sugerencias: SugerenciaOferta[]): string {
  const total = (sugerencias || []).length;
  if (total === 0) {
    return '';
  }
  return total === 1 ? '1 oferta sin aplicar' : `${total} ofertas sin aplicar`;
}
