import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SelectorPlantillaVentaDetalleService } from './selector-plantilla-venta-detalle.service';

describe('SelectorPlantillaVentaDetalleService', () => {
  let service: SelectorPlantillaVentaDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(SelectorPlantillaVentaDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
