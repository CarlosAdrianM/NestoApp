import { TestBed } from '@angular/core/testing';

import { SelectorProductosService } from './selector-productos.service';

describe('SelectorProductosService', () => {
  let service: SelectorProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
