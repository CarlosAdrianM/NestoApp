import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';

import { SelectorAlmacenesService } from './selector-almacenes.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorAlmacenesService', () => {
  let service: SelectorAlmacenesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SelectorAlmacenesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
