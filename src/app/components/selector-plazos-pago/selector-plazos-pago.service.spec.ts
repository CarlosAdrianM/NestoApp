import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SelectorPlazosPagoService } from './selector-plazos-pago.service';

describe('SelectorPlazosPagoService', () => {
  let service: SelectorPlazosPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SelectorPlazosPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
