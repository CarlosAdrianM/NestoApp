import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UltimasVentasProductoClienteService } from './ultimas-ventas-producto-cliente.service';

describe('UltimasVentasProductoClienteService', () => {
  let service: UltimasVentasProductoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UltimasVentasProductoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
