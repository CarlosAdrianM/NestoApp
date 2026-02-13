import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PlantillaVentaService } from './plantilla-venta.service';

describe('PlantillaVentaService', () => {
  let service: PlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
