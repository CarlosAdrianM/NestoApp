/**
 * NestoApp#233 (NestoAPI#649, Nesto#531): un pedido que sale por ruta desde Algete solo puede llevar
 * en las muestras (material promocional) las unidades que hay allí: no se reponen para un pedido. La
 * API lo rechaza al grabar; la plantilla lo ofrece arreglar antes.
 */
export const RUTAS_QUE_SALEN_DE_ALGETE = ['AT', '16', '00', 'FW'];
export const ALMACEN_ALGETE = 'ALG';

export function esMuestra(linea: any): boolean {
  const subGrupo = (linea?.subGrupo ?? '').toString().trim().toLowerCase();
  return subGrupo === 'mmp' || subGrupo === 'muestras y material promocional';
}

export function saleDeAlgetePorRuta(ruta: string | null | undefined, almacen: string | null | undefined): boolean {
  return RUTAS_QUE_SALEN_DE_ALGETE.includes((ruta ?? '').toString().trim().toUpperCase()) &&
    (almacen ?? '').toString().trim().toUpperCase() === ALMACEN_ALGETE;
}

/** Las muestras nuevas que piden más de lo que hay en Algete (solo si el stock está actualizado). */
export function muestrasPorEncimaDeAlgete(lineas: any[] | null | undefined, esNueva: (linea: any) => boolean = () => true): any[] {
  return (lineas || []).filter(l => esMuestra(l) && esNueva(l) && l.stockActualizado &&
    +l.cantidad > 0 && (+l.cantidadDisponible || 0) < +l.cantidad);
}

export function textoMuestrasAlgete(lineas: any[]): string {
  const detalle = lineas.map(l => {
    const disponible = Math.max(0, +l.cantidadDisponible || 0);
    const hay = disponible === 0 ? 'no hay ninguna' : `solo hay ${disponible}`;
    return ` · ${(l.producto ?? '').toString().trim()} ${l.texto || ''}: pide ${+l.cantidad}, ${hay} en Algete`;
  }).join('\n');
  const pregunta = lineas.length === 1
    ? '¿Quiere dejarla en lo que hay en Algete (si no hay ninguna, se quita del pedido) y grabar el pedido?'
    : '¿Quiere dejarlas en lo que hay en Algete (las que no tienen ninguna se quitan del pedido) y grabar el pedido?';
  return 'Este pedido sale por ruta desde Algete y las muestras solo pueden llevar las unidades que hay allí ' +
    `(no se reponen para un pedido):\n${detalle}\n\n${pregunta}\nSi no, el pedido no se graba y puede cambiarlas usted.`;
}
