import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SelectorFormasPagoService } from './selector-formas-pago.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorFormasPagoService', () => {
  let service: SelectorFormasPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(SelectorFormasPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
