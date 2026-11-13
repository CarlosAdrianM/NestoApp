/**
 * NestoApp#281 / NestoAPI#864 (gemela Nesto#640): pagar a plazos un pedido ya creado (Aplázame hoy; el proveedor es un dato).
 * Si el cliente tiene la app de clientes se le manda un aviso para que lo termine allí; si no, la API devuelve el enlace y
 * lo manda el vendedor (como los enlaces de pago de siempre).
 *
 * GET    api/PedidosVenta/{empresa}/{pedido}/PagoAPlazos/Disponible → siempre 200 (403 / 404 / 503)
 * POST   api/PedidosVenta/{empresa}/{pedido}/PagoAPlazos { Canal, Correo } → 200 (400 / 403 / 404 / 409 / 502 / 503 con Message)
 * GET    api/PedidosVenta/{empresa}/{pedido}/PagoAPlazos/Estado
 * DELETE api/PedidosVenta/{empresa}/{pedido}/PagoAPlazos?motivo=  → 409 si no hay nada que cancelar o ya está cobrado
 */

export type CanalPagoAPlazos = 'App' | 'Enlace';
export type EstadoSolicitudPagoAPlazos = 'SinSolicitud' | 'Pendiente' | 'Aprobado' | 'Capturado' | 'Cancelado' | 'Caducado' | 'Rechazado';

export interface DisponibilidadPagoAPlazos {
  Disponible: boolean;
  Motivo: string | null;
  Proveedor: string | null;
  NombreProveedor: string | null;
  Importe: number;
  ImporteMinimo: number | null;
  ImporteMaximo: number | null;
  DiasPlazoCaptura: number | null;
  ClienteTieneApp: boolean;
  /** El canal que sugiere la API. */
  Canal: CanalPagoAPlazos | null;
  /** No impide nada: p. ej. «El cliente no tiene la app…». */
  Aviso: string | null;
  /** Mensaje listo para pegar con el enlace de instalación de la app de clientes; null si ya la tiene. */
  InvitacionApp: string | null;
  Pruebas: boolean;
}

export interface EstadoPagoAPlazos {
  HaySolicitud: boolean;
  IdSolicitud: number | null;
  Estado: EstadoSolicitudPagoAPlazos | string;
  Proveedor: string | null;
  NombreProveedor: string | null;
  Canal: CanalPagoAPlazos | string | null;
  Importe: number | null;
  ImporteCapturado: number | null;
  FechaSolicitud: string | null;
  FechaAprobacion: string | null;
  FechaLimiteCaptura: string | null;
  DiasParaCapturar: number | null;
  FechaCaptura: string | null;
  FechaCierre: string | null;
  Motivo: string | null;
  Usuario: string | null;
  /** Solo pendiente por enlace. */
  UrlPago: string | null;
  Pruebas: boolean;
}

/** Respuesta del POST: el estado más lo que hay que hacer con él. */
export interface SolicitudPagoAPlazos extends EstadoPagoAPlazos {
  DispositivosAvisados?: number;
  Aviso?: string | null;
  /** El enlace y, si no tiene la app, la invitación debajo. null sin enlace. */
  MensajeCliente?: string | null;
  InvitacionApp?: string | null;
}

/** «1.234,50 €» (a mano: es-ES no agrupa los miles con cuatro cifras). */
const euros = (importe: number | null | undefined) => {
  const [entera, decimales] = Math.abs(+(importe || 0)).toFixed(2).split('.');
  const signo = +(importe || 0) < 0 ? '-' : '';
  return `${signo}${entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales} €`;
};

const fecha = (valor: string | null | undefined) => {
  const [anio, mes, dia] = (valor || '').substring(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : '';
};

const nombreProveedor = (e: { NombreProveedor?: string | null, Proveedor?: string | null } | null | undefined) =>
  (e?.NombreProveedor || e?.Proveedor || 'Pago a plazos').toString().trim();

/** Una línea para el pedido: «Aplázame: aprobado (1.234,50 €). Hay que servirlo antes del 27/11/2026 para cobrarlo.» */
export function textoEstadoPagoAPlazos(estado: EstadoPagoAPlazos | null | undefined): string {
  if (!estado?.HaySolicitud || estado.Estado === 'SinSolicitud') {
    return '';
  }
  const cabecera = `${nombreProveedor(estado)}: `;
  const importe = ` (${euros(estado.ImporteCapturado || estado.Importe)})`;
  const motivo = (estado.Motivo || '').trim();
  switch (estado.Estado) {
    case 'Pendiente':
      return `${cabecera}pendiente de que el cliente termine la solicitud${importe}.`;
    case 'Aprobado': {
      const limite = fecha(estado.FechaLimiteCaptura);
      return `${cabecera}aprobado${importe}.${limite ? ` Hay que servirlo antes del ${limite} para cobrarlo.` : ''}`;
    }
    case 'Capturado':
      return `${cabecera}cobrado${importe}.`;
    case 'Rechazado':
      return `${cabecera}rechazado${importe}.${motivo ? ' ' + motivo : ''}`;
    case 'Cancelado':
      return `${cabecera}cancelado${importe}.${motivo ? ' ' + motivo : ''}`;
    case 'Caducado':
      return `${cabecera}caducado${importe}: no se cobró a tiempo.`;
    default:
      return `${cabecera}${estado.Estado}${importe}.`;
  }
}

/** Se puede cancelar la solicitud viva (si estaba aprobada, se cancela también en el proveedor). */
export function puedeCancelarPagoAPlazos(estado: EstadoPagoAPlazos | null | undefined): boolean {
  return !!estado?.HaySolicitud && (estado.Estado === 'Pendiente' || estado.Estado === 'Aprobado');
}

/** Lo que se le manda al cliente: el mensaje completo de la API (enlace e invitación) o, si no viene, la URL. */
export function textoMensajeParaCliente(respuesta: { MensajeCliente?: string | null, UrlPago?: string | null } | null | undefined): string {
  return (respuesta?.MensajeCliente || respuesta?.UrlPago || '').toString().trim();
}

/** «Aplázame no disponible: El importe es menor que el mínimo (60 €).» o '' si está disponible o no hay motivo. */
export function textoNoDisponible(disponibilidad: DisponibilidadPagoAPlazos | null | undefined): string {
  if (!disponibilidad || disponibilidad.Disponible) {
    return '';
  }
  const motivo = (disponibilidad.Motivo || '').trim();
  return motivo ? `${nombreProveedor(disponibilidad)} no disponible: ${motivo}` : '';
}
