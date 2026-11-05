import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { SugerenciasProductosComponent } from './sugerencias-productos.component';
import { SugerenciasProductosService } from 'src/app/services/sugerencias-productos.service';
import { AyudaSugerenciasProductosComponent } from './ayuda-sugerencias-productos.component';

describe('SugerenciasProductosComponent (#235)', () => {
  let component: SugerenciasProductosComponent;
  let fixture: ComponentFixture<SugerenciasProductosComponent>;
  let modales: any[];
  let alertas: any[];
  let servicio: any;
  let estado: any;
  const sugerencia: any = { IdSugerencia: 7, Producto: '38000', Nombre: 'Crema', NombreConTamano: 'Crema 500 ml', Familia: 'Lisap', Motivo: 'LeToca', Texto: 'Lo compra cada ~30 días', Posicion: 1 };

  beforeEach(waitForAsync(() => {
    modales = []; alertas = [];
    servicio = { miResumen: jasmine.createSpy('miResumen').and.returnValue(of({ Frase: 'Esta semana: 3 productos añadidos desde las sugerencias, 120,00 € en ventas.', Ayuda: 'Sus respuestas:\n  Semana del 05/10: 1 ✓', Semanas: [] })) };
    try { localStorage.removeItem(AyudaSugerenciasProductosComponent.CLAVE_VISTA); } catch { }
    TestBed.configureTestingModule({
      declarations: [SugerenciasProductosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [{
        provide: ModalController, useValue: {
          create: (o: any) => { modales.push(o); return Promise.resolve({ present: () => Promise.resolve() }); },
          dismiss: () => Promise.resolve()
        }
      },
      { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
      { provide: SugerenciasProductosService, useValue: servicio }]
    }).compileComponents();
    fixture = TestBed.createComponent(SugerenciasProductosComponent);
    component = fixture.componentInstance;
    estado = { sugerencias: [sugerencia], responder: jasmine.createSpy('responder').and.returnValue(Promise.resolve()) };
    component.estado = estado;
    component.anadir = jasmine.createSpy('anadir').and.returnValue(Promise.resolve(true));
  }));

  afterEach(() => {
    try { localStorage.removeItem(AyudaSugerenciasProductosComponent.CLAVE_VISTA); } catch { }
  });

  it('la primera vez abre sola la ayuda; la siguiente, no', () => {
    component.ngOnInit();
    expect(modales.length).toBe(1);
    expect(modales[0].component).toBe(AyudaSugerenciasProductosComponent);

    component.ngOnInit();
    expect(modales.length).toBe(1);
  });

  it('pinta la tarjeta con nombre, producto y familia, motivo y la frase', () => {
    AyudaSugerenciasProductosComponent.marcarVista();
    fixture.detectChanges();
    const texto: string = fixture.nativeElement.textContent;
    expect(texto).toContain('Crema 500 ml');
    expect(texto).toContain('38000 · Lisap');
    expect(texto).toContain('🔁 Ya le toca');
    expect(texto).toContain('Lo compra cada ~30 días');
    expect(texto).toContain('¿Cómo funciona?');
  });

  it('«Añadir» mete el producto y contesta Anadido', fakeAsync(() => {
    component.aceptar(sugerencia);
    tick();
    expect(component.anadir).toHaveBeenCalledWith(sugerencia);
    expect(estado.responder).toHaveBeenCalledWith(sugerencia, 'Anadido');
  }));

  it('si no se ha podido añadir, no contesta', fakeAsync(() => {
    (component.anadir as jasmine.Spy).and.returnValue(Promise.resolve(false));
    component.aceptar(sugerencia);
    tick();
    expect(estado.responder).not.toHaveBeenCalled();
  }));

  it('«Quitar» contesta DescartadoVendedor y «No le interesa», NoLeInteresa', () => {
    component.rechazar(sugerencia, 'DescartadoVendedor');
    component.rechazar(sugerencia, 'NoLeInteresa');
    expect(estado.responder.calls.allArgs()).toEqual([[sugerencia, 'DescartadoVendedor'], [sugerencia, 'NoLeInteresa']]);
  });
});

/** NestoApp#265 (NestoAPI#751): lo que gana el vendedor marcando ✓/✗. */
describe('SugerenciasProductosComponent: resumen del vendedor (#265)', () => {
  let component: SugerenciasProductosComponent;
  let fixture: ComponentFixture<SugerenciasProductosComponent>;
  let alertas: any[];
  let servicio: any;
  let estado: any;
  const sugerencia: any = { IdSugerencia: 7, Producto: '38000', Nombre: 'Crema', Motivo: 'LeToca', Posicion: 1 };
  const resumen = { Frase: 'Esta semana: 3 productos añadidos desde las sugerencias, 120,00 € en ventas.', Ayuda: 'Sus respuestas en las últimas semanas:\n  Semana del 05/10: 1 ✓', Semanas: [], AceptadasDeCadaDiez: 4 };

  beforeEach(waitForAsync(() => {
    alertas = [];
    servicio = { miResumen: jasmine.createSpy('miResumen').and.returnValue(of(resumen)) };
    AyudaSugerenciasProductosComponent.marcarVista();
    TestBed.configureTestingModule({
      declarations: [SugerenciasProductosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }), dismiss: () => Promise.resolve() } },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: SugerenciasProductosService, useValue: servicio }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SugerenciasProductosComponent);
    component = fixture.componentInstance;
    estado = { sugerencias: [sugerencia], responder: jasmine.createSpy('responder').and.returnValue(Promise.resolve()) };
    component.estado = estado;
    component.anadir = jasmine.createSpy('anadir').and.returnValue(Promise.resolve(true));
  }));

  afterEach(() => {
    try { localStorage.removeItem(AyudaSugerenciasProductosComponent.CLAVE_VISTA); } catch { }
  });

  it('al abrir se pide el resumen y se pinta la frase tal cual', () => {
    fixture.detectChanges(); // ngOnInit
    expect(servicio.miResumen).toHaveBeenCalledTimes(1);
    expect(component.resumen?.Frase).toBe(resumen.Frase);
    expect(fixture.nativeElement.textContent).toContain('3 productos añadidos desde las sugerencias');
  });

  it('después de cada ✓/✗/🚫 se vuelve a pedir (para que vea que cuenta)', async () => {
    component.ngOnInit();
    await component.aceptar(sugerencia);
    await component.rechazar(sugerencia, 'NoLeInteresa');
    await component.rechazar(sugerencia, 'DescartadoVendedor');
    expect(servicio.miResumen).toHaveBeenCalledTimes(4);
  });

  it('al tocar la frase, el detalle (la Ayuda de la API)', async () => {
    component.ngOnInit();
    await component.verDetalleResumen();
    expect(alertas[0].message).toBe(resumen.Ayuda);
  });

  it('si la API falla no sale nada', () => {
    servicio.miResumen.and.returnValue(of(null));
    fixture.detectChanges(); // ngOnInit
    expect(component.resumen).toBeNull();
    expect(fixture.nativeElement.querySelector('.resumen-vendedor')).toBeNull();
  });
});
