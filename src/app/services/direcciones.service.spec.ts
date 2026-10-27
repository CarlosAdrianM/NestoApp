import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DireccionesService, textoCalleNumero } from './direcciones.service';

/** NestoApp#159 / NestoAPI#578: la dirección de la ubicación del móvil, por la API (adiós al plugin nativegeocoder). */
describe('DireccionesService (#159)', () => {
  let servicio: DireccionesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(DireccionesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide la dirección de las coordenadas a la API', () => {
    let resultado: any;
    servicio.desdeCoordenadas(40.5605, -3.4702).subscribe(r => resultado = r);

    const peticion = http.expectOne(r => r.url.endsWith('/Direcciones/DesdeCoordenadas'));
    expect(peticion.request.params.get('latitud')).toBe('40.5605');
    expect(peticion.request.params.get('longitud')).toBe('-3.4702');
    peticion.flush({ Calle: 'Calle Mayor', Numero: '3', CodigoPostal: '28840', Poblacion: 'MEJORADA', Provincia: 'MADRID' });

    expect(resultado.CodigoPostal).toBe('28840');
    expect(textoCalleNumero(resultado)).toBe('Calle Mayor 3');
  });

  it('si Google no encuentra nada (404) o falla (502), null: los campos se quedan como estaban', () => {
    let resultado: any = 'sin contestar';
    servicio.desdeCoordenadas(0, 0).subscribe(r => resultado = r);
    http.expectOne(r => r.url.endsWith('/Direcciones/DesdeCoordenadas')).flush('No encontrada', { status: 404, statusText: 'Not Found' });
    expect(resultado).toBeNull();
  });

  it('sin coordenadas no se pregunta', () => {
    let resultado: any = 'sin contestar';
    servicio.desdeCoordenadas(undefined, undefined).subscribe(r => resultado = r);
    http.expectNone(r => r.url.endsWith('/Direcciones/DesdeCoordenadas'));
    expect(resultado).toBeNull();
  });

  it('el texto de calle y número ignora lo que falte', () => {
    expect(textoCalleNumero({ Calle: 'Avenida Castilla', Numero: null } as any)).toBe('Avenida Castilla');
    expect(textoCalleNumero(null)).toBe('');
  });
});
