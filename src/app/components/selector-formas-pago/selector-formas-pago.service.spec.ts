import { TestBed } from '@angular/core/testing';

import { SelectorFormasPagoService } from './selector-formas-pago.service';

describe('SelectorFormasPagoService', () => {
  let service: SelectorFormasPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorFormasPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
