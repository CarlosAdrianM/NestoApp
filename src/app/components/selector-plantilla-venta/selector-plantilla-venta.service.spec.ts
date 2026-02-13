import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CacheService } from 'ionic-cache';

import { SelectorPlantillaVentaService } from './selector-plantilla-venta.service';

describe('SelectorPlantillaVentaService', () => {
  let service: SelectorPlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CacheService, useValue: {} }]
    });
    service = TestBed.inject(SelectorPlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
