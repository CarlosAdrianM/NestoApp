import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CacheService } from '../../services/cache.service';

import { LineaVentaService } from './linea-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LineaVentaService', () => {
  let service: LineaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(LineaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
