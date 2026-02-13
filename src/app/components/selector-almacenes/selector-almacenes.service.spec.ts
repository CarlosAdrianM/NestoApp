import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';

import { SelectorAlmacenesService } from './selector-almacenes.service';

describe('SelectorAlmacenesService', () => {
  let service: SelectorAlmacenesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuario]
    });
    service = TestBed.inject(SelectorAlmacenesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
