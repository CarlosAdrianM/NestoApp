/**
 * NestoApp#240 (novedad 715 de Marta): las notas de entrega automáticas nacen con la fecha «sin
 * determinar» 31/12/2099 (CreadorNotaEntregaPendiente.FECHA_ENTREGA_SIN_DETERMINAR, NestoAPI#582) para
 * que no entren en el picking hasta que alguien ponga la de verdad. Con dos cifras se leía «31/12/99».
 */
export const ANO_FECHA_SIN_DETERMINAR = 2099;
export const TEXTO_SIN_FECHA = 'Sin fecha';
export const AVISO_SIN_FECHA_ENTREGA = 'Este pedido no tiene fecha de entrega: ponga la fecha cuando se sepa.';

function aFecha(fecha: string | Date | null | undefined): Date | null {
  if (!fecha) {
    return null;
  }
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return isNaN(d.getTime()) ? null : d;
}

/** 31/12/2099 (o cualquier fecha de ese año en adelante) es «sin determinar». */
export function esFechaSinDeterminar(fecha: string | Date | null | undefined): boolean {
  const d = aFecha(fecha);
  return !!d && d.getFullYear() >= ANO_FECHA_SIN_DETERMINAR;
}

/** «21/10/2026» (año con cuatro cifras, para no confundir 2099 con 1999) o «Sin fecha». Vacía si no hay fecha. */
export function textoFechaEntrega(fecha: string | Date | null | undefined): string {
  const d = aFecha(fecha);
  if (!d) {
    return '';
  }
  if (esFechaSinDeterminar(d)) {
    return TEXTO_SIN_FECHA;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}
