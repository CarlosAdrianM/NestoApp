import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';

import { SelectorVendedoresService } from './selector-vendedores.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorVendedoresService', () => {
  let service: SelectorVendedoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SelectorVendedoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
