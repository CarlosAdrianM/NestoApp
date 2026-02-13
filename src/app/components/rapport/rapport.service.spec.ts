import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { AuthService } from '../../auth.service';
import { AlertsService } from '../../alerts.service';

import { RapportService } from './rapport.service';

describe('RapportService', () => {
  let service: RapportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Usuario,
        { provide: AuthService, useValue: {} },
        AlertsService
      ]
    });
    service = TestBed.inject(RapportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
