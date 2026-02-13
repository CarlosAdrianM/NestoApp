import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Usuario } from '../../models/Usuario';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';

import { ListaPedidosVentaService } from './lista-pedidos-venta.service';

describe('ListaPedidosVentaService', () => {
  let service: ListaPedidosVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Usuario, FileTransfer, File]
    });
    service = TestBed.inject(ListaPedidosVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
