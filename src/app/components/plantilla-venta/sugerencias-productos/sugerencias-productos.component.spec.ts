import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { SugerenciasProductosComponent } from './sugerencias-productos.component';
import { AyudaSugerenciasProductosComponent } from './ayuda-sugerencias-productos.component';

describe('SugerenciasProductosComponent (#235)', () => {
  let component: SugerenciasProductosComponent;
  let fixture: ComponentFixture<SugerenciasProductosComponent>;
  let modales: any[];
  let estado: any;
  const sugerencia: any = { IdSugerencia: 7, Producto: '38000', Nombre: 'Crema', NombreConTamano: 'Crema 500 ml', Familia: 'Lisap', Motivo: 'LeToca', Texto: 'Lo compra cada ~30 días', Posicion: 1 };

  beforeEach(waitForAsync(() => {
    modales = [];
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
      }]
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
