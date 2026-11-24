import { ApiErrorCode } from './api-error.model';

/**
 * Lo que puede contestar la API al MODIFICAR un pedido (PUT api/PedidosVenta) y que la pantalla tiene que
 * entender: la versión (#285 / NestoAPI#873) y la ampliación de un pedido en preparación (#287, caso 931007).
 */

// ---- NestoApp#285 / NestoAPI#873: otro ha guardado el pedido desde que se abrió ----

/**
 * Si el error es el 409 PEDIDO_CAMBIADO, su mensaje tal cual (ya viene de usted, con quién y cuándo);
 * si es cualquier otro, null. No se ha guardado nada: hay que recargar.
 */
export function leerPedidoCambiado(error: any): string | null {
  const apiError = error?.apiError?.error;
  if (!apiError || apiError.code !== ApiErrorCode.PEDIDO_CAMBIADO) {
    return null;
  }
  return (apiError.message || '').trim() ||
    'Otra persona ha modificado el pedido desde que usted lo abrió. Recárguelo y vuelva a hacer los cambios.';
}

/** Quién lo ha guardado entre medias, según los detalles del 409 (para las preguntas de la fusión). null si no viene. */
export function usuarioQueCambioElPedido(error: any): string | null {
  const detalles = error?.apiError?.error?.details;
  const usuario = ((detalles?.Usuario ?? detalles?.usuario) || '').toString().trim();
  return usuario || null;
}

// ---- NestoApp#287: añadir productos a un pedido que ya está en preparación ----

export type OpcionAmpliacionEnPreparacion = 'PedidoNuevo' | 'PedirAlmacen';

export const AMPLIACION_PEDIDO_NUEVO: OpcionAmpliacionEnPreparacion = 'PedidoNuevo';
export const AMPLIACION_PEDIR_ALMACEN: OpcionAmpliacionEnPreparacion = 'PedirAlmacen';

/** Mismos textos que Nesto (AmpliacionPedidoEnPreparacion.vb). */
export const TITULO_PEDIDO_EN_PREPARACION = 'El pedido ya está en preparación';
export const TEXTO_AMPLIACION_PEDIDO_NUEVO = 'Hacer un pedido nuevo con lo añadido';
export const TEXTO_AMPLIACION_PEDIR_ALMACEN = 'Pedir a Almacén que lo meta en el envío de hoy';

export const AVISO_AMPLIACION_EN_PEDIDO_NUEVO = 'AmpliacionEnPedidoNuevo';
export const AVISO_AMPLIACION_PEDIDA_A_ALMACEN = 'AmpliacionPedidaAAlmacen';

export interface PedidoEnPreparacion {
  mensaje: string;
  /** «Pedir a Almacén» solo se ofrece si la API lo trae en Opciones. */
  puedePedirAlmacen: boolean;
  pickings: number[];
  productos: string[];
}

/** Si el error es el 409 PEDIDO_EN_PREPARACION, lo que hay que preguntar; si es otro, null. */
export function leerPedidoEnPreparacion(error: any): PedidoEnPreparacion | null {
  const apiError = error?.apiError?.error;
  if (!apiError || apiError.code !== ApiErrorCode.PEDIDO_EN_PREPARACION) {
    return null;
  }
  const detalles = apiError.details || {};
  const lista = (valor: any) => Array.isArray(valor) ? valor : [];
  return {
    mensaje: (apiError.message || '').trim() ||
      'El pedido ya está en preparación. Haga un pedido nuevo con lo que quiera añadir.',
    puedePedirAlmacen: lista(detalles.Opciones ?? detalles.opciones).includes(AMPLIACION_PEDIR_ALMACEN),
    pickings: lista(detalles.Pickings ?? detalles.pickings).map(Number),
    productos: lista(detalles.Productos ?? detalles.productos).map((p: any) => (p ?? '').toString().trim())
  };
}

/** Los mensajes de la ampliación que hay que enseñar tras guardar (ya vienen redactados). */
export function mensajesAmpliacionEnPreparacion(avisos: any[] | null | undefined): string[] {
  return (avisos || [])
    .filter(a => {
      const tipo = a?.Tipo ?? a?.tipo;
      return tipo === AVISO_AMPLIACION_EN_PEDIDO_NUEVO || tipo === AVISO_AMPLIACION_PEDIDA_A_ALMACEN;
    })
    .map(a => ((a?.Mensaje ?? a?.mensaje) || '').trim())
    .filter(m => !!m);
}

/**
 * El pedido nuevo que ha creado la API con lo añadido: `PedidoNuevo` de la respuesta o, si no viene, el de
 * los datos del aviso AmpliacionEnPedidoNuevo. null si no se ha creado ninguno.
 */
export function pedidoNuevoDeLaAmpliacion(respuesta: any): number | null {
  const directo = Number(respuesta?.PedidoNuevo ?? respuesta?.pedidoNuevo);
  if (directo > 0) {
    return directo;
  }
  const aviso = (respuesta?.Avisos ?? respuesta?.avisos ?? [])
    .find((a: any) => (a?.Tipo ?? a?.tipo) === AVISO_AMPLIACION_EN_PEDIDO_NUEVO);
  const datos = aviso?.Datos ?? aviso?.datos;
  const deLosDatos = Number(datos?.PedidoNuevo ?? datos?.pedidoNuevo);
  return deLosDatos > 0 ? deLosDatos : null;
}
