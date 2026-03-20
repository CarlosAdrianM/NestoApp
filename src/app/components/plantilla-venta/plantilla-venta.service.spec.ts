import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PlantillaVentaService } from './plantilla-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PlantillaVentaService', () => {
  let service: PlantillaVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(PlantillaVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
