import { TestBed } from '@angular/core/testing';

import { SelectorClientesService } from './selector-clientes.service';

describe('SelectorClientesService', () => {
  let service: SelectorClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
