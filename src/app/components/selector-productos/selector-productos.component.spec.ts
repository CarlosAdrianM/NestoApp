import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Keyboard } from '../../services/keyboard.service';
import { CacheService } from '../../services/cache.service';
import { Usuario } from 'src/app/models/Usuario';

import { SelectorProductosComponent } from './selector-productos.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';
import { CodigosBarrasService } from '../../services/codigos-barras.service';

describe('SelectorProductosComponent', () => {
  let component: SelectorProductosComponent;
  let fixture: ComponentFixture<SelectorProductosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [SelectorProductosComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(SelectorProductosComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/** NestoApp#262 (Nesto#582): un código de barras en la búsqueda se cambia por la referencia. */
describe('SelectorProductosComponent: código de barras (#262)', () => {
  let component: SelectorProductosComponent;
  let fixture: ComponentFixture<SelectorProductosComponent>;
  let codigosBarras: any;

  beforeEach(waitForAsync(() => {
    codigosBarras = {
      esCodigoBarras: (t: string) => /^\d{13}$/.test(t),
      resolverProducto: jasmine.createSpy('resolverProducto').and.returnValue(Promise.resolve('38093'))
    };
    TestBed.configureTestingModule({
      declarations: [SelectorProductosComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Keyboard, useValue: { show: () => { } } },
        { provide: CodigosBarrasService, useValue: codigosBarras },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorProductosComponent);
    component = fixture.componentInstance;
  }));

  it('con un código de barras se busca la referencia que devuelve la API', fakeAsync(() => {
    const cargar = spyOn<any>(component, 'cargarDatos');
    component.fijarFiltro({ target: { value: '8437017506362', select: () => { } } });
    tick();
    expect(codigosBarras.resolverProducto).toHaveBeenCalledWith('8437017506362');
    expect(cargar).toHaveBeenCalledWith('38093');
  }));

  it('si no hay producto (o cancela), no se busca nada', fakeAsync(() => {
    codigosBarras.resolverProducto.and.returnValue(Promise.resolve(null));
    const cargar = spyOn<any>(component, 'cargarDatos');
    component.fijarFiltro({ target: { value: '8437017506362', select: () => { } } });
    tick();
    expect(cargar).not.toHaveBeenCalled();
  }));

  it('un texto normal busca como siempre', fakeAsync(() => {
    const cargar = spyOn<any>(component, 'cargarDatos');
    component.fijarFiltro({ target: { value: 'cera', select: () => { } } });
    tick();
    expect(codigosBarras.resolverProducto).not.toHaveBeenCalled();
    expect(cargar).toHaveBeenCalledWith('CERA');
  }));
});
