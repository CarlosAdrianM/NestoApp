/**
 * NestoApp#277 (Nesto a98499ce, Novedades 1215): el stock de una línea de la plantilla tiene que ser
 * el del almacén ELEGIDO. `POST PlantillaVentas/PonerStock` rellena el campo legado `cantidadDisponible`
 * con el del primer almacén de la lista (`stocks[0]`, que además puede salir del parámetro de usuario
 * `AlmacenesPlantillaVenta`), y no devuelve `stockActualizado` ni `colorStock`. Este fichero es el único
 * sitio que decide «el disponible del almacén elegido»: nunca se usa el dato de otro almacén.
 */

const mismoAlmacen = (a: any, b: any) =>
  (a ?? '').toString().trim().toUpperCase() === (b ?? '').toString().trim().toUpperCase();

/** El disponible del almacén elegido según `stocks[]`, o null si ese almacén no viene. */
export function disponibleEnAlmacen(linea: any, almacen: string): number | null {
  const stock = (linea?.stocks || []).find((s: any) => mismoAlmacen(s?.almacen, almacen));
  return stock ? +stock.cantidadDisponible || 0 : null;
}

/**
 * Tras PonerStock: cambia el disponible legado por el del almacén elegido. Si ese almacén no viene en
 * `stocks`, la línea queda sin dato (`stockActualizado` false), y se pide con CargarStocks al abrirla.
 */
export function ponerDisponibleDelAlmacen<T = any>(lineas: T[], almacen: string): T[] {
  for (const linea of (lineas || []) as any[]) {
    const disponible = disponibleEnAlmacen(linea, almacen);
    if (disponible === null) {
      linea.cantidadDisponible = 0;
      linea.stockActualizado = false;
    } else {
      linea.cantidadDisponible = disponible;
    }
  }
  return lineas;
}

/** El color de la cantidad según el stock del almacén elegido (antes, privado en el detalle). */
export function colorStock(producto: any): string {
  const pedidas = (+producto.cantidad || 0) + (+producto.cantidadOferta || 0);
  if (pedidas === 0) return 'default';
  if (producto.cantidadDisponible >= pedidas) return 'success';
  if (producto.StockDisponibleTodosLosAlmacenes >= pedidas) return 'warning';
  if (producto.cantidadDisponible + producto.cantidadPendienteRecibir >= pedidas) return 'primary';
  if (producto.stock >= pedidas) return 'dark';
  return 'danger';
}

/** Lo que devuelve `GET PlantillaVentas/CargarStocks?almacen=` (ya es del almacén pedido). */
export function aplicarStockDelAlmacen(producto: any, data: any): void {
  producto.stockActualizado = true;
  producto.stock = data.stock;
  producto.cantidadDisponible = data.cantidadDisponible;
  producto.cantidadPendienteRecibir = data.cantidadPendienteRecibir;
  producto.StockDisponibleTodosLosAlmacenes = data.StockDisponibleTodosLosAlmacenes;
  producto.colorStock = colorStock(producto);
}
