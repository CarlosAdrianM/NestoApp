import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PlantillaVentaService } from './plantilla-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PlantillaVentaService', () => {
  let service: PlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(PlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // NestoApp#169 / NestoAPI#457
  it('pide las ofertas sugeridas con el pedido que se está montando', () => {
    const http = TestBed.inject(HttpTestingController);
    const pedido = { empresa: '1', cliente: '12345', Lineas: [{ producto: '38093', Cantidad: 5 }] };
    let recibidas: any[];

    service.ofertasSugeridas(pedido).subscribe(data => recibidas = data);

    const peticion = http.expectOne(req => req.url.endsWith('/PedidosVenta/OfertasSugeridas'));
    expect(peticion.request.method).toBe('POST');
    expect(JSON.parse(peticion.request.body).Lineas.length).toBe(1);
    peticion.flush([{ Tipo: 'AmpliarCantidad', Producto: '38093', Texto: 'Con 1 más' }]);

    expect(recibidas.length).toBe(1);
    http.verify();
  });
});
