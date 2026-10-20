import { carritoParaSugerencias, etiquetaMotivo, huellaSugerenciasProductos, sugerenciasVisibles } from './sugerencias-productos.model';

describe('Sugerencias de productos en la plantilla (#235)', () => {
  const s = (Producto: string, Posicion: number): any => ({ IdSugerencia: Posicion, Producto, Posicion, Nombre: Producto, Motivo: 'LeToca', Texto: '' });

  it('el carrito agrupa por producto las unidades cobradas y las de regalo', () => {
    expect(carritoParaSugerencias([
      { producto: '38000 ', cantidad: 2, cantidadOferta: 1 },
      { producto: '20000', cantidad: 0, cantidadOferta: 0 },
      { producto: '38000', cantidad: 1, cantidadOferta: 0 }
    ])).toEqual([{ Producto: '38000', Cantidad: 4 }]);
  });

  it('la huella no cambia con las cantidades ni con el orden, sí con los productos o el cliente', () => {
    const a = huellaSugerenciasProductos('1', '15191', '0', [{ Producto: 'B', Cantidad: 1 }, { Producto: 'A', Cantidad: 1 }]);
    expect(huellaSugerenciasProductos('1', '15191', '0', [{ Producto: 'A', Cantidad: 9 }, { Producto: 'B', Cantidad: 2 }])).toBe(a);
    expect(huellaSugerenciasProductos('1', '15191', '0', [{ Producto: 'A', Cantidad: 1 }])).not.toBe(a);
    expect(huellaSugerenciasProductos('1', '15191', '1', [{ Producto: 'A', Cantidad: 1 }, { Producto: 'B', Cantidad: 1 }])).not.toBe(a);
  });

  it('se ven hasta 3, por hueco, sin las que ya están en el pedido', () => {
    const visibles = sugerenciasVisibles([s('D', 4), s('B', 2), s('A', 1), s('C', 3)], [{ Producto: 'B', Cantidad: 1 }]);
    expect(visibles.map(v => v.Producto)).toEqual(['A', 'C', 'D']);
  });

  it('cada motivo con su icono, y uno desconocido como «Sugerencia»', () => {
    expect(etiquetaMotivo('LeToca')).toBe('🔁 Ya le toca');
    expect(etiquetaMotivo('Otro')).toBe('💡 Sugerencia');
  });
});
