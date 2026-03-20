import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CacheService } from '../../services/cache.service';

import { ClienteService } from './cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ClienteService', () => {
  let service: ClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [{ provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
