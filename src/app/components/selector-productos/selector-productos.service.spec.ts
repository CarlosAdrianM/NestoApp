import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CacheService } from 'ionic-cache';

import { SelectorProductosService } from './selector-productos.service';

describe('SelectorProductosService', () => {
  let service: SelectorProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CacheService, useValue: {} }]
    });
    service = TestBed.inject(SelectorProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
