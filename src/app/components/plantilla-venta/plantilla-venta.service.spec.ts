import { TestBed } from '@angular/core/testing';

import { PlantillaVentaService } from './plantilla-venta.service';

describe('PlantillaVentaService', () => {
  let service: PlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
