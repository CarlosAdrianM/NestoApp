import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';

import { SelectorVendedoresService } from './selector-vendedores.service';

describe('SelectorVendedoresService', () => {
  let service: SelectorVendedoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuario]
    });
    service = TestBed.inject(SelectorVendedoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
