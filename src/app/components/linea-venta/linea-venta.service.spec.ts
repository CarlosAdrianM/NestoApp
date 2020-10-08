import { TestBed } from '@angular/core/testing';

import { LineaVentaService } from './linea-venta.service';

describe('LineaVentaService', () => {
  let service: LineaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
