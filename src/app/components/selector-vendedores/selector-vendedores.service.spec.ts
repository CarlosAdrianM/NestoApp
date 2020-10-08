import { TestBed } from '@angular/core/testing';

import { SelectorVendedoresService } from './selector-vendedores.service';

describe('SelectorVendedoresService', () => {
  let service: SelectorVendedoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorVendedoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
