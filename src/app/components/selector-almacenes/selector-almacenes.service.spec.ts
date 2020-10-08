import { TestBed } from '@angular/core/testing';

import { SelectorAlmacenesService } from './selector-almacenes.service';

describe('SelectorAlmacenesService', () => {
  let service: SelectorAlmacenesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectorAlmacenesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
