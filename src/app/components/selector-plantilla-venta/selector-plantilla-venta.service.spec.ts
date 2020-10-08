import { TestBed } from '@angular/core/testing';

import { SelectorPlantillaVentaService } from './selector-plantilla-venta.service';

describe('SelectorPlantillaVentaService', () => {
  let service: SelectorPlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorPlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
