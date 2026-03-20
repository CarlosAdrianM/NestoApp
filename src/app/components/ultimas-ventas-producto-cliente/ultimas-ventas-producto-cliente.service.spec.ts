import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { UltimasVentasProductoClienteService } from './ultimas-ventas-producto-cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UltimasVentasProductoClienteService', () => {
  let service: UltimasVentasProductoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(UltimasVentasProductoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
