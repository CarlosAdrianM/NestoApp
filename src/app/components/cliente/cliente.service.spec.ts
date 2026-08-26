import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CacheService } from '../../services/cache.service';

import { ClienteService } from './cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: CacheService, useValue: { clearGroup: () => {} } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNifIncorrectos (issue #157)', () => {
    it('filtra por vendedor cuando se le pasa', () => {
      service.getNifIncorrectos('12').subscribe();

      const req = httpMock.expectOne(r => r.url === Configuracion.API_URL + '/Clientes/NifIncorrectos');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('vendedor')).toBe('12');
      req.flush([]);
    });

    it('no manda el parámetro vendedor cuando se omite', () => {
      service.getNifIncorrectos().subscribe();

      const req = httpMock.expectOne(r => r.url === Configuracion.API_URL + '/Clientes/NifIncorrectos');
      expect(req.request.params.has('vendedor')).toBeFalse();
      req.flush([]);
    });

    it('transforma la respuesta PascalCase a camelCase', () => {
      let resultado: any;
      service.getNifIncorrectos('12').subscribe(r => resultado = r);

      const req = httpMock.expectOne(r => r.url === Configuracion.API_URL + '/Clientes/NifIncorrectos');
      req.flush([{ Cliente: '15528', Nif: 'X', TienePedidoPendiente: true }]);

      expect(resultado[0].cliente).toBe('15528');
      expect(resultado[0].tienePedidoPendiente).toBeTrue();
    });
  });

  describe('corregirNif (issue #157)', () => {
    it('hace POST con Cliente y Nif en el body', () => {
      service.corregirNif('15528', '12345678Z').subscribe();

      const req = httpMock.expectOne(Configuracion.API_URL + '/Clientes/CorregirNif');
      expect(req.request.method).toBe('POST');
      expect(JSON.parse(req.request.body)).toEqual({ Cliente: '15528', Nif: '12345678Z' });
      req.flush({ Corregido: true });
    });

    it('transforma la respuesta a camelCase', () => {
      let resultado: any;
      service.corregirNif('15528', '12345678Z').subscribe(r => resultado = r);

      const req = httpMock.expectOne(Configuracion.API_URL + '/Clientes/CorregirNif');
      req.flush({ Corregido: true, NombreAeat: 'JUAN', ContactosActualizados: 2, FacturasActualizadas: 1 });

      expect(resultado.corregido).toBeTrue();
      expect(resultado.nombreAeat).toBe('JUAN');
      expect(resultado.contactosActualizados).toBe(2);
    });
  });
});
