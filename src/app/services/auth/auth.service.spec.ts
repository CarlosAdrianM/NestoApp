import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Storage } from '@ionic/storage-angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/models/Usuario';

import { AuthService } from './auth.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [
        { provide: Storage, useValue: {} },
        { provide: ToastController, useValue: {} },
        Usuario,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
