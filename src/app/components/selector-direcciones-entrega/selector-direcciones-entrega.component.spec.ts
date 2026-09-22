import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { SelectorDireccionesEntregaService } from './selector-direcciones-entrega.service';

import { SelectorDireccionesEntregaComponent } from './selector-direcciones-entrega.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SelectorDireccionesEntregaComponent', () => {
  let component: SelectorDireccionesEntregaComponent;
  let fixture: ComponentFixture<SelectorDireccionesEntregaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorDireccionesEntregaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorDireccionesEntregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Avisos al cargar direcciones de entrega (#179)', () => {
  let component: SelectorDireccionesEntregaComponent;
  let fixture: ComponentFixture<SelectorDireccionesEntregaComponent>;
  let servicio: any;
  let alertasCreadas: any[];

  beforeEach(waitForAsync(() => {
    alertasCreadas = [];
    servicio = { direccionesEntrega: jasmine.createSpy('direccionesEntrega').and.returnValue(of([])) };

    TestBed.configureTestingModule({
      declarations: [SelectorDireccionesEntregaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: SelectorDireccionesEntregaService, useValue: servicio },
        {
          provide: AlertController, useValue: {
            create: (opts: any) => {
              alertasCreadas.push(opts);
              return Promise.resolve({ present: () => Promise.resolve() });
            }
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorDireccionesEntregaComponent);
    component = fixture.componentInstance;
  }));

  it('si falla la carga, se avisa con el motivo en vez de callarse', async () => {
    servicio.direccionesEntrega.and.returnValue(throwError(() => ({
      isCancelled: false,
      originalError: { error: { Message: 'No existe el cliente 1/39627' } }
    })));

    component.cargarDatos('39627');
    await fixture.whenStable();

    expect(alertasCreadas.length).toBe(1);
    expect(alertasCreadas[0].message).toContain('No existe el cliente 1/39627');
  });

  it('una petición cancelada no molesta al usuario', async () => {
    servicio.direccionesEntrega.and.returnValue(throwError(() => ({ isCancelled: true })));

    component.cargarDatos('39627');
    await fixture.whenStable();

    expect(alertasCreadas.length).toBe(0);
  });

  it('el cliente sin direcciones sale por su número, no como undefined', async () => {
    servicio.direccionesEntrega.and.returnValue(of([]));

    component.cargarDatos('39627');
    await fixture.whenStable();

    expect(alertasCreadas.length).toBe(1);
    expect(alertasCreadas[0].subHeader).toContain('39627');
    expect(alertasCreadas[0].subHeader).not.toContain('undefined');
  });
});
