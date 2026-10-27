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
  // NestoApp#247 (NestoAPI#690/#692): lo que enseña la ficha del evento que abre la push de anuncio.
  /** «HH:mm» o null. */
  HoraInicio?: string | null;
  HoraFin?: string | null;
  Ponente?: string | null;
  /** «Presencial» u «Online». */
  Formato?: string | null;
  /** La señal NO reembolsable (sin cupón). */
  ImporteSenalNoReembolsable?: number;
  Gratuito?: boolean;
  /** «Reembolsable», «NoReembolsable» o «Gratuita». */
  Modalidades?: string[];
  ImagenUrl?: string | null;
}

/**
 * NestoApp#244 / NestoAPI#691 (Nesto#543): un evento futuro de un curso que se puede vender desde la
 * plantilla (GET api/Eventos/PorProducto), con las modalidades y su importe.
 */
export interface ModalidadEventoCurso {
  /** «Reembolsable» o «NoReembolsable». */
  Modalidad: string;
  /** «Con cupón de productos» o «Sin cupón». */
  Nombre: string;
  Importe: number;
}

export interface EventoCurso {
  Id: number;
  Titulo: string;
  Fecha: string;
  HoraInicio: string | null;
  /** REI o ALC. */
  Almacen: string | null;
  /** «Presencial» u «Online». */
  Formato: string | null;
  /** 999 = sin límite. */
  PlazasLibres: number;
  Modalidades: ModalidadEventoCurso[];
}

export const PLAZAS_SIN_LIMITE = 999;
/** Lo que dice el aviso al grabar un pedido con cursos (NestoAPI#691: van en un pedido aparte, prepago). */
export const AVISO_CURSO_PREPAGO = 'El curso va en un pedido aparte con prepago: se cobra por adelantado y el cliente recibe el enlace de pago de la inscripción. Los cursos se facturan aparte y no cuentan para portes, Ganavisiones ni ofertas.';

/** Los nombres que enseñan TNV y Nesto para cada modalidad. */
export function nombreModalidadEvento(modalidad: string | null | undefined): string {
  switch ((modalidad || '').trim()) {
    case 'Reembolsable': return 'Con cupón de productos';
    case 'NoReembolsable': return 'Sin cupón';
    case 'Gratuita': return 'Plaza sin coste';
    default: return (modalidad || '').trim();
  }
}

/** «Con cupón de productos: 100 €». */
export function textoModalidadCurso(modalidad: ModalidadEventoCurso): string {
  return `${modalidad.Nombre || nombreModalidadEvento(modalidad.Modalidad)}: ${formatearImporte(modalidad.Importe)}`;
}

function formatearImporte(importe: number): string {
  const valor = +importe || 0;
  const texto = Number.isInteger(valor) ? String(valor) : valor.toFixed(2).replace('.', ',');
  return `${texto} €`;
}

/** «Online» o «Presencial en REI» (o solo «Presencial» sin tienda). */
export function textoFormatoEvento(formato: string | null | undefined, almacen: string | null | undefined): string {
  const online = (formato || '').trim().toLowerCase() === 'online';
  const tienda = (almacen || '').trim();
  if (online) {
    return 'Online';
  }
  return tienda ? `Presencial en ${tienda}` : 'Presencial';
}

/** «Quedan 5 plazas», «Queda 1 plaza», «Sin límite de plazas» o «Sin plazas». */
export function textoPlazasLibres(plazasLibres: number | null | undefined): string {
  if (plazasLibres === null || plazasLibres === undefined || plazasLibres >= PLAZAS_SIN_LIMITE) {
    return 'Sin límite de plazas';
  }
  if (plazasLibres <= 0) {
    return 'Sin plazas';
  }
  return plazasLibres === 1 ? 'Queda 1 plaza' : `Quedan ${plazasLibres} plazas`;
}

/** NestoApp#247: las modalidades de un evento con su importe, a partir del EventoDTO (strings + señales). */
export function modalidadesConImporte(evento: Evento): ModalidadEventoCurso[] {
  const modalidades = (evento?.Modalidades || []).map(m => (m || '').trim()).filter(m => !!m);
  return modalidades.map(m => ({
    Modalidad: m,
    Nombre: nombreModalidadEvento(m),
    Importe: m === 'Reembolsable' ? +(evento.ImporteSenal || 0) : m === 'NoReembolsable' ? +(evento.ImporteSenalNoReembolsable || 0) : 0
  }));
}

/**
 * NestoApp#244 (decisión de Carlos, 22/10/26): los cursos van en un pedido aparte y su importe NO cuenta
 * para nada del pedido de productos (portes, Ganavisiones, regalos, ofertas, cupones). Una línea es un
 * curso si viene marcada EsCurso (búsqueda), lleva evento o es del grupo CUR.
 */
export const GRUPO_CURSOS = 'CUR';

export function esLineaCurso(linea: any): boolean {
  if (!linea) {
    return false;
  }
  return linea.EsCurso === true || linea.esCurso === true || !!linea.eventoId
    || (linea.grupo || '').toString().trim().toUpperCase() === GRUPO_CURSOS;
}

export function sinLineasCurso<T>(lineas: T[] | null | undefined): T[] {
  return (lineas || []).filter(l => !esLineaCurso(l));
}

/** «Se han creado dos pedidos: N (productos) y M (curso). Los cursos se facturan aparte.» */
export function textoPedidosCreados(numeroPrincipal: number | string, pedidosAdicionales: { Numero: number; Motivo?: string }[] | null | undefined): string | null {
  const adicionales = (pedidosAdicionales || []).filter(p => p && p.Numero);
  if (adicionales.length === 0) {
    return null;
  }
  const cursos = adicionales.map(p => p.Numero).join(', ');
  return `Se han creado dos pedidos: ${numeroPrincipal} (productos) y ${cursos} (curso). Los cursos se facturan aparte.`;
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
