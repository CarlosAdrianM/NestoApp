import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { CacheService } from '../../services/cache.service';

import { ListaRapportsService } from './lista-rapports.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ListaRapportsService', () => {
  let service: ListaRapportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, { provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ListaRapportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarSugerenciasContacto (#212)', () => {
    let http: HttpTestingController;
    beforeEach(() => http = TestBed.inject(HttpTestingController));
    afterEach(() => http.verify());

    it('pide las sugerencias del vendedor al endpoint de NestoAPI#603', () => {
      let respuesta: any;
      service.cargarSugerenciasContacto('MPP').subscribe(r => respuesta = r);

      const peticion = http.expectOne(r => r.url.endsWith('/Clientes/SugerenciasContacto'));
      expect(peticion.request.params.get('vendedor')).toBe('MPP');
      expect(peticion.request.params.get('numero')).toBe('20');
      peticion.flush({ Vendedor: 'MPP', Ritmo: null, Sugerencias: [] });

      expect(respuesta.Vendedor).toBe('MPP');
    });

    it('si la API no tiene el endpoint (404) devuelve null en vez de un error', () => {
      let respuesta: any = 'sin llegar';
      service.cargarSugerenciasContacto('MPP').subscribe(r => respuesta = r);

      http.expectOne(r => r.url.endsWith('/Clientes/SugerenciasContacto')).flush('No encontrado', { status: 404, statusText: 'Not Found' });

      expect(respuesta).toBeNull();
    });

    it('otros errores sí llegan como error', () => {
      let error: any;
      service.cargarSugerenciasContacto('MPP').subscribe({ error: e => error = e });

      http.expectOne(r => r.url.endsWith('/Clientes/SugerenciasContacto')).flush('Mal', { status: 500, statusText: 'Error' });

      expect(error).toBeTruthy();
    });
  });
});
