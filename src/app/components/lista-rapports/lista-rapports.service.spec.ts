import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { CacheService } from '../../services/cache.service';

import { ListaRapportsService } from './lista-rapports.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ListaRapportsService', () => {
  let service: ListaRapportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, { provide: CacheService, useValue: {} }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ListaRapportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
