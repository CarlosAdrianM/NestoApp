import { TestBed } from '@angular/core/testing';

import { ComisionesDetalleService } from './comisiones-detalle.service';

describe('ComisionesDetalleService', () => {
  let service: ComisionesDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComisionesDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
