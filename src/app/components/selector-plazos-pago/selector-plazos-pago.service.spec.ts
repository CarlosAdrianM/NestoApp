import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SelectorPlazosPagoService } from './selector-plazos-pago.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlazosPagoService', () => {
  let service: SelectorPlazosPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(SelectorPlazosPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
