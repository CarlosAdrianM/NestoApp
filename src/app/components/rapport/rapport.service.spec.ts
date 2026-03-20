import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { AuthService } from '../../auth.service';
import { AlertsService } from '../../alerts.service';

import { RapportService } from './rapport.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RapportService', () => {
  let service: RapportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        Usuario,
        { provide: AuthService, useValue: {} },
        AlertsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(RapportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
