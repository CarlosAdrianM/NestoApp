import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CampanaSoloEnStockService } from './campana-solo-en-stock.service';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

describe('CampanaSoloEnStockService (NestoApp#293)', () => {
  let servicio: CampanaSoloEnStockService;
  let http: HttpTestingController;
  const url = `${Configuracion.API_URL}/PedidosVenta/AvisoCampanaSoloEnStock`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    servicio = TestBed.inject(CampanaSoloEnStockService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('manda el pedido tal como se va a guardar y devuelve el aviso', () => {
    const pedido = { empresa: '1', cliente: '15191', Lineas: [] };
    let respuesta: any;
    servicio.consultar(pedido).subscribe(r => respuesta = r);

    const peticion = http.expectOne(url);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body).toBe(pedido);
    peticion.flush({ HayAviso: true, Campana: 'Black Friday', Mensaje: 'Del 45929 hay 2 de 5.' });

    expect(respuesta.HayAviso).toBeTrue();
    expect(respuesta.Mensaje).toBe('Del 45929 hay 2 de 5.');
  });

  it('si la API aún no lo tiene (404) no hay aviso: se guarda como siempre', () => {
    let respuesta: any;
    servicio.consultar({}).subscribe(r => respuesta = r);
    http.expectOne(url).flush('no', { status: 404, statusText: 'Not Found' });
    expect(respuesta).toEqual({ HayAviso: false });
  });

  it('si falla (500) tampoco pregunta ni rompe el guardado', () => {
    let respuesta: any;
    let error: any;
    servicio.consultar({}).subscribe(r => respuesta = r, e => error = e);
    http.expectOne(url).flush('boom', { status: 500, statusText: 'Error' });
    expect(error).toBeUndefined();
    expect(respuesta.HayAviso).toBeFalse();
  });

  it('una respuesta vacía cuenta como sin aviso', () => {
    let respuesta: any;
    servicio.consultar({}).subscribe(r => respuesta = r);
    http.expectOne(url).flush(null);
    expect(respuesta.HayAviso).toBeFalse();
  });
});
