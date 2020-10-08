import { TestBed } from '@angular/core/testing';

import { ExtractoClienteService } from './extracto-cliente.service';

describe('ExtractoClienteService', () => {
  let service: ExtractoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtractoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
