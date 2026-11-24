import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { DondeEstaLoQueFaltaService } from './donde-esta-lo-que-falta.service';

describe('DondeEstaLoQueFaltaService (#289)', () => {
  let servicio: DondeEstaLoQueFaltaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    servicio = TestBed.inject(DondeEstaLoQueFaltaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('pide el pedido por empresa y número (empresa sin espacios)', () => {
    let respuesta: any = null;
    servicio.leer('1  ', 930942).subscribe(r => respuesta = r);

    const peticion = http.expectOne(`${Configuracion.API_URL}/PedidosVenta/1/930942/DondeEstaLoQueFalta`);
    expect(peticion.request.method).toBe('GET');
    peticion.flush({ Empresa: '1', Pedido: 930942, TodoEnAlgete: true, Mensaje: 'Todo está en Algete', Productos: [] });

    expect(respuesta.TodoEnAlgete).toBeTrue();
  });
});
