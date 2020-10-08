import { TestBed } from '@angular/core/testing';

import { PedidoVentaService } from './pedido-venta.service';

describe('PedidoVentaService', () => {
  let service: PedidoVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
