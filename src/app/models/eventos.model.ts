/**
 * NestoApp#217 (gemela de NestoAPI#611, corte 1): inscribir clientes en eventos (cursos) desde el
 * campo y mandarles el enlace de pago. Sin pedido: la inscripción queda Reservada hasta que se paga
 * y caduca a los 7 días (o el día del evento). PascalCase, como lo serializa NestoAPI.
 */
export interface Evento {
  Id: number;
  Empresa: string;
  Titulo: string;
  Fecha: string;
  ImporteSenal: number;
  Activo: boolean;
  /** REI / ALC: la tienda donde es el evento. */
  Almacen?: string | null;
  ProductoCurso?: string | null;
  /** null = sin límite. */
  Plazas?: number | null;
  PlazasOcupadas?: number;
  Lugar?: string | null;
  /** El texto largo (no «Descripcion»: el EventoModel de Nesto ya usa ese nombre). */
  DescripcionLarga?: string | null;
}

export type FormaPagoInscripcion = 'Tarjeta' | 'Transferencia' | 'Efectivo';

export interface InscribirEvento {
  Empresa: string;
  Cliente: string;
  Contacto?: string;
  /** Obligatorio. */
  Origen: 'NestoApp';
  FormaPago?: FormaPagoInscripcion;
  /** Solo con Tarjeta (o sin forma de pago). Por defecto, sí. */
  GenerarEnlacePago?: boolean;
  Correo?: string;
}

export interface InscripcionEvento {
  Id: number;
  EventoId: number;
  Evento: string;
  FechaEvento: string;
  Almacen: string | null;
  Empresa: string;
  Cliente: string;
  Contacto: string;
  Nombre: string;
  Estado: string;
  /** «Reservada», «Pagada», «Asistió»… (con tildes, para pintar). */
  EstadoTexto: string;
  /** Hasta ese día (incluido) se puede pagar. */
  FechaLimitePago: string | null;
  FormaPago: string | null;
  ImportePagado: number | null;
  /** La página del enlace de pago, solo mientras se puede pagar. */
  UrlPago: string | null;
}

function dia(fecha: string): string {
  return (fecha || '').substring(0, 10);
}

export function plazasLibres(evento: Evento): number | null {
  if (evento.Plazas === null || evento.Plazas === undefined) {
    return null;
  }
  return Math.max(0, evento.Plazas - (evento.PlazasOcupadas || 0));
}

/** Los que se pueden ofrecer: activos, de hoy en adelante y con plaza. Por fecha. */
export function eventosInscribibles(eventos: Evento[], hoy: Date = new Date()): Evento[] {
  const hoyIso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return (eventos || [])
    .filter(e => e && e.Activo !== false && dia(e.Fecha) >= hoyIso)
    .filter(e => plazasLibres(e) !== 0)
    .sort((a, b) => dia(a.Fecha).localeCompare(dia(b.Fecha)));
}

export function textoPlazas(evento: Evento): string {
  const libres = plazasLibres(evento);
  if (libres === null) {
    return '';
  }
  return libres === 1 ? 'Queda 1 plaza' : `Quedan ${libres} plazas`;
}

/** El enlace solo tiene sentido con tarjeta: con transferencia o efectivo no se genera. */
export function seGeneraEnlace(formaPago: FormaPagoInscripcion | null, generar: boolean): boolean {
  return generar && (!formaPago || formaPago === 'Tarjeta');
}
