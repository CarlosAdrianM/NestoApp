import { TestBed } from '@angular/core/testing';

import { ListaPedidosVentaService } from './lista-pedidos-venta.service';

describe('ListaPedidosVentaService', () => {
  let service: ListaPedidosVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaPedidosVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
