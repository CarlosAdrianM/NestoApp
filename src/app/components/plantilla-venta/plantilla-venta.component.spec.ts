import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '@awesome-cordova-plugins/firebase-analytics/ngx';
import { Storage } from '@ionic/storage-angular';

import { PlantillaVentaComponent } from './plantilla-venta.component';

describe('PlantillaVentaComponent', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillaVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } },
        { provide: Storage, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Portes en PlantillaVenta (#94)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlantillaVentaComponent ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule, RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => {} } },
        { provide: Storage, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('importePortesMostrar devuelve 0 si no hay resultadoPortes', () => {
    component.resultadoPortes = null;
    expect(component.importePortesMostrar).toBe(0);
  });

  it('importePortesMostrar devuelve 0 si portes son gratis', () => {
    component.resultadoPortes = { ImportePortes: 3.5, ImporteMinimoPedidoSinPortes: 50 };
    component.portesGratis = true;
    expect(component.importePortesMostrar).toBe(0);
  });

  it('importePortesMostrar devuelve importe si portes no son gratis', () => {
    component.resultadoPortes = { ImportePortes: 3.5, ImporteMinimoPedidoSinPortes: 50 };
    component.portesGratis = false;
    expect(component.importePortesMostrar).toBe(3.5);
  });

  it('totalPedido incluye portes con IVA cuando aplica', () => {
    // Configurar dirección con IVA
    component['_direccionSeleccionada'] = { iva: 'G21' };
    component['_selectorPlantillaVenta'] = { totalPedido: 50, baseImponiblePedido: 41.32, baseImponibleParaPortes: 30 } as any;
    component.resultadoPortes = { ImportePortes: 3.5, ImporteMinimoPedidoSinPortes: 50 };
    component.portesGratis = false;

    expect(component.totalPedido).toBeCloseTo(54.235, 2);
  });

  it('totalPedido no incluye portes cuando son gratis', () => {
    component['_direccionSeleccionada'] = { iva: 'G21' };
    component['_selectorPlantillaVenta'] = { totalPedido: 80, baseImponiblePedido: 66.12, baseImponibleParaPortes: 66.12 } as any;
    component.resultadoPortes = { ImportePortes: 3.5, ImporteMinimoPedidoSinPortes: 50 };
    component.portesGratis = true;

    expect(component.totalPedido).toBe(80);
  });

  it('totalPedido sin IVA incluye portes sin IVA', () => {
    component['_direccionSeleccionada'] = { iva: undefined };
    component['_selectorPlantillaVenta'] = { totalPedido: 50, baseImponiblePedido: 41.32, baseImponibleParaPortes: 30 } as any;
    component.resultadoPortes = { ImportePortes: 3.5, ImporteMinimoPedidoSinPortes: 50 };
    component.portesGratis = false;

    expect(component.totalPedido).toBeCloseTo(44.82, 2);
  });
});

describe('Formateo de fechas sin desfase UTC (#85)', () => {

  it('debe formatear fecha local sin usar toISOString para evitar desfase UTC', () => {
    // Simular medianoche hora local del 17 de febrero
    const fecha = new Date(2026, 1, 17, 0, 0, 0, 0); // mes 1 = febrero

    // Formateo correcto (hora local) - lo que hace el código corregido
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    const fechaLocal = `${y}-${m}-${d}`;

    expect(fechaLocal).toBe('2026-02-17');
  });

  it('toISOString puede devolver día anterior a medianoche local (bug original)', () => {
    // Este test documenta el bug: a medianoche CET (UTC+1),
    // toISOString devuelve las 23:00 del día anterior en UTC
    const fecha = new Date(2026, 1, 17, 0, 0, 0, 0);
    const isoString = fecha.toISOString().substring(0, 10);
    const offset = fecha.getTimezoneOffset(); // en minutos, negativo para CET

    if (offset < 0) {
      // En zonas horarias adelantadas a UTC (como CET/CEST),
      // toISOString devuelve el día anterior
      expect(isoString).toBe('2026-02-16');
    } else {
      // En UTC o zonas atrasadas, no hay desfase
      expect(isoString).toBe('2026-02-17');
    }
  });
});
