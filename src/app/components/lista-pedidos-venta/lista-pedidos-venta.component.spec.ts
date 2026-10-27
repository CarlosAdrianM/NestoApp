import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { Usuario } from 'src/app/models/Usuario';

import { ListaPedidosVentaComponent } from './lista-pedidos-venta.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';
import { PedidoVentaService } from '../pedido-venta/pedido-venta.service';

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

/** NestoApp#240 (novedad 715) y #254 (NestoAPI#698): lo que se ve en cada pedido de la lista. */
describe('ListaPedidosVentaComponent: fecha sin determinar y retenidos (#240 / #254)', () => {
  let component: ListaPedidosVentaComponent;
  let fixture: ComponentFixture<ListaPedidosVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ListaPedidosVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ListaPedidosVentaComponent);
    component = fixture.componentInstance;
  }));

  it('una nota de entrega sin fecha (31/12/2099) se enseña como «Sin fecha», no como 31/12/99', () => {
    const nota = { numero: 928307, fecha: '2099-12-31T00:00:00' };
    expect(component.textoFecha(nota.fecha)).toBe('Sin fecha');
    expect(component.sinFecha(nota)).toBeTrue();
  });

  it('las demás fechas llevan el año con cuatro cifras', () => {
    expect(component.textoFecha('2026-10-22T00:00:00')).toBe('22/10/2026');
    expect(component.sinFecha({ fecha: '2026-10-22T00:00:00' })).toBeFalse();
  });

  it('marca los pedidos que están retenidos', () => {
    const pedidos = TestBed.inject(PedidoVentaService) as any;
    pedidos.cargarRetenidos = () => of([{ Id: 1, Pedido: 929057, Liberado: null }, { Id: 2, Pedido: 1, Liberado: '2026-10-23' }]);

    component.cargarRetenidos();

    expect(component.estaRetenido({ numero: 929057 })).toBeTrue();
    expect(component.estaRetenido({ numero: 1 })).toBeFalse();
    expect(component.estaRetenido({ numero: 2 })).toBeFalse();
  });
});
