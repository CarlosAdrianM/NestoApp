import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';

import { ComisionesDetalleComponent } from './comisiones-detalle.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ComisionesDetalleComponent', () => {
  let component: ComisionesDetalleComponent;
  let fixture: ComponentFixture<ComisionesDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ComisionesDetalleComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ComisionesDetalleComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ComisionesDetalleComponent: estado de facturación (#225)', () => {
  let fixture: ComponentFixture<ComisionesDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ComisionesDetalleComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ComisionesDetalleComponent);
  }));

  const textos = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLElement>).map(p => p.textContent.trim());

  it('sin fecha de factura enseña el texto de la API en lugar de «Fecha:» vacía', () => {
    fixture.componentInstance.listaDetalleComision = [
      { Pedido: 927595, Nombre: 'A.M.A BY 11', Fecha_Factura: null, BaseImponible: 45.2, EstadoFacturacion: 'Servido el 02/10, pendiente de facturar' }
    ];
    fixture.detectChanges();

    expect(textos()).toContain('Servido el 02/10, pendiente de facturar');
    expect(textos().some(t => t.startsWith('Fecha:'))).toBeFalse();
  });

  it('con fecha de factura se sigue enseñando la fecha', () => {
    fixture.componentInstance.listaDetalleComision = [
      { Pedido: 1, Nombre: 'X', Fecha_Factura: '2026-10-03T00:00:00', BaseImponible: 10, EstadoFacturacion: null }
    ];
    fixture.detectChanges();

    expect(textos().some(t => t.startsWith('Fecha:') && t.length > 'Fecha:'.length)).toBeTrue();
  });

  it('con una API sin el campo nuevo, todo sigue como antes', () => {
    fixture.componentInstance.listaDetalleComision = [{ Pedido: 1, Nombre: 'X', Fecha_Factura: null, BaseImponible: 10 }];
    fixture.detectChanges();

    expect(textos().some(t => t.startsWith('Fecha:'))).toBeTrue();
  });
});
