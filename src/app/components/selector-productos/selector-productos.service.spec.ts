import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CacheService } from '../../services/cache.service';

import { SelectorProductosService } from './selector-productos.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorProductosService', () => {
  let service: SelectorProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SelectorProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
