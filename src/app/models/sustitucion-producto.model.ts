/**
 * NestoApp#220 (gemela de NestoAPI#581): Compras pide servir otra referencia mientras no haya stock
 * (o hasta una fecha). GET api/Productos/{producto}/Sustitucion?empresa=&cantidad= devuelve la que
 * hay que avisar ahora, o null. PascalCase, como lo serializa NestoAPI.
 */
export interface SustitucionProducto {
  Id: number;
  Empresa: string;
  Producto: string;
  NombreProducto: string;
  ProductoSustituto: string;
  NombreSustituto: string;
  Motivo: string;
  MientrasNoHayaStock: boolean;
  FechaHasta: string | null;
  Estado: string;
  Vigente: boolean;
  /** Ya viene redactado, igual que en Nesto. */
  Aviso: string;
}

export function preguntaSustitucion(sustitucion: SustitucionProducto): string {
  return `${sustitucion.Aviso}\n\n¿Poner la ${sustitucion.ProductoSustituto?.trim()} en su lugar?`;
}
