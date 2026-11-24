import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { CuponesService } from './cupones.service';

/** NestoApp#291 / NestoAPI#885. */
describe('CuponesService (#291)', () => {
  let service: CuponesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(CuponesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adelantar manda el motivo (sin espacios de más) al cupón por su código', () => {
    let cupon: any;
    service.adelantar('EV-2610-7K3Q', '  Viene de lejos  ').subscribe(c => cupon = c);
    const req = httpMock.expectOne(Configuracion.API_URL + '/Cupones/EV-2610-7K3Q/Adelantar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ Motivo: 'Viene de lejos' });
    req.flush({ Codigo: 'EV-2610-7K3Q', Estado: 'Activo', SePuedeUsar: true, SePuedeAdelantar: false });
    expect(cupon.Estado).toBe('Activo');
  });
});
