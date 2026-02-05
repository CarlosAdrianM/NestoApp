import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { SelectorRegalosComponent, RegaloSeleccionado } from './selector-regalos.component';
import { PlantillaVentaService } from '../plantilla-venta/plantilla-venta.service';
import { ProductoBonificable, ProductosBonificablesResponse } from '../../models/ganavisiones.model';

describe('SelectorRegalosComponent', () => {
  let component: SelectorRegalosComponent;
  let fixture: ComponentFixture<SelectorRegalosComponent>;
  let mockService: jasmine.SpyObj<PlantillaVentaService>;

  const mockProductos: ProductoBonificable[] = [
    {
      ProductoId: 'PROD1',
      ProductoNombre: 'Producto Regalo 1',
      Ganavisiones: 2,
      PVP: 10,
      Stocks: [],
      StockTotal: 5
    },
    {
      ProductoId: 'PROD2',
      ProductoNombre: 'Producto Regalo 2',
      Ganavisiones: 3,
      PVP: 15,
      Stocks: [],
      StockTotal: 10
    },
    {
      ProductoId: 'PROD3',
      ProductoNombre: 'Producto Regalo 3',
      Ganavisiones: 1,
      PVP: 5,
      Stocks: [],
      StockTotal: 0 // Sin stock
    }
  ];

  const mockResponse: ProductosBonificablesResponse = {
    GanavisionesDisponibles: 10,
    BaseImponibleBonificable: 100,
    Productos: mockProductos
  };

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('PlantillaVentaService', ['cargarProductosBonificables']);
    mockService.cargarProductosBonificables.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      declarations: [SelectorRegalosComponent],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: PlantillaVentaService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorRegalosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Carga de productos', () => {
    it('debe cargar productos cuando todos los inputs están definidos', fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';

      tick();

      expect(mockService.cargarProductosBonificables).toHaveBeenCalledWith('1', 100, 'ALG', true, '15000');
      expect(component.productosBonificables.length).toBe(3);
      expect(component.ganavisionesDisponibles).toBe(10);
    }));

    it('no debe cargar si falta algún input requerido', () => {
      component.empresa = '1';
      component.almacen = 'ALG';
      // No se define baseImponibleBonificable ni cliente

      expect(mockService.cargarProductosBonificables).not.toHaveBeenCalled();
    });

    it('debe emitir productosCargados con el número de productos', fakeAsync(() => {
      spyOn(component.productosCargados, 'emit');

      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';

      tick();

      expect(component.productosCargados.emit).toHaveBeenCalledWith(3);
    }));

    it('debe manejar errores de la API', fakeAsync(() => {
      mockService.cargarProductosBonificables.and.returnValue(throwError(() => new Error('API Error')));

      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';

      tick();

      expect(component.errorMessage).toBe('Error al cargar productos bonificables');
      expect(component.cargando).toBeFalse();
    }));
  });

  describe('Cálculo de Ganavisiones', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe calcular ganavisionesUsados correctamente', () => {
      // Seleccionar 2 unidades de PROD1 (2 ganavisiones cada uno = 4)
      component.cantidadesSeleccionadas.set('PROD1', 2);
      // Seleccionar 1 unidad de PROD2 (3 ganavisiones = 3)
      component.cantidadesSeleccionadas.set('PROD2', 1);

      expect(component.ganavisionesUsados).toBe(7); // 4 + 3 = 7
    });

    it('debe calcular ganavisionesRestantes correctamente', () => {
      component.cantidadesSeleccionadas.set('PROD1', 2); // 4 ganavisiones

      expect(component.ganavisionesRestantes).toBe(6); // 10 - 4 = 6
    });

    it('debe calcular porcentajeUsado correctamente', () => {
      component.cantidadesSeleccionadas.set('PROD1', 2); // 4 ganavisiones de 10

      expect(component.porcentajeUsado).toBe(40); // 4/10 * 100
    });

    it('porcentajeUsado no debe exceder 100', () => {
      // Forzar más ganavisiones usados que disponibles
      component.cantidadesSeleccionadas.set('PROD1', 5); // 10 ganavisiones
      component.cantidadesSeleccionadas.set('PROD2', 3); // 9 ganavisiones más = 19 total

      expect(component.porcentajeUsado).toBe(100);
    });
  });

  describe('Incrementar/Decrementar cantidad', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe incrementar cantidad si hay ganavisiones y stock disponibles', () => {
      spyOn(component.regalosChange, 'emit');

      component.incrementarCantidad(mockProductos[0]); // PROD1

      expect(component.getCantidad('PROD1')).toBe(1);
      expect(component.regalosChange.emit).toHaveBeenCalled();
    });

    it('no debe incrementar si no hay suficientes ganavisiones', () => {
      // Usar casi todos los ganavisiones
      component.cantidadesSeleccionadas.set('PROD1', 4); // 8 ganavisiones usados

      // PROD2 requiere 3 ganavisiones, solo quedan 2
      component.incrementarCantidad(mockProductos[1]);

      expect(component.getCantidad('PROD2')).toBe(0);
    });

    it('no debe incrementar si no hay stock', () => {
      // PROD3 tiene StockTotal = 0
      component.incrementarCantidad(mockProductos[2]);

      expect(component.getCantidad('PROD3')).toBe(0);
    });

    it('debe decrementar cantidad', () => {
      component.cantidadesSeleccionadas.set('PROD1', 2);
      spyOn(component.regalosChange, 'emit');

      component.decrementarCantidad(mockProductos[0]);

      expect(component.getCantidad('PROD1')).toBe(1);
      expect(component.regalosChange.emit).toHaveBeenCalled();
    });

    it('debe eliminar del mapa si la cantidad llega a 0', () => {
      component.cantidadesSeleccionadas.set('PROD1', 1);

      component.decrementarCantidad(mockProductos[0]);

      expect(component.cantidadesSeleccionadas.has('PROD1')).toBeFalse();
    });
  });

  describe('puedeIncrementar', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe retornar true si hay stock y ganavisiones suficientes', () => {
      expect(component.puedeIncrementar(mockProductos[0])).toBeTrue();
    });

    it('debe retornar false si no hay stock', () => {
      expect(component.puedeIncrementar(mockProductos[2])).toBeFalse(); // StockTotal = 0
    });

    it('debe retornar false si no hay ganavisiones suficientes', () => {
      component.cantidadesSeleccionadas.set('PROD1', 4); // 8 ganavisiones usados

      // PROD2 requiere 3, solo quedan 2
      expect(component.puedeIncrementar(mockProductos[1])).toBeFalse();
    });

    it('debe retornar false si se alcanzó el stock máximo', () => {
      component.cantidadesSeleccionadas.set('PROD1', 5); // StockTotal de PROD1 es 5

      expect(component.puedeIncrementar(mockProductos[0])).toBeFalse();
    });
  });

  describe('Restaurar regalos seleccionados', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe restaurar cantidades desde regalosSeleccionados Input', () => {
      const regalos: RegaloSeleccionado[] = [
        { producto: mockProductos[0], cantidad: 2 },
        { producto: mockProductos[1], cantidad: 1 }
      ];

      component.regalosSeleccionados = regalos;

      expect(component.getCantidad('PROD1')).toBe(2);
      expect(component.getCantidad('PROD2')).toBe(1);
    });

    it('debe limpiar cantidades si se pasa array vacío', () => {
      component.cantidadesSeleccionadas.set('PROD1', 2);

      component.regalosSeleccionados = [];

      expect(component.cantidadesSeleccionadas.size).toBe(0);
    });
  });

  describe('Limpiar selecciones inválidas', () => {
    it('debe emitir regalosInvalidados cuando se eliminan productos', fakeAsync(() => {
      // Primera carga con 3 productos
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();

      // Seleccionar un producto
      component.cantidadesSeleccionadas.set('PROD1', 1);
      component.cantidadesSeleccionadas.set('PROD_INEXISTENTE', 1);

      spyOn(component.regalosInvalidados, 'emit');

      // Simular recarga sin PROD_INEXISTENTE
      const responseWithoutProd: ProductosBonificablesResponse = {
        ...mockResponse,
        Productos: mockProductos // PROD_INEXISTENTE no está aquí
      };
      mockService.cargarProductosBonificables.and.returnValue(of(responseWithoutProd));

      component.cargarProductosBonificables();
      tick();

      expect(component.regalosInvalidados.emit).toHaveBeenCalledWith(['PROD_INEXISTENTE']);
    }));
  });

  describe('Filtrar búsqueda', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe filtrar productos por nombre', () => {
      component.filtrarBusqueda({ target: { value: 'Regalo 1' } });

      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productosFiltrados[0].ProductoId).toBe('PROD1');
    });

    it('debe filtrar productos por ID', () => {
      component.filtrarBusqueda({ target: { value: 'PROD2' } });

      expect(component.productosFiltrados.length).toBe(1);
      expect(component.productosFiltrados[0].ProductoId).toBe('PROD2');
    });

    it('debe mostrar todos los productos si el filtro está vacío', () => {
      component.filtrarBusqueda({ target: { value: '' } });

      expect(component.productosFiltrados.length).toBe(3);
    });
  });

  describe('Limpiar selección', () => {
    beforeEach(fakeAsync(() => {
      component.empresa = '1';
      component.almacen = 'ALG';
      component.baseImponibleBonificable = 100;
      component.servirJunto = true;
      component.cliente = '15000';
      tick();
    }));

    it('debe limpiar todas las cantidades seleccionadas', () => {
      component.cantidadesSeleccionadas.set('PROD1', 2);
      component.cantidadesSeleccionadas.set('PROD2', 1);
      spyOn(component.regalosChange, 'emit');

      component.limpiarSeleccion();

      expect(component.cantidadesSeleccionadas.size).toBe(0);
      expect(component.regalosChange.emit).toHaveBeenCalledWith([]);
    });
  });
});
