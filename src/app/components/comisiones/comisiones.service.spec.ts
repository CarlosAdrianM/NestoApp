import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ComisionesService } from './comisiones.service';

describe('ComisionesService', () => {
  let service: ComisionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ComisionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
