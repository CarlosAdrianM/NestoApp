import { TestBed } from '@angular/core/testing';

import { SelectorDireccionesEntregaService } from './selector-direcciones-entrega.service';

describe('SelectorDireccionesEntregaService', () => {
  let service: SelectorDireccionesEntregaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorDireccionesEntregaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
