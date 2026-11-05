import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { EnviosAgenciasService } from './envios-agencias.service';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

/** NestoApp#267 (NestoAPI#699): Devueltos, Reenviar y Abonar. */
describe('EnviosAgenciasService (#267)', () => {
  let service: EnviosAgenciasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(EnviosAgenciasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lee los devueltos de la empresa', () => {
    let resultado: any;
    service.leerDevueltos('1').subscribe(r => resultado = r);
    const req = httpMock.expectOne(r => r.url === Configuracion.API_URL + '/EnviosAgencias/Devueltos');
    expect(req.request.params.get('empresa')).toBe('1');
    req.flush([{ Numero: 123, Decision: 'SinDecidir' }]);
    expect(resultado.length).toBe(1);
  });

  it('reenviar manda la dirección corregida y los portes', () => {
    service.reenviar(123, { Direccion: 'CALLE MAYOR, 5', IncluirPortes: false }).subscribe();
    const req = httpMock.expectOne(Configuracion.API_URL + '/EnviosAgencias/123/Reenviar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Direccion: 'CALLE MAYOR, 5', IncluirPortes: false });
    req.flush({ Decision: 'Reenviar', EnvioNuevo: 124 });
  });

  it('abonar no lleva cuerpo', () => {
    service.abonar(123).subscribe();
    const req = httpMock.expectOne(Configuracion.API_URL + '/EnviosAgencias/123/Abonar');
    expect(req.request.method).toBe('POST');
    req.flush({ Decision: 'Abonar' });
  });
});
