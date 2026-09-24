import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { SugerirCaracteristicaComponent } from './sugerir-caracteristica.component';
import { NovedadesService } from 'src/app/services/novedades.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';

/** NestoApp#190 / NestoAPI#526: los vendedores sugieren características desde las Novedades. */
describe('SugerirCaracteristicaComponent (#190)', () => {
  let component: SugerirCaracteristicaComponent;
  let fixture: ComponentFixture<SugerirCaracteristicaComponent>;
  let servicio: any;
  let alertas: any[];
  let toasts: any[];

  beforeEach(waitForAsync(() => {
    alertas = [];
    toasts = [];
    servicio = {
      crearSugerencia: jasmine.createSpy('crearSugerencia').and.returnValue(of({ Id: 360, Version: null, Titulo: 'Filtro por ruta' }))
    };
    TestBed.configureTestingModule({
      declarations: [SugerirCaracteristicaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NovedadesService, useValue: servicio },
        { provide: ToastController, useValue: { create: (o: any) => { toasts.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SugerirCaracteristicaComponent);
    component = fixture.componentInstance;
  }));

  it('sin texto no se puede enviar', () => {
    component.abrir();
    component.texto = '   ';

    component.enviar();

    expect(component.puedeEnviar).toBeFalse();
    expect(servicio.crearSugerencia).not.toHaveBeenCalled();
  });

  it('manda el texto con la versión de la app y la captura, avisa al perfil y se cierra', fakeAsync(() => {
    const creadas: any[] = [];
    component.creada.subscribe(c => creadas.push(c));
    component.abrir();
    component.texto = '  Filtro por ruta\nen la lista de clientes  ';
    component.imagenAdjunta = { dataUrl: 'data:image/jpeg;base64,AAAA', tipo: 'image/jpeg' };

    component.enviar();
    tick();

    expect(servicio.crearSugerencia).toHaveBeenCalledWith({
      Texto: 'Filtro por ruta\nen la lista de clientes',
      VersionCliente: Configuracion.VERSION,
      ImagenBase64: 'data:image/jpeg;base64,AAAA',
      ImagenTipo: 'image/jpeg'
    });
    expect(creadas[0].Id).toBe(360);
    expect(component.abierto).toBeFalse();
    expect(component.texto).toBe('');
    expect(component.imagenAdjunta).toBeNull();
    expect(toasts[0].message).toContain('Gracias');
  }));

  it('si la API la rechaza se enseña su mensaje y no se pierde lo escrito', fakeAsync(() => {
    servicio.crearSugerencia.and.returnValue(throwError(() => ({
      isBusinessError: true, apiError: { error: { code: 'BUSINESS_ERROR', message: 'La imagen es demasiado grande (máximo 2 MB).' } }
    })));
    component.abrir();
    component.texto = 'Filtro por ruta';

    component.enviar();
    tick();

    expect(alertas.some(a => (a.message || '').includes('máximo 2 MB'))).toBeTrue();
    expect(component.texto).toBe('Filtro por ruta');
    expect(component.abierto).toBeTrue();
  }));
});
