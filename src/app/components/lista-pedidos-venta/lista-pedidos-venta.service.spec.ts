import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';

import { ListaPedidosVentaService } from './lista-pedidos-venta.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ListaPedidosVentaService', () => {
  let service: ListaPedidosVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [Usuario, FileTransfer, File, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ListaPedidosVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
