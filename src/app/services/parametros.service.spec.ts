import { TestBed } from '@angular/core/testing';

import { Parametros } from './parametros.service';

describe('Parametros', () => {
  let service: Parametros;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parametros);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
