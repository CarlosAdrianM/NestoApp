import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { CacheService } from 'ionic-cache';

import { SelectorClientesService } from './selector-clientes.service';

describe('SelectorClientesService', () => {
  let service: SelectorClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuario, { provide: CacheService, useValue: {} }]
    });
    service = TestBed.inject(SelectorClientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
