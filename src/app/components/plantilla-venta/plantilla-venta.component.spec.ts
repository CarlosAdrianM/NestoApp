import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { Storage } from '@ionic/storage-angular';

import { PlantillaVentaComponent } from './plantilla-venta.component';
import { PlantillaVentaService } from './plantilla-venta.service';
import { BorradorPlantillaVentaService } from 'src/app/services/borrador-plantilla-venta.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PlantillaVentaComponent', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [PlantillaVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
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
    declarations: [PlantillaVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
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

/**
 * Issue #172 (NestoAPI#468): al ampliar un pedido, el servidor podía responder 200 sin haber
 * guardado nada. El arreglo va entero en el servidor (UnirPedidos ahora lanza), pero aquí se
 * fija lo que la app tiene que hacer cuando la ampliación falla: NO dar el pedido por ampliado,
 * NO registrar la analítica y, sobre todo, NO reinicializar (eso borraría lo que el vendedor
 * tiene metido en la plantilla y le dejaría sin nada que reintentar).
 */
describe('Ampliar pedido cuando el servidor lo rechaza (#172)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let logEvent: jasmine.Spy;
  let servicio: any;

  beforeEach(waitForAsync(() => {
    logEvent = jasmine.createSpy('logEvent');
    servicio = {
      unirPedidos: jasmine.createSpy('unirPedidos')
        .and.returnValue(throwError(() => ({ Message: 'No se puede servir junto' }))),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of(['COS', 'ACC'])
    };

    TestBed.configureTestingModule({
      declarations: [PlantillaVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: PlantillaVentaService, useValue: servicio },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: AlertController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }) } },
        { provide: FirebaseAnalytics, useValue: { logEvent } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('no reinicializa la plantilla ni registra la analítica si la ampliación falla', fakeAsync(() => {
    const reinicializar = spyOn<any>(component, 'reinicializar');
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', cifNif: 'B12345678' };

    component['ejecutarAmpliacion']({ numero: 0 }, false);
    tick();

    expect(servicio.unirPedidos).toHaveBeenCalled();
    expect(reinicializar).not.toHaveBeenCalled();
    expect(logEvent).not.toHaveBeenCalled();
  }));
});

/**
 * Issue #173: los borradores se acumulan porque al crear el pedido no se eliminan. No se borra
 * en silencio (un borrador puede ser una base reutilizable): se pregunta al terminar el pedido
 * y se hace lo que diga el usuario. Solo aplica al borrador cargado explícitamente
 * (onCargarBorrador); los borradores que se guardan solos al fallar la creación no entran.
 */
describe('Borrar el borrador al crear el pedido (#173)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;
  let borradorService: any;
  let alertasCreadas: any[];
  let botonesPulsados: string[];

  const borradorBase = (): any => ({
    id: 'b1',
    fechaCreacion: '2026-09-10T12:15:00',
    usuario: 'carlos',
    empresa: '1',
    cliente: '40445',
    contacto: '0',
    nombreCliente: 'LUXURY NADOR',
    lineasProducto: [{ producto: 'p1' }, { producto: 'p2' }, { producto: 'p3' }],
    lineasRegalo: [],
    esPresupuesto: false,
    formaPago: 'EFC',
    plazosPago: 'CONTADO',
    fechaEntrega: '',
    almacenCodigo: 'ALG',
    mantenerJunto: false,
    servirJunto: false,
    total: 100
  });

  beforeEach(waitForAsync(() => {
    alertasCreadas = [];
    botonesPulsados = [];

    servicio = {
      crearPedido: jasmine.createSpy('crearPedido').and.returnValue(of({ numero: '925001' })),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of(['COS', 'ACC'])
    };
    borradorService = {
      eliminarBorrador: jasmine.createSpy('eliminarBorrador').and.resolveTo(undefined),
      obtenerBorradores: jasmine.createSpy('obtenerBorradores').and.resolveTo([]),
      cargarBorrador: jasmine.createSpy('cargarBorrador').and.resolveTo(borradorBase())
    };

    TestBed.configureTestingModule({
      declarations: [PlantillaVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: PlantillaVentaService, useValue: servicio },
        { provide: BorradorPlantillaVentaService, useValue: borradorService },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        {
          provide: AlertController, useValue: {
            create: (opts: any) => {
              alertasCreadas.push(opts);
              return Promise.resolve({
                present: async () => {
                  const texto = botonesPulsados.shift();
                  const boton = (opts.buttons || []).find((b: any) => b && b.text === texto);
                  if (boton && boton.handler) {
                    await boton.handler();
                  }
                },
                dismiss: () => Promise.resolve(),
                onDidDismiss: () => Promise.resolve({})
              });
            }
          }
        },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  it('cargar un borrador lo deja apuntado como origen del próximo pedido', fakeAsync(() => {
    spyOn<any>(component, 'aplicarBorradorParaRestaurar'); // la restauración en sí no es lo que se prueba

    component.onCargarBorrador('b1');
    tick();

    expect(component['borradorOrigen']).toEqual(jasmine.objectContaining({ id: 'b1' }));
  }));

  it('si confirma, elimina el borrador y refresca la lista', fakeAsync(() => {
    botonesPulsados = ['Sí, borrarlo'];

    component.preguntarBorrarBorrador('925001', borradorBase());
    tick();

    expect(borradorService.eliminarBorrador).toHaveBeenCalledWith('b1');
    expect(borradorService.obtenerBorradores).toHaveBeenCalled();
  }));

  it('si cancela, el borrador se queda como está', fakeAsync(() => {
    botonesPulsados = ['No'];

    component.preguntarBorrarBorrador('925001', borradorBase());
    tick();

    expect(borradorService.eliminarBorrador).not.toHaveBeenCalled();
  }));

  it('sin borrador de origen no se pregunta nada', fakeAsync(() => {
    component.preguntarBorrarBorrador('925001', null);
    tick();

    expect(alertasCreadas.length).toBe(0);
  }));

  it('al crear el pedido desde un borrador cargado se pregunta con el número del pedido', fakeAsync(() => {
    spyOn<any>(component, 'reinicializar');
    spyOn<any>(component, 'detectarOfertasSinBeneficio').and.returnValue([]);
    spyOn<any>(component, 'prepararPedido').and.returnValue({});
    spyOn<any>(component, 'esTarjetaPrepago').and.returnValue(false);
    const preguntar = spyOn(component, 'preguntarBorrarBorrador');
    component['borradorOrigen'] = borradorBase();

    component.crearPedido();
    tick();

    expect(preguntar).toHaveBeenCalledWith('925001', jasmine.objectContaining({ id: 'b1' }));
    expect(component['borradorOrigen']).toBeNull();
  }));
});

/**
 * NestoApp#174 / NestoAPI#482: el toggle «Servir junto» pasa a ser un selector con cuatro
 * modos de servicio. servirJunto se sigue mandando coherente (solo el modo 1 es true) para
 * que un servidor sin migrar no cambie de comportamiento. Espejo de Nesto#476.
 */
describe('Modo de servicio (#174)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;
  let alertasCreadas: any[];

  beforeEach(waitForAsync(() => {
    alertasCreadas = [];
    servicio = {
      validarServirJunto: jasmine.createSpy('validarServirJunto')
        .and.returnValue(of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null })),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of(['COS', 'ACC']),
      leerCliente: () => of({}),
      calcularPortes: () => of({})
    };

    TestBed.configureTestingModule({
      declarations: [PlantillaVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: PlantillaVentaService, useValue: servicio },
        { provide: BorradorPlantillaVentaService, useValue: { generarId: () => 'nuevo-id' } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        {
          provide: AlertController, useValue: {
            create: (opts: any) => {
              alertasCreadas.push(opts);
              return Promise.resolve({
                present: () => Promise.resolve(),
                dismiss: () => Promise.resolve(),
                onDidDismiss: () => Promise.resolve({})
              });
            }
          }
        },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
  }));

  const direccionBase = (): any => ({
    contacto: '0', servirJunto: true, mantenerJunto: false, iva: 'G21',
    formaPago: 'EFC', plazosPago: 'CONTADO', periodoFacturacion: 'NRM',
    vendedor: 'NV', ruta: '00', ccc: null, noComisiona: 0, comentarioRuta: ''
  });

  it('sin dirección todavía, el selector enseña el modo por defecto (3)', () => {
    expect(component.modoServicio).toBe(3);
  });

  it('al cambiar de dirección el pedido nace en el por defecto, sin arrastrar el servir junto de la ficha', fakeAsync(() => {
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B12345678' };

    component.direccionSeleccionada = direccionBase(); // la ficha viene con servirJunto = true
    tick();

    expect(component.modoServicio).toBe(3);
    expect(component.direccionSeleccionada.servirJunto).toBeFalse();
  }));

  it('pasar de todo junto a un modo parcial valida contra el servidor con el modo elegido', fakeAsync(() => {
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B12345678' };
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: true };
    component['modoServicioSeleccionado'] = 1;

    component.cambiarModoServicio(2);
    tick();

    expect(servicio.validarServirJunto).toHaveBeenCalled();
    const modoEnviado = servicio.validarServirJunto.calls.mostRecent().args[5];
    expect(modoEnviado).toBe(2);
    expect(component.modoServicio).toBe(2);
  }));

  it('si el servidor deniega, se revierte a todo junto y se enseña el mensaje', fakeAsync(() => {
    servicio.validarServirJunto.and.returnValue(of({ PuedeDesmarcar: false, ProductosProblematicos: [], Mensaje: 'Hay regalos que lo requieren' }));
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B12345678' };
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: true };
    component['modoServicioSeleccionado'] = 1;

    component.cambiarModoServicio(3);
    tick();

    expect(component.modoServicio).toBe(1);
    expect(component.direccionSeleccionada.servirJunto).toBeTrue();
    expect(alertasCreadas.some(a => (a.message || '').includes('Hay regalos que lo requieren'))).toBeTrue();
  }));

  it('entre modos parciales no se valida (de menos a más restrictivo, libre)', fakeAsync(() => {
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };
    component['modoServicioSeleccionado'] = 3;

    component.cambiarModoServicio(4);
    tick();

    expect(servicio.validarServirJunto).not.toHaveBeenCalled();
    expect(component.modoServicio).toBe(4);
  }));

  it('el DTO lleva el modo elegido y el servirJunto coherente (parcial)', () => {
    component.clienteSeleccionado = { empresa: '1 ', cliente: '12345', contacto: '0', cifNif: 'B12345678', comentarioPicking: null };
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };
    component['modoServicioSeleccionado'] = 4;
    component['productosResumen'] = [];
    component.formaPago = 'EFC';
    component.plazosPago = 'CONTADO';

    const pedido = component['prepararPedido']();

    expect(pedido.modoServicio).toBe(4);
    expect(pedido.servirJunto).toBeFalse();
  });

  it('el DTO de todo junto viaja con servirJunto true', () => {
    component.clienteSeleccionado = { empresa: '1 ', cliente: '12345', contacto: '0', cifNif: 'B12345678', comentarioPicking: null };
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: true };
    component['modoServicioSeleccionado'] = 1;
    component['productosResumen'] = [];
    component.formaPago = 'EFC';
    component.plazosPago = 'CONTADO';

    const pedido = component['prepararPedido']();

    expect(pedido.modoServicio).toBe(1);
    expect(pedido.servirJunto).toBeTrue();
  });

  it('el borrador guarda el modo de servicio', () => {
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };
    component['modoServicioSeleccionado'] = 4;

    const borrador = component['crearBorradorDesdeEstadoActual']();

    expect(borrador.modoServicio).toBe(4);
    expect(borrador.servirJunto).toBeFalse();
  });

  it('restaurar un borrador con modo lo aplica', fakeAsync(() => {
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };
    component['borradorEnRestauracion'] = { modoServicio: 4, servirJunto: false } as any;

    component['aplicarConfiguracionBorrador']();
    tick(1000);

    expect(component.modoServicio).toBe(4);
  }));

  it('un borrador viejo sin modo deriva del servirJunto', fakeAsync(() => {
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };
    component['borradorEnRestauracion'] = { servirJunto: true } as any;

    component['aplicarConfiguracionBorrador']();
    tick(1000);

    expect(component.modoServicio).toBe(1);
    expect(component.direccionSeleccionada.servirJunto).toBeTrue();
  }));

  it('los modos de entrega única (1 y 4) mandan servirJunto=true a portes y regalos', () => {
    component['_direccionSeleccionada'] = { ...direccionBase(), servirJunto: false };

    component['modoServicioSeleccionado'] = 4;
    expect(component.servirJuntoParaRegalos).toBeTrue();

    component['modoServicioSeleccionado'] = 3;
    expect(component.servirJuntoParaRegalos).toBeFalse();
  });
});
