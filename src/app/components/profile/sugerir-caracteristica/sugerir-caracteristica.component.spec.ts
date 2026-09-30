import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { of, throwError } from 'rxjs';

import { SugerirCaracteristicaComponent } from './sugerir-caracteristica.component';
import { NovedadesService } from 'src/app/services/novedades.service';
import { Configuracion } from '../../configuracion/configuracion/configuracion.component';
import { HistorialRutasService } from 'src/app/services/historial-rutas.service';

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
        { provide: HistorialRutasService, useValue: { pantallaAnterior: () => '/pedido-venta' } },
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

  // NestoApp#203 / NestoAPI#558: «Algo no funciona» usa el mismo formulario en modo aviso.
  it('sin abrir, ofrece los dos botones; abrir sin decir nada es una sugerencia', () => {
    expect(component.abierto).toBeFalse();
    component.abrir();
    expect(component.esIncidencia).toBeFalse();
    expect(component.textoBotonEnviar).toBe('Enviar');
  });

  it('en modo aviso cambian la ayuda y el botón', () => {
    component.abrir('incidencia');
    expect(component.abierto).toBeTrue();
    expect(component.esIncidencia).toBeTrue();
    expect(component.placeholder).toContain('¿Qué no funciona?');
    expect(component.textoBotonEnviar).toBe('Enviar aviso');
  });

  it('el aviso viaja con EsIncidencia, la versión y la pantalla de la que venía', fakeAsync(() => {
    component.abrir('incidencia');
    component.texto = 'Al guardar el pedido se queda colgado';

    component.enviar();
    tick();

    expect(servicio.crearSugerencia).toHaveBeenCalledWith({
      Texto: 'Al guardar el pedido se queda colgado',
      VersionCliente: Configuracion.VERSION,
      EsIncidencia: true,
      Pantalla: '/pedido-venta'
    });
    expect(toasts[0].message).toBe('¡Gracias por avisar! Lo revisaremos y te diremos en qué versión queda arreglado.');
    expect(component.abierto).toBeFalse();
  }));

  it('una sugerencia no manda EsIncidencia ni pantalla', fakeAsync(() => {
    component.abrir('sugerencia');
    component.texto = 'Filtro por ruta';

    component.enviar();
    tick();

    const enviada = servicio.crearSugerencia.calls.mostRecent().args[0];
    expect(enviada.EsIncidencia).toBeUndefined();
    expect(enviada.Pantalla).toBeUndefined();
  }));

  it('si falla el aviso, el título del error habla de aviso', fakeAsync(() => {
    servicio.crearSugerencia.and.returnValue(throwError(() => ({ status: 500 })));
    component.abrir('incidencia');
    component.texto = 'No va';

    component.enviar();
    tick();

    expect(alertas[0].header).toBe('No se ha podido enviar el aviso');
  }));
});
