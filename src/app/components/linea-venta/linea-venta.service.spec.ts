import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CacheService } from 'ionic-cache';

import { LineaVentaService } from './linea-venta.service';

describe('LineaVentaService', () => {
  let service: LineaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CacheService, useValue: {} }]
    });
    service = TestBed.inject(LineaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
