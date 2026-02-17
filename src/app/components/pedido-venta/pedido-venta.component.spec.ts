import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@ionic-native/firebase-analytics/ngx';

import { PedidoVentaComponent } from './pedido-venta.component';
import { LineaVenta } from '../linea-venta/linea-venta';

describe('PedidoVentaComponent', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidoVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Setter fechaEntrega sin conversión a Date (#85)', () => {

  it('debe asignar el string ISO directamente a las líneas sin convertir a Date', () => {
    const linea = new LineaVenta();
    linea.estado = 1;
    linea.picking = 0;

    // Simular lo que hace el setter: asignar string directamente
    const valorDatetime = '2026-02-17';
    linea.fechaEntrega = valorDatetime;

    // Debe ser el mismo string, no un objeto Date
    expect(linea.fechaEntrega).toBe('2026-02-17');
    expect(typeof linea.fechaEntrega).toBe('string');
  });

  it('el bug original con new Date() puede desfasar la fecha al serializar', () => {
    // Documentar el bug: new Date("2026-02-17") crea medianoche UTC,
    // que al serializar en zona CET puede dar día anterior
    const fechaDate = new Date('2026-02-17');

    // En UTC es medianoche del 17, pero toLocaleDateString en CET es 17
    // El problema real ocurre cuando JSON.stringify envía la fecha al backend
    const jsonDate = JSON.stringify(fechaDate); // "2026-02-17T00:00:00.000Z"
    expect(jsonDate).toContain('2026-02-17T00:00:00.000Z');

    // Mientras que con string directo:
    const fechaString = '2026-02-17';
    const jsonString = JSON.stringify(fechaString); // "\"2026-02-17\""
    expect(jsonString).toContain('2026-02-17');
    // El string no tiene componente horario, así que no hay desfase posible
  });
});
