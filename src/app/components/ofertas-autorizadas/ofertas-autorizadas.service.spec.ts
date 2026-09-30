import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OfertasAutorizadasService } from './ofertas-autorizadas.service';
import { Configuracion } from '../configuracion/configuracion/configuracion.component';
import { OfertasAutorizadas } from '../../models/ofertas-autorizadas.model';

/** NestoApp#204 / NestoAPI#233: una sola llamada al endpoint agregado, con respaldo a los tres listados. */
describe('OfertasAutorizadasService (#204)', () => {
  let servicio: OfertasAutorizadasService;
  let http: HttpTestingController;
  const base = Configuracion.API_URL;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    servicio = TestBed.inject(OfertasAutorizadasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const familia = (nOrden: number, denegar?: boolean) =>
    ({ NOrden: nOrden, Empresa: '1', Familia: 'Roseta', FamiliaDescripcion: 'Roseta Cosmetics', CantidadConPrecio: 6, CantidadRegalo: 2, FiltroProducto: 'CERA', Denegar: denegar });

  it('lee las tres pestañas de GET api/OfertasAutorizadas', () => {
    let resultado: OfertasAutorizadas;
    servicio.cargarTodas().subscribe(r => resultado = r);

    const peticion = http.expectOne(r => r.url === base + '/OfertasAutorizadas');
    expect(peticion.request.params.get('empresa')).toBe(Configuracion.EMPRESA_POR_DEFECTO);
    peticion.flush({ Combinadas: [{ Id: 12 }], Familias: [familia(7)], Escalonadas: [{ Id: 3 }] });

    expect(resultado.combinadas.map(c => c.Id)).toEqual([12]);
    expect(resultado.familias.map(f => f.NOrden)).toEqual([7]);
    expect(resultado.escalonadas.map(e => e.Id)).toEqual([3]);
  });

  it('una pestaña que no viene se queda vacía', () => {
    let resultado: OfertasAutorizadas;
    servicio.cargarTodas().subscribe(r => resultado = r);

    http.expectOne(r => r.url === base + '/OfertasAutorizadas').flush({ Combinadas: [{ Id: 12 }] });

    expect(resultado.familias).toEqual([]);
    expect(resultado.escalonadas).toEqual([]);
  });

  it('con una API sin el endpoint, lee los tres listados y quita las denegaciones', () => {
    let resultado: OfertasAutorizadas;
    servicio.cargarTodas().subscribe(r => resultado = r);

    http.expectOne(r => r.url === base + '/OfertasAutorizadas').flush('Not Found', { status: 404, statusText: 'Not Found' });
    http.expectOne(r => r.url === base + '/OfertasCombinadas').flush([{ Id: 12 }]);
    http.expectOne(r => r.url === base + '/OfertasPermitidasFamilia').flush([familia(7), familia(8, true)]);
    http.expectOne(r => r.url === base + '/OfertasEscalonadas').flush([]);

    expect(resultado.combinadas.length).toBe(1);
    expect(resultado.familias.map(f => f.NOrden)).toEqual([7]);
  });
});
