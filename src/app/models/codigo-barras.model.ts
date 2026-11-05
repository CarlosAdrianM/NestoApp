/**
 * NestoApp#262 (gemela de Nesto#582, sugerencia 908; NestoAPI#605): buscar un producto por su código de barras.
 * GET api/Productos/PorCodigoBarras?codigo=…&empresa=1 → los productos activos con ese código (el principal, el primero).
 */
export interface ProductoPorCodigoBarras {
  Producto: string;
  Nombre: string;
  Cantidad: number;
  Principal: boolean;
}

/** Un GTIN tecleado o leído: EAN-8, UPC-A (12), EAN-13 o ITF-14. Una referencia nuestra (5 cifras) no lo es. */
export function esCodigoBarras(texto: string | null | undefined): boolean {
  const limpio = (texto || '').toString().replace(/\s/g, '');
  return /^\d{8}$|^\d{12,14}$/.test(limpio);
}

export function textoSinProductoCodigoBarras(codigo: string): string {
  return `No hay ningún producto con el código de barras ${(codigo || '').toString().trim()}`;
}
