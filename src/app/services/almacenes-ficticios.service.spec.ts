import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { AlmacenesFicticiosService } from './almacenes-ficticios.service';

/** NestoApp#292 / NestoAPI#894. */
describe('AlmacenesFicticiosService (#292)', () => {
  let service: AlmacenesFicticiosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(AlmacenesFicticiosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lee los almacenes que puede ver; sin cuerpo, lista vacía', () => {
    let resultado: any;
    service.leerAlmacenes().subscribe(r => resultado = r);
    httpMock.expectOne(Configuracion.API_URL + '/AlmacenesFicticios').flush([{ Codigo: 'IF', EsSuyo: true }]);
    expect(resultado.length).toBe(1);

    service.leerAlmacenes().subscribe(r => resultado = r);
    httpMock.expectOne(Configuracion.API_URL + '/AlmacenesFicticios').flush(null);
    expect(resultado).toEqual([]);
  });

  it('lee las existencias de un almacén (el código, limpio y codificado)', () => {
    let resultado: any;
    service.leerExistencias(' IF ').subscribe(r => resultado = r);
    const req = httpMock.expectOne(Configuracion.API_URL + '/AlmacenesFicticios/IF/Existencias');
    expect(req.request.method).toBe('GET');
    req.flush({ Almacen: 'IF', Productos: [{ Producto: '45958', Unidades: 3 }], NumeroProductos: 1, TotalUnidades: 3 });
    expect(resultado.Productos.length).toBe(1);
    expect(resultado.TotalUnidades).toBe(3);
  });

  it('sin productos en la respuesta, lista vacía', () => {
    let resultado: any;
    service.leerExistencias('IF').subscribe(r => resultado = r);
    httpMock.expectOne(Configuracion.API_URL + '/AlmacenesFicticios/IF/Existencias').flush({ Almacen: 'IF', Productos: null });
    expect(resultado.Productos).toEqual([]);
  });
});
