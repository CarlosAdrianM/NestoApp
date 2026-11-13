import { aplicarStockDelAlmacen, colorStock, disponibleEnAlmacen, ponerDisponibleDelAlmacen } from './stock-almacen';

describe('stock del almacén elegido (#277)', () => {
  const stocks = [
    { almacen: 'ALG', stock: 10, cantidadDisponible: 10 },
    { almacen: 'REI ', stock: 0, cantidadDisponible: 0 }
  ];

  describe('disponibleEnAlmacen', () => {
    it('toma el del almacén elegido, no el del primero de la lista', () => {
      expect(disponibleEnAlmacen({ stocks }, 'REI')).toBe(0);
      expect(disponibleEnAlmacen({ stocks }, 'alg')).toBe(10);
    });

    it('null si el almacén elegido no viene en stocks (nunca el de otro almacén)', () => {
      expect(disponibleEnAlmacen({ stocks }, 'ALC')).toBeNull();
      expect(disponibleEnAlmacen({}, 'ALG')).toBeNull();
    });
  });

  describe('ponerDisponibleDelAlmacen', () => {
    it('cambia el disponible legado (el del primer almacén) por el del elegido', () => {
      const [linea] = ponerDisponibleDelAlmacen([{ producto: '1', cantidadDisponible: 10, stocks }], 'REI');
      expect(linea.cantidadDisponible).toBe(0);
    });

    it('si el elegido no viene, deja la línea sin dato en vez de con el de otro almacén', () => {
      const [linea] = ponerDisponibleDelAlmacen([{ producto: '1', cantidadDisponible: 10, stocks, stockActualizado: true }], 'ALC');
      expect(linea.cantidadDisponible).toBe(0);
      expect(linea.stockActualizado).toBeFalse();
    });
  });

  describe('colorStock', () => {
    const base = { cantidadDisponible: 0, StockDisponibleTodosLosAlmacenes: 10, cantidadPendienteRecibir: 0, stock: 0 };

    it('sin cantidad, default', () => {
      expect(colorStock({ ...base, cantidad: 0, cantidadOferta: 0 })).toBe('default');
    });

    it('con ALG 10 y REI 0, en REI la línea no queda en verde', () => {
      expect(colorStock({ ...base, cantidad: '5', cantidadOferta: '0' })).toBe('warning');
    });

    it('verde si hay disponible en el almacén elegido (contando la oferta)', () => {
      expect(colorStock({ ...base, cantidadDisponible: 6, cantidad: 5, cantidadOferta: 1 })).toBe('success');
      expect(colorStock({ ...base, cantidadDisponible: 5, StockDisponibleTodosLosAlmacenes: 5, cantidad: 5, cantidadOferta: 1 })).toBe('danger');
    });
  });

  it('aplicarStockDelAlmacen deja la línea con el stock de CargarStocks, actualizada y con su color', () => {
    const linea: any = { cantidad: 5, cantidadOferta: 0, cantidadDisponible: 10 };
    aplicarStockDelAlmacen(linea, { stock: 0, cantidadDisponible: 0, cantidadPendienteRecibir: 0, StockDisponibleTodosLosAlmacenes: 0 });
    expect(linea.stockActualizado).toBeTrue();
    expect(linea.cantidadDisponible).toBe(0);
    expect(linea.colorStock).toBe('danger');
  });
});
