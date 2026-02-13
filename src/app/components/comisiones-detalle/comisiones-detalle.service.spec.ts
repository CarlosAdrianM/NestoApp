import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ComisionesDetalleService } from './comisiones-detalle.service';

describe('ComisionesDetalleService', () => {
  let service: ComisionesDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ComisionesDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
