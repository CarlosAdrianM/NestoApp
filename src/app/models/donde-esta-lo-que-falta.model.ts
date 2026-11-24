/**
 * NestoApp#289 (gemela de la API, caso del pedido 930942): por cada producto de un pedido que no está listo en
 * Algete, dónde está (de camino en una reposición de tienda, en la próxima reposición, viene del proveedor…).
 * GET api/PedidosVenta/{empresa}/{pedido}/DondeEstaLoQueFalta. PascalCase, como lo serializa NestoAPI.
 */
export interface SeguimientoQueFalta {
  Preparada?: string | null;
  Recogida?: string | null;
  RecogidaPor?: string | null;
  EnFurgonetaDe?: string | null;
  Recibida?: string | null;
  PendienteDeRecibir?: boolean;
  Bultos?: number;
  BultosRecogidos?: number;
}

export interface SituacionQueFalta {
  /** EnCamino, Tienda, Proveedor, SinStock, Montaje o Kit. */
  Origen: string;
  Unidades: number;
  Tienda?: string | null;
  Traspaso?: number | null;
  PedidoProveedor?: number | null;
  FechaPrevistaProveedor?: string | null;
  LlegaAAlgete?: string | null;
  PuedeSalirEl?: string | null;
  Certeza?: string | null;
  Texto?: string | null;
  Seguimiento?: SeguimientoQueFalta | null;
}

export interface ProductoQueFalta {
  Producto: string;
  Nombre: string;
  /** Las que faltan. */
  Unidades: number;
  /** La frase entera, lista para pintar. */
  Texto: string;
  Situaciones?: SituacionQueFalta[] | null;
}

export interface DondeEstaLoQueFalta {
  Empresa: string;
  Pedido: number;
  Mensaje?: string | null;
  TodoEnAlgete: boolean;
  Pickings?: number[] | null;
  FechaEntregaAgencia?: string | null;
  Productos?: ProductoQueFalta[] | null;
}

export const TITULO_DONDE_ESTA_LO_QUE_FALTA = '¿Dónde está lo que falta?';
export const ERROR_DONDE_ESTA_LO_QUE_FALTA = 'No se ha podido consultar dónde está lo que falta. Inténtelo de nuevo más tarde.';

/**
 * Las frases que se pintan: si todo está en Algete, basta el mensaje; si no, el mensaje (si lo hay) y una línea
 * por producto con el texto que da la API.
 */
export function frasesDondeEstaLoQueFalta(dato: DondeEstaLoQueFalta | null | undefined): string[] {
  if (!dato) {
    return [];
  }
  const mensaje = (dato.Mensaje || '').trim();
  const productos = (dato.Productos || []).map(p => (p?.Texto || '').trim()).filter(t => !!t);
  if (dato.TodoEnAlgete || productos.length === 0) {
    return mensaje ? [mensaje] : [];
  }
  return mensaje ? [mensaje, ...productos] : productos;
}
