import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, LoadingController, NavController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

import { RapportComponent } from './rapport.component';
import { RapportService } from './rapport.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';
import { SugerenciasProductosService } from 'src/app/services/sugerencias-productos.service';

describe('RapportComponent', () => {
  let component: RapportComponent;
  let fixture: ComponentFixture<RapportComponent>;
  let clienteDevuelto: any;

  // Lo mínimo del ClienteDTO que mira leerCliente()
  const clienteBase = () => ({
    cliente: '0', contacto: '0', direccion: '', nombre: '', estado: 0,
    vendedor: 'NV', VendedoresGrupoProducto: []
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [RapportComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { rapport: { Cliente: '0', Contacto: '', Id: 0, Tipo: '' } } } } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: { get: () => Promise.resolve(null) } },
        { provide: RapportService, useValue: { getCliente: () => of(clienteDevuelto), crearRapport: () => of({ 'NºOrden': 1 }) } },
        { provide: SugerenciasProductosService, useValue: { calcular: () => of(null), responder: () => of(null) } },
        // Un pop() real haría history.back() en el iframe de Karma y tumbaría la suite (Chrome «no message in 30000 ms»).
        { provide: NavController, useValue: { pop: () => Promise.resolve(true), navigateForward: () => Promise.resolve(true) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(RapportComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // NestoApp#253 / NestoAPI#716: resultado del rapport y próximo contacto (chips y fecha).
  describe('resultado del rapport y próximo contacto (#253)', () => {
    it('un chip solo: tocar otro lo cambia, tocar el marcado lo quita', () => {
      component.elegirResultado('Precio');
      expect(component.rapport.Resultado).toBe('Precio');
      component.elegirResultado('Otro');
      expect(component.rapport.Resultado).toBe('Otro');
      component.elegirResultado('Otro');
      expect(component.rapport.Resultado).toBeNull();
    });

    it('«Pedido» marca también el check Pedido', () => {
      component.rapport.Pedido = false;
      component.elegirResultado('Pedido');
      expect(component.rapport.Pedido).toBeTrue();
    });

    it('el próximo contacto se manda solo con la fecha', () => {
      component.rapport.ProximoContacto = '2026-11-09T00:00:00+01:00';
      expect(component.rapportParaGuardar().ProximoContacto).toBe('2026-11-09');
      component.rapport.ProximoContacto = null;
      expect(component.rapportParaGuardar().ProximoContacto).toBeNull();
    });
  });

  // NestoApp#253: motivo al dejar de visitar.
  describe('motivo al quitar de mi listado (#253)', () => {
    it('manda el motivo y el comentario a DejarDeVisitar', async () => {
      const servicio = TestBed.inject(RapportService) as any;
      servicio.dejarDeVisitar = jasmine.createSpy('dejarDeVisitar').and.returnValue(of({}));
      component.rapport = { Id: 0, Cliente: '1', Contacto: '0', Empresa: '1', Usuario: 'NUEVAVISION\\Carlos' };
      component.dejarDeVisitar = true;
      component.motivoCambioEstado = 'Cierre';
      component.comentarioCambioEstado = ' Cierra en diciembre ';
      spyOn(TestBed.inject(LoadingController), 'create').and.callFake(async () => ({ present: async () => { }, dismiss: async () => true } as any));
      spyOn(TestBed.inject(AlertController), 'create').and.callFake(async (o: any) => ({
        present: async () => { const si = (o.buttons || []).find((b: any) => b.text === 'Sí'); if (si?.handler) { await si.handler(); } },
        dismiss: async () => true,
        onDidDismiss: () => new Promise(() => { })
      } as any));

      await component.modificarRapport();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(servicio.dejarDeVisitar).toHaveBeenCalledTimes(1);
      expect(servicio.dejarDeVisitar.calls.mostRecent().args[3]).toEqual({ motivo: 'Cierre', comentario: 'Cierra en diciembre' });
    });
  });

  // NestoApp#249 (sugerencia 736): preguntar antes de registrar en un contacto en estado 7.
  describe('contacto en estado 7 (#249)', () => {
    let alertas: any[];
    beforeEach(() => {
      alertas = [];
      spyOn<any>(component['alertCtrl'], 'create').and.callFake((o: any) => {
        alertas.push(o);
        return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => new Promise(() => { }) });
      });
    });

    it('con el contacto elegido a mano y en estado 7, pregunta (por defecto, No)', fakeAsync(() => {
      component.rapport = { Id: 0, Cliente: '1', Contacto: '2', EstadoCliente: 7 };
      component.modificarRapport();
      tick();
      const pregunta = alertas[alertas.length - 1];
      expect(pregunta.header).toBe('Contacto en estado 7');
      expect(pregunta.buttons.map((b: any) => b.text)).toEqual(['No, volver', 'Sí, registrar']);
      expect(pregunta.buttons[0].role).toBe('cancel');
    }));

    it('«No, volver» vuelve sin guardar', fakeAsync(() => {
      const crear = spyOn(TestBed.inject(RapportService), 'crearRapport').and.callThrough();
      component.rapport = { Id: 0, Cliente: '1', Contacto: '2', EstadoCliente: 7 };
      component.modificarRapport();
      tick();
      alertas[alertas.length - 1].buttons[0].handler();
      tick();
      expect(alertas.some(a => a.header === 'Confirmar')).toBeFalse();
      expect(crear).not.toHaveBeenCalled();
    }));

    it('«Sí, registrar» sigue con la confirmación de guardar', fakeAsync(() => {
      component.rapport = { Id: 0, Cliente: '1', Contacto: '2', EstadoCliente: 7 };
      component.modificarRapport();
      tick();
      alertas[alertas.length - 1].buttons[1].handler();
      tick();
      expect(alertas.some(a => a.header === 'Confirmar')).toBeTrue();
    }));

    it('en otros estados no pregunta', fakeAsync(() => {
      component.rapport = { Id: 0, Cliente: '1', Contacto: '2', EstadoCliente: 0 };
      component.modificarRapport();
      tick();
      expect(alertas.some(a => a.header === 'Contacto en estado 7')).toBeFalse();
      expect(alertas.some(a => a.header === 'Confirmar')).toBeTrue();
    }));

    it('desde «Llamar» (el contacto ya venía puesto) no pregunta', fakeAsync(() => {
      component['contactoInicial'] = '2';
      component.rapport = { Id: 0, Cliente: '1', Contacto: '2', EstadoCliente: 7 };
      expect(component.contactoElegidoAMano).toBeFalse();
      component.modificarRapport();
      tick();
      expect(alertas.some(a => a.header === 'Contacto en estado 7')).toBeFalse();
    }));
  });

  // NestoApp#246: cinta de productos sugeridos al crear el rapport.
  describe('cinta de productos sugeridos (#246)', () => {
    it('al cargar el cliente de un rapport nuevo pide las sugerencias con Aplicacion NestoApp y sin carrito', () => {
      const sugerencias = TestBed.inject(SugerenciasProductosService) as any;
      sugerencias.calcular = jasmine.createSpy('calcular').and.returnValue(of({ IdSesion: 'abc', Sugerencias: [
        { IdSugerencia: 1, Producto: '38093', Nombre: 'CREMA', Motivo: 'LeToca', Texto: 'Le toca', Posicion: 1 }
      ] }));
      clienteDevuelto = { ...clienteBase(), cliente: '15191', contacto: '0' };
      component.rapport = { Id: 0, Cliente: '15191', Contacto: '0', Empresa: '1' };

      component.leerCliente('15191', '0');

      expect(sugerencias.calcular).toHaveBeenCalledWith(jasmine.objectContaining({ Cliente: '15191', Aplicacion: 'NestoApp', Productos: [] }));
      expect(component.hayCintaSugerencias).toBeTrue();
      expect(component.sugerencias.length).toBe(1);
    });

    it('«No le interesa» y «Quitar» responden a la API y quitan la tarjeta', () => {
      const sugerencias = TestBed.inject(SugerenciasProductosService) as any;
      sugerencias.calcular = () => of({ IdSesion: 'abc', Sugerencias: [{ IdSugerencia: 1, Producto: '38093', Nombre: 'CREMA', Motivo: 'LeToca', Texto: '', Posicion: 1 }] });
      sugerencias.responder = jasmine.createSpy('responder').and.returnValue(of({ IdSugerencia: 1, Respuesta: 'NoLeInteresa', Sustituta: null }));
      clienteDevuelto = { ...clienteBase(), cliente: '15191', contacto: '0' };
      component.rapport = { Id: 0, Cliente: '15191', Contacto: '0', Empresa: '1' };
      component.leerCliente('15191', '0');

      component.rechazarSugerencia(component.sugerencias[0], 'NoLeInteresa');

      expect(sugerencias.responder).toHaveBeenCalledWith(1, 'NoLeInteresa', []);
      expect(component.sugerencias.length).toBe(0);
    });

    it('al modificar un rapport ya guardado no hay cinta', () => {
      const sugerencias = TestBed.inject(SugerenciasProductosService) as any;
      sugerencias.calcular = jasmine.createSpy('calcular').and.returnValue(of(null));
      clienteDevuelto = { ...clienteBase() };
      component.rapport = { Id: 55, Cliente: '15191', Contacto: '0' };
      component.leerCliente('15191', '0');
      expect(sugerencias.calcular).not.toHaveBeenCalled();
      expect(component.hayCintaSugerencias).toBeFalse();
    });
  });

  // NestoApp#170 / NestoAPI#464: número de empleados del centro, recogido al meter el rapport.
  // La regla de a quién se le pregunta vive en la API (hoy: código postal de Madrid).
  describe('número de empleados', () => {
    it('no pregunta los empleados mientras no se ha cargado ningún cliente', () => {
      expect(component.preguntarEmpleados).toBeFalse();
    });

    it('no pregunta los empleados si el cliente no trae la bandera', () => {
      clienteDevuelto = { ...clienteBase() };

      component.leerCliente('0', '0');

      expect(component.preguntarEmpleados).toBeFalse();
    });

    it('pregunta los empleados si el cliente trae preguntarEmpleados', () => {
      clienteDevuelto = { ...clienteBase(), preguntarEmpleados: true };

      component.leerCliente('0', '0');

      expect(component.preguntarEmpleados).toBeTrue();
    });

    it('preselecciona el valor que ya tiene la ficha del cliente', () => {
      clienteDevuelto = { ...clienteBase(), preguntarEmpleados: true, empleados: 3 };

      component.leerCliente('0', '0');

      expect(component.rapport.Empleados).toBe(3);
    });

    it('preselecciona el 0 de "sin empleados" (no lo confunde con vacío)', () => {
      clienteDevuelto = { ...clienteBase(), preguntarEmpleados: true, empleados: 0 };

      component.leerCliente('0', '0');

      expect(component.rapport.Empleados).toBe(0);
    });

    it('deja la combo vacía si la ficha no tiene el dato', () => {
      clienteDevuelto = { ...clienteBase(), preguntarEmpleados: true, empleados: null };

      component.leerCliente('0', '0');

      expect(component.rapport.Empleados).toBeNull();
    });

    it('no pisa lo que el vendedor acaba de contestar al recargar el cliente', () => {
      clienteDevuelto = { ...clienteBase(), preguntarEmpleados: true, empleados: 1 };
      component.rapport.Empleados = 5;

      component.leerCliente('0', '0');

      expect(component.rapport.Empleados).toBe(5);
    });
  });

  // NestoApp#175 / NestoAPI#464: la combo está desde 2.20.0 pero nadie la rellena (368 rapports
  // de Madrid, ninguno con empleados). Si está visible y vacía, al guardar hay que pedir al
  // vendedor que confirme que no lo rellena porque no lo sabe.
  describe('confirmar empleados vacíos al guardar (#175)', () => {
    let alertasCreadas: any[];
    let botonesPulsados: string[]; // textos de botón a pulsar automáticamente, por orden de alerta
    let crearRapportSpy: jasmine.Spy;

    beforeEach(() => {
      alertasCreadas = [];
      botonesPulsados = [];

      const alertCtrl = TestBed.inject(AlertController);
      spyOn(alertCtrl, 'create').and.callFake(async (opts: any) => {
        alertasCreadas.push(opts);
        return {
          present: async () => {
            const texto = botonesPulsados.shift();
            const boton = (opts.buttons || []).find((b: any) => b && b.text === texto);
            if (boton && boton.handler) {
              await boton.handler();
            }
          },
          dismiss: async () => true,
          onDidDismiss: () => new Promise(() => { })
        } as any;
      });

      const loadingCtrl = TestBed.inject(LoadingController);
      spyOn(loadingCtrl, 'create').and.callFake(async () => ({
        present: async () => { },
        dismiss: async () => true
      } as any));

      const nav = TestBed.inject(NavController);
      spyOn(nav, 'pop').and.resolveTo(true);

      const servicio = TestBed.inject(RapportService);
      crearRapportSpy = spyOn(servicio, 'crearRapport').and.callThrough();
    });

    const mensajeEmpleados = (opts: any) => opts && typeof opts.message === 'string' && opts.message.includes('empleados');

    it('visible + vacía + no confirma: no se crea el rapport y se vuelve al formulario', async () => {
      component.preguntarEmpleados = true;
      component.rapport.Empleados = null;
      botonesPulsados = ['No, voy a rellenarlo'];

      await component.modificarRapport();

      expect(crearRapportSpy).not.toHaveBeenCalled();
      expect(alertasCreadas.length).toBe(1);
      expect(mensajeEmpleados(alertasCreadas[0])).toBeTrue();
    });

    it('visible + vacía + confirma que no lo sabe: se crea el rapport', async () => {
      component.preguntarEmpleados = true;
      component.rapport.Empleados = null;
      botonesPulsados = ['Sí, no lo sé', 'Sí'];

      await component.modificarRapport();

      expect(crearRapportSpy).toHaveBeenCalled();
      expect(mensajeEmpleados(alertasCreadas[0])).toBeTrue();
    });

    it('combo no visible: no se pregunta por los empleados', async () => {
      component.preguntarEmpleados = false;
      component.rapport.Empleados = null;
      botonesPulsados = ['No'];

      await component.modificarRapport();

      expect(alertasCreadas.some(mensajeEmpleados)).toBeFalse();
      expect(alertasCreadas[0].message).toContain('guardar el rapport');
    });

    it('combo con valor: no se pregunta', async () => {
      component.preguntarEmpleados = true;
      component.rapport.Empleados = 3;
      botonesPulsados = ['No'];

      await component.modificarRapport();

      expect(alertasCreadas.some(mensajeEmpleados)).toBeFalse();
    });

    it('el 0 de "sin empleados" cuenta como valor: no se pregunta', async () => {
      component.preguntarEmpleados = true;
      component.rapport.Empleados = 0;
      botonesPulsados = ['No'];

      await component.modificarRapport();

      expect(alertasCreadas.some(mensajeEmpleados)).toBeFalse();
    });
  });
});
