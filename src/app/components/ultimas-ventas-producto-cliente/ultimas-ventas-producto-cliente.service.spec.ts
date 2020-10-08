import { TestBed } from '@angular/core/testing';

import { UltimasVentasProductoClienteService } from './ultimas-ventas-producto-cliente.service';

describe('UltimasVentasProductoClienteService', () => {
  let service: UltimasVentasProductoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UltimasVentasProductoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
