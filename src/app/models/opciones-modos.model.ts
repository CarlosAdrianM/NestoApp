import { ModoFacturacionSugerido } from './modos-facturacion.model';
import { ModoServicioSugerido } from './modos-servicio.model';

/**
 * NestoApp#242 / NestoAPI#688 (novedad 715 de Marta): LA regla de qué enseñar de los modos del pedido
 * (servicio × facturación × casilla «Servir lo pendiente en cuanto haya stock»), respuesta de
 * POST api/PedidosVenta/OpcionesModos con el mismo DTO que se manda a guardar. PascalCase.
 * Servicio y Facturacion son las MISMAS sugerencias que ModoServicioSugerido y ModoFacturacionSugerido.
 */
export interface OpcionesFacturacionPedido extends ModoFacturacionSugerido {
  /** false = no se enseña el selector (p. ej. con «Todo junto»): no se manda modoFacturacion. */
  Visible: boolean;
  MotivoOculta: string | null;
}

export interface OpcionServirPendienteAlHaberStock {
  Visible: boolean;
  /** Lo que hay que pintar (y mandar al grabar). Siempre con valor. */
  Valor: boolean;
  /** Por qué no se enseña. Null si se enseña. */
  Motivo: string | null;
}

export interface OpcionesModosPedido {
  Servicio: ModoServicioSugerido;
  Facturacion: OpcionesFacturacionPedido;
  ServirPendienteAlHaberStock: OpcionServirPendienteAlHaberStock;
}

export const TEXTO_SERVIR_PENDIENTE_AL_HABER_STOCK = 'Servir lo pendiente en cuanto haya stock';

/** Con una API anterior (404 o sin el bloque) se enseña el selector como siempre. */
export function facturacionVisible(opciones: OpcionesModosPedido | null | undefined): boolean {
  return opciones?.Facturacion?.Visible !== false;
}

/** La casilla solo se enseña cuando la API lo dice (facturación «Todo ahora»). */
export function casillaServirPendienteVisible(opciones: OpcionesModosPedido | null | undefined): boolean {
  return opciones?.ServirPendienteAlHaberStock?.Visible === true;
}

/**
 * Lo que viaja al guardar: solo si el vendedor tocó la casilla o cambió el modo de facturación (con
 * «Todo ahora» recién elegido la API la marca sola); si no, null = no cambia. Fuera de «Todo ahora»
 * (casilla oculta) nunca se manda true: la API lo rechazaría con 400.
 */
export function servirPendienteParaGuardar(opciones: OpcionesModosPedido | null | undefined, valor: boolean,
  casillaTocada: boolean, modoFacturacionTocado: boolean): boolean | null {
  if (!casillaServirPendienteVisible(opciones)) {
    return null;
  }
  if (!casillaTocada && !modoFacturacionTocado) {
    return null;
  }
  return !!valor;
}
