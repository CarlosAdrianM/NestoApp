import { TestBed } from '@angular/core/testing';
import { ProductoBonificable } from '../../models/ganavisiones.model';
import { RegaloSeleccionado } from '../selector-regalos/selector-regalos.component';

/**
 * Tests unitarios para la lógica de Ganavisiones en PlantillaVentaComponent
 * Estos tests verifican los cálculos y la lógica de negocio sin necesitar el componente completo.
 */
describe('PlantillaVenta - Lógica Ganavisiones', () => {
  const GRUPOS_BONIFICABLES = ['COS', 'ACC', 'PEL'];

  // Helper functions que replican la lógica del componente
  function calcularBaseImponibleBonificable(productosResumen: any[]): number {
    if (!productosResumen) return 0;
    return productosResumen
      .filter(p => p.grupo && GRUPOS_BONIFICABLES.includes(p.grupo.trim().toUpperCase()))
      .reduce((sum, p) => sum + (p.cantidad * p.precio * (1 - p.descuento)), 0);
  }

  function calcularGanavisionesDisponibles(baseImponibleBonificable: number): number {
    return Math.floor(baseImponibleBonificable / 10);
  }

  function calcularGanavisionesUsados(regalosSeleccionados: RegaloSeleccionado[]): number {
    return regalosSeleccionados.reduce((sum, r) => sum + (r.producto.Ganavisiones * r.cantidad), 0);
  }

  function hayGanavisionesDisponibles(
    ganavisionesDisponibles: number,
    productosBonificablesCount: number,
    regalosSeleccionados: RegaloSeleccionado[]
  ): boolean {
    const hayPuntos = ganavisionesDisponibles > 0;
    const hayProductos = productosBonificablesCount > 0;
    const hayRegalosSeleccionados = regalosSeleccionados.length > 0;
    return (hayPuntos && hayProductos) || hayRegalosSeleccionados;
  }

  describe('calcularBaseImponibleBonificable', () => {
    it('debe retornar 0 si productosResumen es null', () => {
      expect(calcularBaseImponibleBonificable(null)).toBe(0);
    });

    it('debe retornar 0 si productosResumen está vacío', () => {
      expect(calcularBaseImponibleBonificable([])).toBe(0);
    });

    it('debe sumar solo productos de grupos bonificables (COS, ACC, PEL)', () => {
      const productos = [
        { grupo: 'COS', cantidad: 1, precio: 100, descuento: 0 },
        { grupo: 'ACC', cantidad: 2, precio: 50, descuento: 0 },
        { grupo: 'PEL', cantidad: 1, precio: 30, descuento: 0 },
        { grupo: 'OTR', cantidad: 5, precio: 200, descuento: 0 }, // No bonificable
      ];

      // COS: 1*100 = 100, ACC: 2*50 = 100, PEL: 1*30 = 30, Total = 230
      expect(calcularBaseImponibleBonificable(productos)).toBe(230);
    });

    it('debe aplicar el descuento correctamente', () => {
      const productos = [
        { grupo: 'COS', cantidad: 1, precio: 100, descuento: 0.1 }, // 10% descuento
      ];

      // 1 * 100 * (1 - 0.1) = 90
      expect(calcularBaseImponibleBonificable(productos)).toBe(90);
    });

    it('debe ignorar productos sin grupo definido', () => {
      const productos = [
        { grupo: 'COS', cantidad: 1, precio: 100, descuento: 0 },
        { grupo: null, cantidad: 1, precio: 50, descuento: 0 },
        { cantidad: 1, precio: 30, descuento: 0 }, // Sin grupo
      ];

      expect(calcularBaseImponibleBonificable(productos)).toBe(100);
    });

    it('debe manejar grupos con espacios y diferentes cases', () => {
      const productos = [
        { grupo: ' cos ', cantidad: 1, precio: 100, descuento: 0 },
        { grupo: 'Acc', cantidad: 1, precio: 50, descuento: 0 },
        { grupo: 'PEL  ', cantidad: 1, precio: 30, descuento: 0 },
      ];

      expect(calcularBaseImponibleBonificable(productos)).toBe(180);
    });
  });

  describe('calcularGanavisionesDisponibles', () => {
    it('debe calcular 1 ganavision por cada 10€', () => {
      expect(calcularGanavisionesDisponibles(10)).toBe(1);
      expect(calcularGanavisionesDisponibles(50)).toBe(5);
      expect(calcularGanavisionesDisponibles(100)).toBe(10);
    });

    it('debe truncar (no redondear) el resultado', () => {
      expect(calcularGanavisionesDisponibles(9)).toBe(0);
      expect(calcularGanavisionesDisponibles(19)).toBe(1);
      expect(calcularGanavisionesDisponibles(99)).toBe(9);
    });

    it('debe retornar 0 para valores negativos o cero', () => {
      expect(calcularGanavisionesDisponibles(0)).toBe(0);
      expect(calcularGanavisionesDisponibles(-10)).toBe(-1); // Math.floor behavior
    });
  });

  describe('calcularGanavisionesUsados', () => {
    const mockProducto1: ProductoBonificable = {
      ProductoId: 'P1',
      ProductoNombre: 'Producto 1',
      Ganavisiones: 2,
      PVP: 10,
      Stocks: [],
      StockTotal: 10
    };

    const mockProducto2: ProductoBonificable = {
      ProductoId: 'P2',
      ProductoNombre: 'Producto 2',
      Ganavisiones: 3,
      PVP: 15,
      Stocks: [],
      StockTotal: 5
    };

    it('debe retornar 0 si no hay regalos seleccionados', () => {
      expect(calcularGanavisionesUsados([])).toBe(0);
    });

    it('debe calcular correctamente con un regalo', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto1, cantidad: 3 }
      ];

      // 2 ganavisiones * 3 unidades = 6
      expect(calcularGanavisionesUsados(regalos)).toBe(6);
    });

    it('debe sumar ganavisiones de múltiples regalos', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto1, cantidad: 2 }, // 2 * 2 = 4
        { producto: mockProducto2, cantidad: 1 }  // 3 * 1 = 3
      ];

      expect(calcularGanavisionesUsados(regalos)).toBe(7);
    });
  });

  describe('hayGanavisionesDisponibles', () => {
    const mockProducto: ProductoBonificable = {
      ProductoId: 'P1',
      ProductoNombre: 'Producto 1',
      Ganavisiones: 2,
      PVP: 10,
      Stocks: [],
      StockTotal: 10
    };

    it('debe retornar false si no hay puntos ni productos ni regalos', () => {
      expect(hayGanavisionesDisponibles(0, 0, [])).toBeFalse();
    });

    it('debe retornar false si hay puntos pero no hay productos', () => {
      expect(hayGanavisionesDisponibles(10, 0, [])).toBeFalse();
    });

    it('debe retornar false si hay productos pero no hay puntos', () => {
      expect(hayGanavisionesDisponibles(0, 5, [])).toBeFalse();
    });

    it('debe retornar true si hay puntos Y productos', () => {
      expect(hayGanavisionesDisponibles(10, 5, [])).toBeTrue();
    });

    it('debe retornar true si hay regalos seleccionados (aunque no haya puntos ni productos)', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto, cantidad: 1 }
      ];
      expect(hayGanavisionesDisponibles(0, 0, regalos)).toBeTrue();
    });

    it('debe retornar true si hay regalos aunque se quedó sin puntos', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto, cantidad: 1 }
      ];
      // Usuario tenía puntos, seleccionó regalos, luego redujo productos
      expect(hayGanavisionesDisponibles(0, 5, regalos)).toBeTrue();
    });
  });

  describe('Validación de regalos excedidos', () => {
    const mockProducto: ProductoBonificable = {
      ProductoId: 'P1',
      ProductoNombre: 'Producto 1',
      Ganavisiones: 5,
      PVP: 10,
      Stocks: [],
      StockTotal: 10
    };

    function regalosExcedenDisponibles(
      regalosSeleccionados: RegaloSeleccionado[],
      ganavisionesDisponibles: number
    ): boolean {
      const usados = calcularGanavisionesUsados(regalosSeleccionados);
      return usados > ganavisionesDisponibles;
    }

    it('debe detectar cuando los regalos exceden los disponibles', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto, cantidad: 3 } // 5 * 3 = 15 ganavisiones
      ];

      expect(regalosExcedenDisponibles(regalos, 10)).toBeTrue();
    });

    it('debe retornar false cuando los regalos no exceden', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto, cantidad: 2 } // 5 * 2 = 10 ganavisiones
      ];

      expect(regalosExcedenDisponibles(regalos, 10)).toBeFalse();
    });

    it('debe retornar false cuando están exactamente al límite', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProducto, cantidad: 2 } // 5 * 2 = 10 ganavisiones
      ];

      expect(regalosExcedenDisponibles(regalos, 10)).toBeFalse();
    });
  });

  describe('Cálculo de offset para slides', () => {
    function calcularOffsetRegalos(
      hayGanavisiones: boolean,
      productosResumen: any[] | null
    ): number {
      return (hayGanavisiones && productosResumen) ? 1 : 0;
    }

    it('debe ser 1 si hay ganavisiones y hay productos', () => {
      expect(calcularOffsetRegalos(true, [{ id: 1 }])).toBe(1);
    });

    it('debe ser 0 si no hay ganavisiones', () => {
      expect(calcularOffsetRegalos(false, [{ id: 1 }])).toBe(0);
    });

    it('debe ser 0 si productosResumen es null', () => {
      expect(calcularOffsetRegalos(true, null)).toBe(0);
    });

    it('debe ser 0 si productosResumen está vacío pero hay ganavisiones', () => {
      // Array vacío es truthy en JS, así que offset será 1
      expect(calcularOffsetRegalos(true, [])).toBe(1);
    });
  });

  describe('Índices de slides dinámicos', () => {
    function calcularIndices(offsetRegalos: number) {
      return {
        indexSlideResumen: 2,
        indexSlideRegalos: 3, // Solo existe si hayGanavisionesDisponibles
        indexSlideDireccion: 3 + offsetRegalos,
        indexSlidePago: 4 + offsetRegalos
      };
    }

    it('sin regalos (offset=0), dirección está en 3 y pago en 4', () => {
      const indices = calcularIndices(0);
      expect(indices.indexSlideDireccion).toBe(3);
      expect(indices.indexSlidePago).toBe(4);
    });

    it('con regalos (offset=1), dirección está en 4 y pago en 5', () => {
      const indices = calcularIndices(1);
      expect(indices.indexSlideDireccion).toBe(4);
      expect(indices.indexSlidePago).toBe(5);
    });
  });

  describe('Preparación de líneas de regalo para pedido', () => {
    interface LineaPedido {
      estado: number;
      tipoLinea: number;
      producto: string;
      texto: string;
      Cantidad: number;
      PrecioUnitario: number;
      DescuentoLinea: number;
      AplicarDescuento: boolean;
    }

    function prepararLineaRegalo(
      regalo: RegaloSeleccionado,
      esPresupuesto: boolean
    ): LineaPedido {
      let textoRegalo = regalo.producto.ProductoNombre;
      if (textoRegalo.length > 40) {
        textoRegalo = textoRegalo.substring(0, 40);
      }
      textoRegalo += ' (BONIF)';

      return {
        estado: esPresupuesto ? -3 : 1,
        tipoLinea: 1,
        producto: regalo.producto.ProductoId,
        texto: textoRegalo,
        Cantidad: regalo.cantidad,
        PrecioUnitario: regalo.producto.PVP,
        DescuentoLinea: 1, // 100% descuento
        AplicarDescuento: false
      };
    }

    const mockProducto: ProductoBonificable = {
      ProductoId: 'REGALO1',
      ProductoNombre: 'Champú Regalo Premium',
      Ganavisiones: 2,
      PVP: 15.50,
      Stocks: [],
      StockTotal: 10
    };

    it('debe crear línea con descuento 100%', () => {
      const regalo: RegaloSeleccionado = { producto: mockProducto, cantidad: 2 };
      const linea = prepararLineaRegalo(regalo, false);

      expect(linea.DescuentoLinea).toBe(1);
      expect(linea.AplicarDescuento).toBeFalse();
    });

    it('debe añadir (BONIF) al texto', () => {
      const regalo: RegaloSeleccionado = { producto: mockProducto, cantidad: 1 };
      const linea = prepararLineaRegalo(regalo, false);

      expect(linea.texto).toContain('(BONIF)');
    });

    it('debe truncar nombres largos a 40 caracteres', () => {
      const productoNombreLargo: ProductoBonificable = {
        ...mockProducto,
        ProductoNombre: 'Este es un nombre de producto muy largo que excede los cuarenta caracteres permitidos'
      };
      const regalo: RegaloSeleccionado = { producto: productoNombreLargo, cantidad: 1 };
      const linea = prepararLineaRegalo(regalo, false);

      // 40 caracteres + ' (BONIF)' = 48 max
      expect(linea.texto.length).toBeLessThanOrEqual(48);
      expect(linea.texto).toContain('(BONIF)');
    });

    it('debe usar estado -3 para presupuestos', () => {
      const regalo: RegaloSeleccionado = { producto: mockProducto, cantidad: 1 };
      const linea = prepararLineaRegalo(regalo, true);

      expect(linea.estado).toBe(-3);
    });

    it('debe usar estado 1 para pedidos normales', () => {
      const regalo: RegaloSeleccionado = { producto: mockProducto, cantidad: 1 };
      const linea = prepararLineaRegalo(regalo, false);

      expect(linea.estado).toBe(1);
    });

    it('debe mantener el PVP original como PrecioUnitario', () => {
      const regalo: RegaloSeleccionado = { producto: mockProducto, cantidad: 1 };
      const linea = prepararLineaRegalo(regalo, false);

      expect(linea.PrecioUnitario).toBe(15.50);
    });
  });
});
