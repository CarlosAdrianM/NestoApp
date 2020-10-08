import { TestBed } from '@angular/core/testing';

import { ListaRapportsService } from './lista-rapports.service';

describe('ListaRapportsService', () => {
  let service: ListaRapportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaRapportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
