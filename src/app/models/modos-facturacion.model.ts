/**
 * NestoApp#197 / NestoAPI#542 (Nesto#493): el modo de facturación del pedido, que dice CUÁNDO se
 * factura (el modo de servicio dice cuándo sale) y sustituye a la casilla «Mantener junto».
 * Réplica de Constantes.Pedidos.ModosFacturacion de NestoAPI.
 *
 * Contrato con la API:
 * - Al leer, `modoFacturacion` siempre viene con valor.
 * - Al guardar, la API valida el modo SIEMPRE que va informado; `null` nunca se rechaza (deriva de
 *   `mantenerJunto`: true → 2; false → conserva un 3 guardado o pone 1). Por eso solo se manda el
 *   modo cuando el vendedor lo ha elegido, y siempre con su `mantenerJunto` coherente.
 * - El 400 de modo no permitido es texto plano: se enseña tal cual y se vuelve a pedir la sugerencia.
 */

export const MODOS_FACTURACION = {
  /** Se factura cada entrega (mantenerJunto = false). */
  POR_ENTREGAS: 1,
  /** Se factura cuando se ha entregado todo el pedido (mantenerJunto = true). */
  AL_COMPLETAR: 2,
  /** Se factura todo en la primera entrega y lo pendiente sale después en una nota de entrega. */
  TODO_AHORA: 3
};

export interface ModoFacturacionItem {
  codigo: number;
  nombre: string;
}

/** Los nombres son contrato con ModosFacturacion.Nombre de la API. */
export const LISTA_MODOS_FACTURACION: ModoFacturacionItem[] = [
  { codigo: MODOS_FACTURACION.POR_ENTREGAS, nombre: 'Por entregas' },
  { codigo: MODOS_FACTURACION.AL_COMPLETAR, nombre: 'Al completar el pedido' },
  { codigo: MODOS_FACTURACION.TODO_AHORA, nombre: 'Todo ahora, lo pendiente se entrega después' }
];

/** El aviso fijo que se enseña cuando se elige el 3 (como en Nesto). */
export const AVISO_TODO_AHORA = 'Se factura todo ahora; si el pedido no llega al mínimo de portes pagados, se cobrarán portes.';

/** PascalCase, como lo serializa NestoAPI (igual que ModoServicioSugerido). */
export interface ModoFacturacionPermitido {
  Modo: number;
  Nombre: string;
  Permitido: boolean;
  Motivo: string | null;
}

export interface ModoFacturacionSugerido {
  Modo: number;
  Nombre: string;
  Motivo: string;
  ModosPermitidos: number[];
  Modos: ModoFacturacionPermitido[];
}

export function nombreModoFacturacion(modo: number): string {
  const item = LISTA_MODOS_FACTURACION.find(m => m.codigo === modo);
  return item ? item.nombre : `Modo ${modo}`;
}

/** El modo que rige: el que venga o, si no hay, el que se deriva de mantenerJunto. */
export function modoFacturacionDerivado(modo: number | null | undefined, mantenerJunto: boolean): number {
  if (modo) {
    return modo;
  }
  return mantenerJunto ? MODOS_FACTURACION.AL_COMPLETAR : MODOS_FACTURACION.POR_ENTREGAS;
}

/** La regla vive en el servidor: sin respuesta (o sin mencionar ese modo) se deja elegir. */
export function esModoFacturacionPermitido(modos: ModoFacturacionPermitido[] | null | undefined, modo: number): boolean {
  const encontrado = (modos || []).find(m => m.Modo === modo);
  return !encontrado || encontrado.Permitido;
}

/** Una nota de entrega no admite ningún modo: se bloquea el selector entero. */
export function selectorFacturacionBloqueado(sugerencia: ModoFacturacionSugerido | null | undefined): boolean {
  return !!sugerencia && Array.isArray(sugerencia.ModosPermitidos) && sugerencia.ModosPermitidos.length === 0;
}

/**
 * La sugerencia solo depende de estos campos (no del stock ni de las líneas): si no cambian, no se
 * vuelve a pedir. El modo y mantenerJunto tampoco entran: los cambia el propio selector.
 */
export function huellaModoFacturacion(pedido: any): string {
  if (!pedido) {
    return '';
  }
  const campo = (v: any) => (v ?? '').toString().trim();
  return [
    pedido.empresa, pedido.numero, pedido.cliente, pedido.contacto, pedido.contactoCobro,
    pedido.plazosPago, pedido.periodoFacturacion, !!pedido.notaEntrega
  ].map(campo).join('|');
}
