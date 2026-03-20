import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';
import { Usuario } from 'src/app/models/Usuario';

import { ListaPedidosVentaComponent } from './lista-pedidos-venta.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ListaPedidosVentaComponent', () => {
  let component: ListaPedidosVentaComponent;
  let fixture: ComponentFixture<ListaPedidosVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ListaPedidosVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: FileOpener, useValue: {} },
        { provide: FileTransfer, useValue: { create: () => { } } },
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ListaPedidosVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
