import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { AuthService } from '../../services/auth/auth.service';
import { Storage } from '@ionic/storage';

import { ExtractoClienteService } from './extracto-cliente.service';

describe('ExtractoClienteService', () => {
  let service: ExtractoClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Usuario,
        FileTransfer,
        File,
        AuthService,
        { provide: Storage, useValue: {} }
      ]
    });
    service = TestBed.inject(ExtractoClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
