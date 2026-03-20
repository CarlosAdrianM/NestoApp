import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CacheService } from '../../services/cache.service';

import { SelectorPlantillaVentaService } from './selector-plantilla-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlantillaVentaService', () => {
  let service: SelectorPlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SelectorPlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
