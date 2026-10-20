import { ProductoSinStock } from './ganavisiones.model';

/**
 * NestoApp#232 (Nesto#527): cuando la API no deja salir de «Todo junto» porque hay líneas que no
 * pueden quedarse pendientes (las muestras sin stock), se ofrece quitarlas en vez de rechazar sin más.
 */

const normalizar = (producto: any): string => (producto ?? '').toString().trim().toUpperCase();

/**
 * Las líneas del pedido que impiden salir de «Todo junto», o null si no se puede ofrecer quitarlas
 * (no hay productos problemáticos o alguno no está entre las líneas, p. ej. un regalo de Ganavisiones).
 */
export function lineasQueImpidenSalirDeTodoJunto<T>(
  problematicos: ProductoSinStock[] | null | undefined,
  lineas: T[] | null | undefined,
  productoDe: (linea: T) => string
): T[] | null {
  const productos = new Set((problematicos || []).map(p => normalizar(p.ProductoId)).filter(p => !!p));
  if (productos.size === 0) {
    return null;
  }
  const encontradas = (lineas || []).filter(l => productos.has(normalizar(productoDe(l))));
  const cubiertos = new Set(encontradas.map(l => normalizar(productoDe(l))));
  return [...productos].every(p => cubiertos.has(p)) ? encontradas : null;
}

export function textoOfrecerQuitarLineas(nombreModo: string, lineas: string[], verbo: 'quitarlas' | 'borrarlas' = 'quitarlas'): string {
  return `No se puede pasar el pedido a «${nombreModo}» porque estas líneas se quedarían pendientes y no está permitido:\n` +
    lineas.map(l => ` · ${l}`).join('\n') +
    `\n\n¿Quiere ${verbo} del pedido y pasarlo a «${nombreModo}»?\nSi no, el pedido se queda en «Todo junto».`;
}

/** El mensaje de la API, diciendo además que el modo vuelve a «Todo junto» (no se revierte en silencio). */
export function conAvisoTodoJunto(mensaje: string | null | undefined): string {
  let texto = (mensaje || 'No se puede cambiar el modo de entrega porque hay productos que se quedarían pendientes.').trim();
  if (!/[.!?»)]$/.test(texto)) {
    texto += '.';
  }
  return texto + ' El pedido se queda en «Todo junto».';
}

export function textoNoSeHanQuitado(nombreModo: string, mensaje: string | null | undefined, borrar: boolean = false): string {
  const [hecho, si] = borrar ? ['borrado', 'borraran'] : ['quitado', 'quitaran'];
  return `No se ha ${hecho} ninguna línea: aunque se ${si}, el pedido seguiría sin poder pasar a «${nombreModo}». ` +
    conAvisoTodoJunto(mensaje);
}

export function textoSeQuedaEnTodoJunto(nombreModo: string): string {
  return `No se ha podido pasar a «${nombreModo}»: el pedido se queda en «Todo junto».`;
}
