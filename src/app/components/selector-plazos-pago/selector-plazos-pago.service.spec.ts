import { TestBed } from '@angular/core/testing';

import { SelectorPlazosPagoService } from './selector-plazos-pago.service';

describe('SelectorPlazosPagoService', () => {
  let service: SelectorPlazosPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorPlazosPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
