import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { CacheService } from 'ionic-cache';

import { ListaRapportsService } from './lista-rapports.service';

describe('ListaRapportsService', () => {
  let service: ListaRapportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuario, { provide: CacheService, useValue: {} }]
    });
    service = TestBed.inject(ListaRapportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
