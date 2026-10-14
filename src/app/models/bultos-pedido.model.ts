/**
 * NestoApp#223 (gemela de Nesto#522, NestoAPI#556): los bultos de un pedido con la foto del packing
 * que hizo el mozo en Ariadna. GET api/Almacen/Pedidos/{pedido}/Bultos?empresa=. PascalCase.
 */
export interface BultoPedido {
  Id: number;
  Empresa: string;
  Pedido: number;
  Picking: number;
  Bulto: number;
  Peso: number | null;
  TieneFoto: boolean;
  NumeroEnvio: number | null;
  Usuario: string;
  FechaFoto: string | null;
  /** Ruta dentro de la API (sin servidor) para ver la foto sin usuario; null si no hay foto o no se puede firmar. */
  RutaFotoPublica: string | null;
}

/** GET api/Almacen/Bultos/{id}/Foto: enlace temporal para enseñarla en la app. */
export interface EnlaceFotoBulto {
  Url: string;
  MinutosDeVigencia: number;
}

/** El enlace que se puede mandar al cliente o a la agencia (no caduca mientras exista la foto). */
export function enlacePublicoFotoBulto(bulto: BultoPedido, servidor: string): string | null {
  if (!bulto?.RutaFotoPublica) {
    return null;
  }
  return servidor.replace(/\/+$/, '') + '/' + bulto.RutaFotoPublica.replace(/^\/+/, '');
}

/** «Bulto 2 · 3,40 kg · envío 81234» */
export function textoBulto(bulto: BultoPedido): string {
  const partes = [`Bulto ${bulto.Bulto}`];
  if (bulto.Peso) {
    partes.push(`${bulto.Peso.toFixed(2).replace('.', ',')} kg`);
  }
  if (bulto.NumeroEnvio) {
    partes.push(`envío ${bulto.NumeroEnvio}`);
  }
  return partes.join(' · ');
}
