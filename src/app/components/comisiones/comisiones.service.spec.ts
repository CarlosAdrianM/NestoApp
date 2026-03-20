import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ComisionesService } from './comisiones.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ComisionesService', () => {
  let service: ComisionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(ComisionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
