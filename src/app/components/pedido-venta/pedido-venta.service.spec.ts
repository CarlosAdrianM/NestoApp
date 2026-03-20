import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PedidoVentaService } from './pedido-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PedidoVentaService', () => {
  let service: PedidoVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(PedidoVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
