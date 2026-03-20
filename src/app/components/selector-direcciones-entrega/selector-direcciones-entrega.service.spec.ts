import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SelectorDireccionesEntregaService } from './selector-direcciones-entrega.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorDireccionesEntregaService', () => {
  let service: SelectorDireccionesEntregaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(SelectorDireccionesEntregaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
