import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { PedidosEnRiesgoService } from './pedidos-en-riesgo.service';

/** NestoApp#248 / NestoAPI#693. */
describe('PedidosEnRiesgoService (#248)', () => {
  let servicio: PedidosEnRiesgoService;
  let http: HttpTestingController;
  const URL = `${Configuracion.API_URL}/PedidosVenta/PromesaEnRiesgo`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(PedidosEnRiesgoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide los de la empresa sin vendedor (la API da los del usuario y su equipo); null es lista vacía', () => {
    let lista: any[] | undefined;
    servicio.leer().subscribe(l => lista = l);
    const peticion = http.expectOne(r => r.url === URL);
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.get('empresa')).toBe('1');
    expect(peticion.request.params.has('resueltos')).toBeFalse();
    expect(peticion.request.params.has('vendedor')).toBeFalse();
    peticion.flush(null);
    expect(lista).toEqual([]);
  });

  it('con los resueltos, lo pide', () => {
    servicio.leer(true).subscribe();
    const peticion = http.expectOne(r => r.url === URL);
    expect(peticion.request.params.get('resueltos')).toBe('true');
    peticion.flush([]);
  });

  it('lee y guarda qué avisos recibe el usuario', () => {
    servicio.leerAvisos().subscribe();
    http.expectOne({ method: 'GET', url: `${URL}/Avisos` }).flush({ Valor: 'Todo', Opciones: [] });

    servicio.guardarAvisos('SoloCorreo').subscribe();
    const put = http.expectOne({ method: 'PUT', url: `${URL}/Avisos` });
    expect(put.request.body).toEqual({ Valor: 'SoloCorreo' });
    put.flush({ Valor: 'SoloCorreo', Opciones: [] });
  });
});
