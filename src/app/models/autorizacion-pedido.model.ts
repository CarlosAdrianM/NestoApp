/**
 * NestoApp#280 / #290 punto 5 (Novedades 1258, gemela de Nesto): pedir autorización de un pedido que no pasa la
 * validación de ofertas y descuentos. Contrato de NestoAPI: `api/PedidosVenta/Autorizaciones`
 * (PedidosVentaAutorizacionesController). PascalCase, como lo serializa la API. Los errores vienen como
 * `{ Message }`; el 409 de «ya pedida», además con `Codigo` = YA_SOLICITADA e `Id`.
 */
export type EstadoAutorizacionPedido = 'Pendiente' | 'Autorizada' | 'Denegada' | 'Anulada';

export const ESTADO_PENDIENTE: EstadoAutorizacionPedido = 'Pendiente';
export const ESTADO_AUTORIZADA: EstadoAutorizacionPedido = 'Autorizada';
export const ESTADO_DENEGADA: EstadoAutorizacionPedido = 'Denegada';
export const ESTADO_ANULADA: EstadoAutorizacionPedido = 'Anulada';

export const CODIGO_YA_SOLICITADA = 'YA_SOLICITADA';
export const LONGITUD_MAXIMA_TEXTO_AUTORIZACION = 500;

export interface ErrorAutorizacionPedido {
  Producto?: string | null;
  Motivo?: string | null;
}

/** 201 de POST api/PedidosVenta/Autorizaciones. */
export interface SolicitudAutorizacionCreada {
  Id: number;
  Estado: string;
  Motivos?: string[] | null;
  Errores?: ErrorAutorizacionPedido[] | null;
  /** A quién le ha llegado (nombres sin dominio). */
  Destinatarios?: string[] | null;
}

/** GET api/PedidosVenta/Autorizaciones (y, con `Pedido`, GET …/{id}). */
export interface AutorizacionPedido {
  Id: number;
  Estado: string;
  Empresa?: string | null;
  Cliente?: string | null;
  Contacto?: string | null;
  NombreCliente?: string | null;
  Solicitante?: string | null;
  NombreSolicitante?: string | null;
  FechaSolicitud?: string | null;
  /** Base imponible del borrador. */
  Importe?: number | null;
  NumeroLineas?: number | null;
  Motivos?: string[] | null;
  Errores?: ErrorAutorizacionPedido[] | null;
  Comentario?: string | null;
  UsuarioResolucion?: string | null;
  FechaResolucion?: string | null;
  MotivoResolucion?: string | null;
  PedidoCreado?: number | null;
  /** Solo en GET …/{id}: el pedido tal como se iba a guardar. */
  Pedido?: any;
}

/** 200 de Autorizar, Denegar y DELETE. */
export interface ResolucionAutorizacionPedido {
  Id: number;
  Estado: string;
  /** Solo al autorizar: el número del pedido creado. */
  Pedido?: number | null;
}

/** Una línea del borrador, marcada si su producto aparece en los errores de la validación. */
export interface LineaAutorizacionPedido {
  Producto: string;
  Descripcion: string;
  Cantidad: number;
  Precio: number;
  Descuento: number;
  MotivoError: string | null;
}

// ---- Textos (los mismos que Nesto) ----

export const TITULO_PEDIDO_NO_VALIDO = 'Pedido no válido';
export const TITULO_PEDIR_AUTORIZACION = 'Pedir autorización';
export const EXPLICACION_PEDIR_AUTORIZACION = 'Usted no puede crearlo sin pasar la validación. Puede pedir autorización a quien puede darla: '
  + 'le llegará el pedido tal cual y, si lo autoriza, se creará.';
export const PREGUNTA_COMENTARIO_AUTORIZACION = 'Si quiere, escriba un comentario para quien autoriza (por qué lo necesita, lo hablado con el '
  + 'cliente…). Puede dejarlo en blanco.';
export const MENSAJE_YA_SOLICITADA = 'Ya había pedido esta autorización; sigue pendiente.';
export const MENSAJE_TEXTO_LARGO_AUTORIZACION = `El texto no puede pasar de ${LONGITUD_MAXIMA_TEXTO_AUTORIZACION} caracteres.`;
export const MENSAJE_MOTIVO_VACIO = 'Escriba el motivo por el que deniega la autorización.';
export const TITULO_AUTORIZAR = 'Autorizar y crear el pedido';
export const TITULO_DENEGAR = 'Denegar la autorización';
export const TITULO_ANULAR_AUTORIZACION = 'Anular mi solicitud';

export const AYUDA_AUTORIZADOR = 'Pedidos que no pasan la validación de ofertas y descuentos y cuyo autor pide autorización. Toque una para '
  + 'ver las líneas: las marcadas son las que no pasan. «Autorizar y crear el pedido» lo crea tal cual; «Denegar» pide el motivo, que le llega '
  + 'a quien lo pidió.';
export const AYUDA_SOLICITANTE = 'Sus solicitudes de autorización de pedidos que no pasan la validación de ofertas y descuentos. Cuando '
  + 'contesten le avisaremos en el móvil. Mientras siga pendiente, puede anularla.';

const limpio = (texto: any): string => (texto ?? '').toString().trim();

/** «Se ha pedido autorización a Ana y Luis. Le avisaremos cuando contesten.» */
export function textoAutorizacionPedida(destinatarios: string[] | null | undefined): string {
  const nombres = (destinatarios || []).map(limpio).filter(n => !!n);
  let aQuien = '';
  if (nombres.length === 1) {
    aQuien = ' a ' + nombres[0];
  } else if (nombres.length > 1) {
    aQuien = ' a ' + nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1];
  }
  return `Se ha pedido autorización${aQuien}. Le avisaremos cuando contesten.`;
}

/** El aviso de validación con la explicación de que puede pedir autorización. */
export function textoOfrecerAutorizacion(mensajeValidacion: string | null | undefined): string {
  const mensaje = limpio(mensajeValidacion);
  return (mensaje ? mensaje + '\n\n' : '') + EXPLICACION_PEDIR_AUTORIZACION;
}

export function estaPendiente(solicitud: AutorizacionPedido | null | undefined): boolean {
  return limpio(solicitud?.Estado).toLowerCase() === ESTADO_PENDIENTE.toLowerCase();
}

/** «15191/0 · Peluquería Prueba». */
export function textoClienteAutorizacion(solicitud: AutorizacionPedido | null | undefined): string {
  let numero = limpio(solicitud?.Cliente);
  const contacto = limpio(solicitud?.Contacto);
  if (contacto) {
    numero += '/' + contacto;
  }
  const nombre = limpio(solicitud?.NombreCliente);
  return nombre ? `${numero} · ${nombre}` : numero;
}

/** El nombre de quien la pidió o, si no viene, su usuario (sin dominio). */
export function textoSolicitante(solicitud: AutorizacionPedido | null | undefined): string {
  return limpio(solicitud?.NombreSolicitante) || sinDominio(solicitud?.Solicitante);
}

export function sinDominio(usuario: string | null | undefined): string {
  const u = limpio(usuario);
  const barra = u.lastIndexOf('\\');
  return barra >= 0 ? u.substring(barra + 1) : u;
}

/** Si la solicitud la pidió este usuario (con o sin dominio, sin distinguir mayúsculas). */
export function esDelUsuario(solicitud: AutorizacionPedido | null | undefined, usuario: string | null | undefined): boolean {
  const suyo = sinDominio(solicitud?.Solicitante).toLowerCase();
  return !!suyo && suyo === sinDominio(usuario).toLowerCase();
}

export function textoMotivos(solicitud: AutorizacionPedido | null | undefined): string {
  return (solicitud?.Motivos || []).map(limpio).filter(m => !!m).join(' · ');
}

function fechaCorta(fecha: string | null | undefined): string {
  const f = fecha ? new Date(fecha) : null;
  if (!f || isNaN(f.getTime())) {
    return '';
  }
  const dos = (n: number) => n.toString().padStart(2, '0');
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

/** «Denegada por Carlos el 19/11/2026 10:15: no es cliente de la promoción.» ('' si sigue pendiente). */
export function textoResolucion(solicitud: AutorizacionPedido | null | undefined): string {
  if (!solicitud || estaPendiente(solicitud)) {
    return '';
  }
  let texto = limpio(solicitud.Estado);
  const quien = sinDominio(solicitud.UsuarioResolucion);
  if (quien) {
    texto += ' por ' + quien;
  }
  const cuando = fechaCorta(solicitud.FechaResolucion);
  if (cuando) {
    texto += ' el ' + cuando;
  }
  const motivo = limpio(solicitud.MotivoResolucion);
  if (motivo) {
    texto += ': ' + motivo;
  }
  if ((solicitud.PedidoCreado || 0) > 0) {
    texto += ` (pedido ${solicitud.PedidoCreado})`;
  }
  return texto.replace(/\.+$/, '') + '.';
}

export function colorEstadoAutorizacion(estado: string | null | undefined): string {
  switch (limpio(estado)) {
    case ESTADO_AUTORIZADA: return 'success';
    case ESTADO_DENEGADA: return 'danger';
    case ESTADO_ANULADA: return 'medium';
    default: return 'warning';
  }
}

/** «2 pendientes y 1 resuelta» / «Ninguna pendiente». */
export function resumenAutorizaciones(solicitudes: AutorizacionPedido[] | null | undefined, verResueltas: boolean): string {
  const lista = solicitudes || [];
  const pendientes = lista.filter(estaPendiente).length;
  const resueltas = lista.length - pendientes;
  const textoPendientes = pendientes === 0 ? 'Ninguna pendiente' : pendientes === 1 ? '1 pendiente' : `${pendientes} pendientes`;
  return verResueltas ? `${textoPendientes} y ${resueltas === 1 ? '1 resuelta' : `${resueltas} resueltas`}` : textoPendientes;
}

/**
 * Las líneas del borrador con el motivo de los errores de su producto (sin distinguir espacios ni mayúsculas).
 * El pedido llega con las claves de PedidoVentaDTO (Producto / Cantidad / PrecioUnitario / DescuentoLinea / texto).
 */
export function lineasDesdeBorrador(pedido: any, errores: ErrorAutorizacionPedido[] | null | undefined): LineaAutorizacionPedido[] {
  const motivosPorProducto = new Map<string, string[]>();
  for (const error of (errores || [])) {
    const producto = limpio(error?.Producto).toUpperCase();
    const motivo = limpio(error?.Motivo);
    if (!producto || !motivo) {
      continue;
    }
    const motivos = motivosPorProducto.get(producto) || [];
    if (!motivos.includes(motivo)) {
      motivos.push(motivo);
    }
    motivosPorProducto.set(producto, motivos);
  }
  return ((pedido?.Lineas ?? pedido?.lineas ?? []) as any[]).filter(l => !!l).map(l => {
    const producto = limpio(l.Producto ?? l.producto);
    const motivos = producto ? motivosPorProducto.get(producto.toUpperCase()) : undefined;
    return {
      Producto: producto,
      Descripcion: limpio(l.texto ?? l.Texto),
      Cantidad: Number(l.Cantidad ?? l.cantidad) || 0,
      Precio: Number(l.PrecioUnitario ?? l.precioUnitario ?? l.precio) || 0,
      Descuento: Number(l.DescuentoLinea ?? l.descuentoLinea ?? l.descuento) || 0,
      MotivoError: motivos?.length ? motivos.join(' · ') : null
    };
  });
}

/** El texto obligatorio/opcional de un diálogo: '' si vale, o por qué no. */
export function falloTextoAutorizacion(texto: string | null | undefined, obligatorio: boolean): string {
  const t = limpio(texto);
  if (obligatorio && !t) {
    return MENSAJE_MOTIVO_VACIO;
  }
  if (t.length > LONGITUD_MAXIMA_TEXTO_AUTORIZACION) {
    return MENSAJE_TEXTO_LARGO_AUTORIZACION;
  }
  return '';
}

// ---- Errores: llegan como ProcessedApiError (interceptor) o como HttpErrorResponse ----

function estadoHttp(error: any): number | undefined {
  return error?.statusCode ?? error?.status;
}

function cuerpoError(error: any): any {
  return error?.originalError?.error ?? error?.error;
}

/** 409 con Codigo = YA_SOLICITADA: ya la había pedido y sigue pendiente. */
export function esYaSolicitada(error: any): boolean {
  const cuerpo = cuerpoError(error);
  return estadoHttp(error) === 409 && limpio(cuerpo?.Codigo ?? cuerpo?.codigo).toUpperCase() === CODIGO_YA_SOLICITADA;
}

/** 503 (sin la tabla) o 404 sin mensaje (API anterior): aún no está disponible. Si no, el `Message` de la API. */
export function mensajeErrorAutorizacion(error: any): string {
  const status = estadoHttp(error);
  const cuerpo = cuerpoError(error);
  const mensaje = typeof cuerpo === 'string' ? cuerpo
    : limpio(error?.apiError?.error?.message || cuerpo?.Message || cuerpo?.message || cuerpo?.ExceptionMessage);
  if (status === 0) {
    return 'No hay conexión con el servidor. Inténtelo otra vez en un rato.';
  }
  if (status === 503 || (status === 404 && (!mensaje || /No HTTP resource/i.test(mensaje)))) {
    return 'Las autorizaciones de pedidos todavía no están disponibles en el servidor.';
  }
  return mensaje || 'No se ha podido completar. Inténtelo otra vez en un rato.';
}
