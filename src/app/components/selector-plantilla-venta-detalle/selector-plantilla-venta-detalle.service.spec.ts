import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SelectorPlantillaVentaDetalleService } from './selector-plantilla-venta-detalle.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorPlantillaVentaDetalleService', () => {
  let service: SelectorPlantillaVentaDetalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()] });
    service = TestBed.inject(SelectorPlantillaVentaDetalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
