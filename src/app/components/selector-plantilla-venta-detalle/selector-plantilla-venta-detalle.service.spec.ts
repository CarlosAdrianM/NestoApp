import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SelectorPlantillaVentaDetalleService } from './selector-plantilla-venta-detalle.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlantillaVentaDetalleService', () => {
  let service: SelectorPlantillaVentaDetalleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(SelectorPlantillaVentaDetalleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('actualizarPrecioProducto (#282)', () => {
    it('manda la cantidad de oferta para que la API pueda devolver el precio especial con el N+M', () => {
      const producto = { producto: '45931', cantidad: 6, cantidadOferta: 1, aplicarDescuento: false };

      service.actualizarPrecioProducto(producto, '15191').subscribe();

      const req = httpMock.expectOne(r => r.url.endsWith('/PlantillaVentas/CargarPrecio'));
      expect(req.request.params.get('cantidad')).toBe('6');
      expect(req.request.params.get('cantidadOferta')).toBe('1');
      expect(req.request.params.get('aplicarDescuento')).toBe('false');
      req.flush({ precio: 28, descuento: 0, aplicarDescuento: false });
    });

    it('manda cantidadOferta=0 si la línea no lleva oferta (o la trae vacía)', () => {
      const producto = { producto: '45931', cantidad: 6, cantidadOferta: undefined, aplicarDescuento: true };

      service.actualizarPrecioProducto(producto, '15191').subscribe();

      const req = httpMock.expectOne(r => r.url.endsWith('/PlantillaVentas/CargarPrecio'));
      expect(req.request.params.get('cantidadOferta')).toBe('0');
      req.flush({ precio: 34.93, descuento: 0, aplicarDescuento: true });
    });
  });
});
