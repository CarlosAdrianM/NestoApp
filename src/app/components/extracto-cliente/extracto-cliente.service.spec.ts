import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AuthService } from '../../services/auth/auth.service';
import { Storage } from '@ionic/storage-angular';

import { ExtractoClienteService } from './extracto-cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ExtractoClienteService', () => {
  let service: ExtractoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        Usuario,
        FileTransfer,
        File,
        AuthService,
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    service = TestBed.inject(ExtractoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
