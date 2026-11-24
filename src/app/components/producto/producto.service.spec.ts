import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';

import { ProductoService } from './producto.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProductoService', () => {
  let service: ProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('NestoApp#283: próxima entrada', () => {
    let http: HttpTestingController;
    beforeEach(() => { http = TestBed.inject(HttpTestingController); });
    afterEach(() => http.verify());

    it('pide la de Algete de la empresa 1 y devuelve el Texto', () => {
      let texto: string | undefined;
      service.cargarProximaEntrada(' 45929 ').subscribe(t => texto = t);
      const req = http.expectOne(r => r.url.endsWith('/Productos/ProximaEntrada'));
      expect(req.request.params.get('producto')).toBe('45929');
      expect(req.request.params.get('almacen')).toBe('ALG');
      expect(req.request.params.get('empresa')).toBe('1');
      req.flush({ Producto: '45929', Tipo: 'Orientativa', Texto: 'Orientativa: no hay pedido; si se pidiera hoy, llegaría hacia el 28/11.' });
      expect(texto).toBe('Orientativa: no hay pedido; si se pidiera hoy, llegaría hacia el 28/11.');
    });

    it('si falla (404, API anterior…) devuelve vacío y no lanza', () => {
      let texto: string | undefined;
      service.cargarProximaEntrada('45929').subscribe(t => texto = t);
      http.expectOne(r => r.url.endsWith('/Productos/ProximaEntrada')).flush('no', { status: 404, statusText: 'Not Found' });
      expect(texto).toBe('');
    });
  });
});
