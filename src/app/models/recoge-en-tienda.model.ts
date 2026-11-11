/**
 * NestoApp#205 (gemela de NestoAPI#571): «Recoge en tienda». La lógica vive en la API: con `RecogeEnTienda = true` pone
 * la ruta de recogida del almacén (ALG→AM, ALC→ALC, REI→REI) y quita portes y comisión de reembolso; al leer, es true si
 * la ruta es de recogida. Aquí solo la pantalla: en Alcobendas y Reina se recoge siempre (fijo y marcado), en Algete se
 * elige (desmarcado por defecto) y en cualquier otro almacén no se ofrece (se manda null: no tocar).
 */
export const ALMACENES_QUE_SIEMPRE_RECOGEN = ['ALC', 'REI'];
export const ALMACENES_CON_RECOGIDA = ['ALG', ...ALMACENES_QUE_SIEMPRE_RECOGEN];
export const RUTAS_DE_RECOGIDA = ['AM', 'ALC', 'REI'];

const limpio = (valor: string | null | undefined): string => (valor || '').toString().trim().toUpperCase();

/** Alcobendas y Reina: el pedido se recoge siempre en la tienda (la API rechaza desmarcarlo). */
export function almacenObligaARecoger(almacen: string | null | undefined): boolean {
  return ALMACENES_QUE_SIEMPRE_RECOGEN.includes(limpio(almacen));
}

/** Solo Algete, Alcobendas y Reina son tiendas de recogida. */
export function almacenPermiteRecoger(almacen: string | null | undefined): boolean {
  return ALMACENES_CON_RECOGIDA.includes(limpio(almacen));
}

/** Lo que se ve en el interruptor: siempre marcado donde se recoge siempre; lo elegido en Algete; desmarcado en el resto. */
export function recogeEnTiendaEfectivo(almacen: string | null | undefined, marcado: boolean | null | undefined): boolean {
  return almacenObligaARecoger(almacen) || (almacenPermiteRecoger(almacen) && !!marcado);
}

/** Lo que viaja a la API: true/false donde se puede recoger; null (no tocar) en cualquier otro almacén. */
export function recogeEnTiendaParaGuardar(almacen: string | null | undefined, marcado: boolean | null | undefined): boolean | null {
  return almacenPermiteRecoger(almacen) ? recogeEnTiendaEfectivo(almacen, marcado) : null;
}

/** Al leer un pedido que no trae la marca (el de la plantilla): se recoge si su ruta es de recogida. */
export function esRutaDeRecogida(ruta: string | null | undefined): boolean {
  return RUTAS_DE_RECOGIDA.includes(limpio(ruta));
}

export const TEXTO_PORTES_RECOGE_EN_TIENDA = 'Recoge en tienda: sin portes ni comisión de reembolso';
