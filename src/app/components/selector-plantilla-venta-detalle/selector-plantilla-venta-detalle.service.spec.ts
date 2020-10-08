import { TestBed } from '@angular/core/testing';

import { SelectorPlantillaVentaDetalleService } from './selector-plantilla-venta-detalle.service';

describe('SelectorPlantillaVentaDetalleService', () => {
  let service: SelectorPlantillaVentaDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorPlantillaVentaDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
