import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';
import { Usuario } from 'src/app/models/Usuario';

import { ListaPedidosVentaComponent } from './lista-pedidos-venta.component';

describe('ListaPedidosVentaComponent', () => {
  let component: ListaPedidosVentaComponent;
  let fixture: ComponentFixture<ListaPedidosVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaPedidosVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FileOpener, useValue: {} },
        { provide: FileTransfer, useValue: { create: () => {} } },
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaPedidosVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
