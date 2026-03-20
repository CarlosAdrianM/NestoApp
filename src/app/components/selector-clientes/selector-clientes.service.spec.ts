import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { CacheService } from '../../services/cache.service';

import { SelectorClientesService } from './selector-clientes.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorClientesService', () => {
  let service: SelectorClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, { provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SelectorClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
