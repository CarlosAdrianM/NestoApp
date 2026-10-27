import { ApiErrorCode } from './api-error.model';

/**
 * NestoApp#252 / NestoAPI#712 (pedido 929057, fecha 27/10/2027 por error): al grabar un pedido se manda
 * `ConfirmarFechaEntregaLejana: false`; si alguna línea nueva (o con la fecha cambiada) va a más de 60
 * días, la API contesta 400 FECHA_ENTREGA_LEJANA con la pregunta ya redactada. Con «Sí» se repite la
 * misma petición con `true`; con «No» no se graba y se vuelve a la edición.
 */
export interface FechaEntregaLejana {
  /** La pregunta de la API, de usted y con tildes: se enseña tal cual. */
  mensaje: string;
  /** yyyy-MM-dd, la más lejana. */
  fechaEntrega: string | null;
  dias: number | null;
  lineas: number | null;
}

export const CAMPO_CONFIRMAR_FECHA_ENTREGA_LEJANA = 'ConfirmarFechaEntregaLejana';

/** La pregunta de la API si el error es el de fecha lejana; null si es cualquier otro. */
export function leerFechaEntregaLejana(error: any): FechaEntregaLejana | null {
  const apiError = error?.apiError?.error;
  if (!apiError || apiError.code !== ApiErrorCode.FECHA_ENTREGA_LEJANA) {
    return null;
  }
  const detalles = apiError.details || {};
  const numero = (v: any) => (v === null || v === undefined || v === '' || isNaN(Number(v))) ? null : Number(v);
  return {
    mensaje: apiError.message || '¿Es correcta la fecha de entrega?',
    fechaEntrega: detalles.fechaEntrega ? String(detalles.fechaEntrega) : null,
    dias: numero(detalles.dias),
    lineas: numero(detalles.lineas)
  };
}

/** El pedido tal como se manda: con la confirmación que toque (false en cada guardado nuevo). */
export function conConfirmacionFechaLejana<T extends object>(pedido: T, confirmada: boolean): T & { ConfirmarFechaEntregaLejana: boolean } {
  return { ...pedido, [CAMPO_CONFIRMAR_FECHA_ENTREGA_LEJANA]: confirmada } as T & { ConfirmarFechaEntregaLejana: boolean };
}
