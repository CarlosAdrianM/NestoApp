import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PedidoVentaService } from './pedido-venta.service';

describe('PedidoVentaService', () => {
  let service: PedidoVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PedidoVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
