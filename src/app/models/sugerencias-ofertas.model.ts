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
  /** NestoApp#229 / NestoAPI#626: ModificarLinea | AnadirLinea | null (solo informa). */
  Accion?: string | null;
  /** NestoApp#229: la oferta combinada (Id) a la que pertenece. */
  OfertaCombinada?: number | null;
  /** NestoApp#229: referencias válidas para el regalo, con stock; la primera es `Producto`. Null si no hay donde elegir. */
  Alternativas?: string[] | null;
}

export const TIPO_REGALO_COMBINADA_NO_APLICADO = 'RegaloCombinadaNoAplicado';
export const TIPO_AMPLIAR_CANTIDAD_COMBINADA = 'AmpliarCantidadCombinada';
export const ACCION_ANADIR_LINEA = 'AnadirLinea';

/**
 * NestoApp#229: el regalo que falta de una oferta combinada (otra referencia, al 100 %). Se añade
 * como unidades de oferta de ese producto, igual que la unidad gratis de un N+M.
 */
export function esAnadirRegaloCombinada(sugerencia: SugerenciaOferta): boolean {
  return !!sugerencia
    && sugerencia.Tipo === TIPO_REGALO_COMBINADA_NO_APLICADO
    && sugerencia.Accion === ACCION_ANADIR_LINEA
    && !!sugerencia.Producto
    && +sugerencia.CantidadRegalo > 0;
}

/** NestoApp#229: faltan unidades de lo que se paga; el regalo es de otra referencia, así que solo se suben las unidades. */
export function esAmpliarCantidadCombinada(sugerencia: SugerenciaOferta): boolean {
  return !!sugerencia && sugerencia.Tipo === TIPO_AMPLIAR_CANTIDAD_COMBINADA;
}

/**
 * Una sugerencia se puede aplicar de un toque cuando dice qué producto y cuántas unidades.
 * Las de importe de pedido (llegar a X €) solo informan: no hay una línea concreta que tocar.
 */
export function esAccionable(sugerencia: SugerenciaOferta): boolean {
  if (esAnadirRegaloCombinada(sugerencia)) {
    return true;
  }
  if (esAmpliarCantidadCombinada(sugerencia)) {
    return !!sugerencia.Producto && +sugerencia.CantidadSugerida > +sugerencia.CantidadActual;
  }
  return !!sugerencia
    && !!sugerencia.Producto
    && +sugerencia.CantidadSugerida > 0;
}

/**
 * NestoApp#211: el pedido ya alcanza un tramo de una oferta escalonada y la línea no lleva su
 * descuento. Lo que se aplica es `Descuento`; las unidades ya están (CantidadSugerida = CantidadActual).
 */
export function esDescuentoEscalonado(sugerencia: SugerenciaOferta): boolean {
  return !!sugerencia
    && sugerencia.Tipo === 'DescuentoNoAplicado'
    && sugerencia.OfertaEscalonada != null
    && +sugerencia.Descuento > 0;
}

/** Texto del plegable, que es lo único que se ve hasta que el vendedor lo abre. */
export function resumenSugerencias(sugerencias: SugerenciaOferta[]): string {
  const total = (sugerencias || []).length;
  if (total === 0) {
    return '';
  }
  return total === 1 ? '1 oferta sin aplicar' : `${total} ofertas sin aplicar`;
}
