import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../models/Usuario';
import { ErrorHandlerService } from './error-handler.service';
import { AlertController, ToastController } from '@ionic/angular';

import { Parametros } from './parametros.service';

describe('Parametros', () => {
  let service: Parametros;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Usuario,
        ErrorHandlerService,
        { provide: AlertController, useValue: {} },
        { provide: ToastController, useValue: {} }
      ]
    });
    service = TestBed.inject(Parametros);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
