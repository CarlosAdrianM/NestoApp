import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActionSheetController, AlertController, IonicModule, LoadingController, Platform } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { Storage } from '@ionic/storage-angular';

import { PlantillaVentaComponent } from './plantilla-venta.component';
import { PlantillaVentaService } from './plantilla-venta.service';
import { BorradorPlantillaVentaService } from 'src/app/services/borrador-plantilla-venta.service';
import { Subject, of, throwError } from 'rxjs';
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
    component['_direccionSeleccionada'] = { contacto: '0' }; // #179: sin dirección no se crea pedido

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

describe('Slide de pago sin dirección ni condiciones de pago (#179 / #182)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;
  let alertasCreadas: any[];

  beforeEach(waitForAsync(() => {
    alertasCreadas = [];
    servicio = {
      sePuedeServirPorGlovo: jasmine.createSpy('sePuedeServirPorGlovo').and.returnValue(of(null)),
      calcularPortes: jasmine.createSpy('calcularPortes').and.returnValue(of({})),
      validarServirJunto: () => of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null }),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of(['COS', 'ACC']),
      leerCliente: () => of({})
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
    contacto: '0', servirJunto: false, mantenerJunto: false, iva: 'G21',
    formaPago: 'EFC', plazosPago: 'CONTADO', periodoFacturacion: 'NRM',
    vendedor: 'NV', ruta: '00', ccc: null, noComisiona: 0, comentarioRuta: '',
    codigoPostal: '28001'
  });

  const clienteBase = (): any => ({
    empresa: '1 ', cliente: '12345', contacto: '0 ', cifNif: 'B12345678', comentarioPicking: null
  });

  // #182: ELMAH 22/09/2026, Iñaki. plazosPago llegaba null y .trim() reventaba la pantalla.
  it('prepararPedido no revienta con plazosPago null', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = direccionBase();
    component['productosResumen'] = [];
    component.formaPago = 'EFC';
    component.plazosPago = null;

    const pedido = component['prepararPedido']();

    expect(pedido).toBeTruthy();
    expect(pedido.plazosPago).toBeNull();
  });

  it('prepararPedido saca el código cuando los plazos vienen como objeto', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = direccionBase();
    component['productosResumen'] = [];
    component.formaPago = { formaPago: 'EFC' };
    component.plazosPago = { plazoPago: 'CNT' };

    const pedido = component['prepararPedido']();

    expect(pedido.plazosPago).toBe('CNT');
    expect(pedido.formaPago).toBe('EFC');
  });

  it('prepararPedido recorta los plazos con espacios', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = direccionBase();
    component['productosResumen'] = [];
    component.plazosPago = 'CNT  ';

    expect(component['prepararPedido']().plazosPago).toBe('CNT');
  });

  // #179: ELMAH 17/09/2026, Israel. direccionSeleccionada undefined con el resumen cargado.
  it('prepararPedido devuelve null si no hay dirección seleccionada', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = undefined;
    component['productosResumen'] = [{ producto: '12345', cantidad: 1 }];

    expect(() => component['prepararPedido']()).not.toThrow();
    expect(component['prepararPedido']()).toBeNull();
  });

  it('no se pregunta a Glovo si todavía no hay dirección seleccionada', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = undefined;
    component['productosResumen'] = [{ producto: '12345', cantidad: 1 }];

    component['comprobarSiSePuedeServirPorGlovo']();

    expect(servicio.sePuedeServirPorGlovo).not.toHaveBeenCalled();
    expect(component.sePuedeServirPorGlovo).toBeFalse();
  });

  it('cambiar los plazos de pago sin dirección no revienta', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = undefined;
    component['productosResumen'] = [{ producto: '12345', cantidad: 1 }];

    expect(() => component.cambiarPlazosPago('CNT')).not.toThrow();
  });

  it('en la slide de dirección sin dirección no se deja avanzar con el gesto', () => {
    const swiper: any = { activeIndex: 4, previousIndex: 3, allowSlideNext: true };
    component['sliderRef'] = { nativeElement: { swiper } } as any;
    component.indexActivo = component.indexSlideDireccion;
    component['_direccionSeleccionada'] = undefined;

    component['actualizarBloqueoAvanceSinDireccion']();

    expect(swiper.allowSlideNext).toBeFalse();
  });

  it('al llegar la dirección se vuelve a permitir avanzar', () => {
    const swiper: any = { activeIndex: 4, previousIndex: 3, allowSlideNext: false };
    component['sliderRef'] = { nativeElement: { swiper } } as any;
    component.indexActivo = component.indexSlideDireccion;
    component.clienteSeleccionado = clienteBase();

    component.seleccionarCliente(direccionBase());

    expect(swiper.allowSlideNext).toBeTrue();
  });

  it('la plantilla no revienta con el resumen cargado y sin dirección', () => {
    component.clienteSeleccionado = clienteBase();
    component['_direccionSeleccionada'] = undefined;
    component['productosResumen'] = [{ producto: '12345', cantidad: 1, texto: 'CERA', precio: 10, iva: 'G21' }];

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

describe('Salir de la plantilla con el botón atrás de Android (#183)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let accionesCreadas: any[];
  let botonPulsado: string;

  beforeEach(waitForAsync(() => {
    accionesCreadas = [];
    botonPulsado = 'Cancelar';

    TestBed.configureTestingModule({
      declarations: [PlantillaVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: PlantillaVentaService, useValue: { calcularFechaEntrega: () => of(new Date().toISOString()), cargarGruposBonificables: () => of([]) } },
        { provide: BorradorPlantillaVentaService, useValue: { generarId: () => 'nuevo-id' } },
        {
          provide: ActionSheetController, useValue: {
            create: (opts: any) => {
              accionesCreadas.push(opts);
              return Promise.resolve({
                present: () => {
                  const boton = opts.buttons.find((b: any) => b.text === botonPulsado);
                  if (boton) { boton.handler(); }
                  return Promise.resolve();
                }
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

  it('con productos en el carrito se pregunta qué hacer, se salga por donde se salga', fakeAsync(() => {
    component['_selectorPlantillaVenta'] = { hayAlgunProducto: () => true } as any;

    let puedeSalir: boolean = null;
    Promise.resolve(component.canDeactivate() as Promise<boolean>).then(r => puedeSalir = r);
    tick();

    expect(accionesCreadas.length).toBe(1);
    expect(puedeSalir).toBeFalse(); // 'Cancelar'
  }));

  it('abrir el detalle de un producto no pregunta nada (no se está saliendo del pedido)', () => {
    component['_selectorPlantillaVenta'] = { hayAlgunProducto: () => true } as any;

    const puedeSalir = component.canDeactivate({ url: '/selector-plantilla-venta-detalle?producto=12345' } as any);

    expect(puedeSalir).toBeTrue();
    expect(accionesCreadas.length).toBe(0);
  });

  it('ir a rellenar la ficha del cliente tampoco pregunta', () => {
    component['_selectorPlantillaVenta'] = { hayAlgunProducto: () => true } as any;

    const puedeSalir = component.canDeactivate({ url: '/cliente?empresa=1&cliente=12345&contacto=0' } as any);

    expect(puedeSalir).toBeTrue();
    expect(accionesCreadas.length).toBe(0);
  });

  it('salir de verdad de la plantilla sí pregunta', fakeAsync(() => {
    component['_selectorPlantillaVenta'] = { hayAlgunProducto: () => true } as any;

    let puedeSalir: boolean = null;
    Promise.resolve(component.canDeactivate({ url: '/home' } as any) as Promise<boolean>).then(r => puedeSalir = r);
    tick();

    expect(accionesCreadas.length).toBe(1);
    expect(puedeSalir).toBeFalse();
  }));

  it('con el carrito vacío se sale sin preguntar', () => {
    component['_selectorPlantillaVenta'] = { hayAlgunProducto: () => false } as any;

    expect(component.canDeactivate() as boolean).toBeTrue();
    expect(accionesCreadas.length).toBe(0);
  });

  it('sin selector todavía (pedido recién creado) se sale sin preguntar', () => {
    component['_selectorPlantillaVenta'] = undefined;

    expect(component.canDeactivate() as boolean).toBeTrue();
  });

  it('la plantilla no engancha handlers al botón atrás de Android', () => {
    // El handler de depuración del constructor no encadenaba (no llamaba a processNextHandler),
    // así que anulaba el atrás en las 16 pantallas con ion-back-button, y encima se acumulaba
    // uno por cada instancia. El único que debe quedar es el por defecto de Ionic.
    const platform: any = TestBed.inject(Platform);
    const handlersAntes = platform.backButton.observers?.length ?? 0;

    TestBed.createComponent(PlantillaVentaComponent);
    TestBed.createComponent(PlantillaVentaComponent);

    expect(platform.backButton.observers?.length ?? 0).toBe(handlersAntes);
  });
});

/**
 * NestoApp#169 / NestoAPI#457: al llegar al resumen se pregunta al servidor qué ofertas se
 * podrían aplicar y no se están aplicando. Es una ayuda: si la API falla o tarda, el pedido
 * se cierra igual.
 */
describe('Ofertas que el pedido podría aplicar (#169)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;

  const sugerenciaAmpliar = {
    Tipo: 'AmpliarCantidad', Producto: '38093', CantidadActual: 5, CantidadSugerida: 6,
    CantidadRegalo: 1, ImporteQueFalta: 0, ImportePedido: 0, Descuento: 0,
    Texto: 'Con 1 unidad más te llevas la séptima de regalo'
  };

  beforeEach(waitForAsync(() => {
    servicio = {
      ofertasSugeridas: jasmine.createSpy('ofertasSugeridas').and.returnValue(of([sugerenciaAmpliar])),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of([]),
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
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B1' };
    component['_direccionSeleccionada'] = { contacto: '0', iva: 'G21' };
    component['productosResumen'] = [{ producto: '38093', cantidad: 5, cantidadOferta: 0 }];
  }));

  it('al llegar al resumen se piden las sugerencias y se resumen', fakeAsync(() => {
    component.cargarSugerenciasOfertas();
    tick();

    expect(servicio.ofertasSugeridas).toHaveBeenCalled();
    expect(component.sugerenciasOfertas.length).toBe(1);
    expect(component.textoSugerenciasOfertas).toBe('1 oferta sin aplicar');
  }));

  it('si la API falla, no se avisa de nada y el pedido sigue', fakeAsync(() => {
    servicio.ofertasSugeridas.and.returnValue(throwError(() => ({ statusCode: 500 })));

    expect(() => { component.cargarSugerenciasOfertas(); tick(); }).not.toThrow();
    expect(component.sugerenciasOfertas.length).toBe(0);
    expect(component.textoSugerenciasOfertas).toBe('');
  }));

  it('sin pedido que mandar (sin dirección) no se llama al servidor', fakeAsync(() => {
    component['_direccionSeleccionada'] = undefined;

    component.cargarSugerenciasOfertas();
    tick();

    expect(servicio.ofertasSugeridas).not.toHaveBeenCalled();
  }));

  it('aplicar una sugerencia ajusta las unidades de esa línea y la quita de la lista', fakeAsync(() => {
    const lineas = [{ producto: '38093', cantidad: 5, cantidadOferta: 0 }];
    component['_selectorPlantillaVenta'] = {
      aplicarCantidades: jasmine.createSpy('aplicarCantidades').and.returnValue(true),
      cargarResumen: () => lineas,
      hayAlgunProducto: () => true
    } as any;
    component.cargarSugerenciasOfertas();
    tick();

    servicio.ofertasSugeridas.and.returnValue(of([])); // ya aplicada, el servidor no sugiere más
    component.aplicarSugerenciaOferta(component.sugerenciasOfertas[0]);
    tick();

    expect(component['_selectorPlantillaVenta'].aplicarCantidades).toHaveBeenCalledWith('38093', 6, 1);
    expect(servicio.ofertasSugeridas).toHaveBeenCalledTimes(2); // se recalcula tras aplicar
    expect(component.sugerenciasOfertas.length).toBe(0);
  }));

  it('el plegable de ofertas nace cerrado y se abre y se cierra de verdad (no solo la flecha)', fakeAsync(() => {
    component.cargarSugerenciasOfertas();
    tick();
    fixture.detectChanges();
    const texto = () => fixture.nativeElement.textContent as string;
    expect(texto()).toContain('1 oferta sin aplicar');
    expect(texto()).not.toContain(sugerenciaAmpliar.Texto);

    component.verSugerenciasOfertas = true;
    fixture.detectChanges();
    expect(texto()).toContain(sugerenciaAmpliar.Texto);

    component.verSugerenciasOfertas = false;
    fixture.detectChanges();
    expect(texto()).not.toContain(sugerenciaAmpliar.Texto);
  }));

  it('mientras se calcula se avisa de que aún no se sabe si hay ofertas', fakeAsync(() => {
    const respuesta = new Subject<any[]>();
    servicio.ofertasSugeridas.and.returnValue(respuesta);

    component.cargarSugerenciasOfertas();
    expect(component.calculandoSugerenciasOfertas).toBeTrue();
    expect(component.textoSugerenciasOfertas).toBe('Calculando ofertas sin aplicar…');

    respuesta.next([sugerenciaAmpliar]);
    respuesta.complete();
    expect(component.calculandoSugerenciasOfertas).toBeFalse();
    expect(component.textoSugerenciasOfertas).toBe('1 oferta sin aplicar');
  }));

  it('al recalcular no se enseña el recuento viejo como si fuera el bueno', fakeAsync(() => {
    component.cargarSugerenciasOfertas();
    tick();
    expect(component.textoSugerenciasOfertas).toBe('1 oferta sin aplicar');

    const respuesta = new Subject<any[]>();
    servicio.ofertasSugeridas.and.returnValue(respuesta);
    component.cargarSugerenciasOfertas();

    expect(component.textoSugerenciasOfertas).toBe('Calculando ofertas sin aplicar…');
    respuesta.next([sugerenciaAmpliar, { ...sugerenciaAmpliar, Producto: '99999' }]);
    expect(component.textoSugerenciasOfertas).toBe('2 ofertas sin aplicar');
  }));

  it('si llega tarde la respuesta de un cálculo anterior, no pisa la del último', fakeAsync(() => {
    const primera = new Subject<any[]>();
    const segunda = new Subject<any[]>();
    servicio.ofertasSugeridas.and.returnValues(primera, segunda);

    component.cargarSugerenciasOfertas();
    component.cargarSugerenciasOfertas();
    segunda.next([]);
    primera.next([sugerenciaAmpliar]);

    expect(component.sugerenciasOfertas.length).toBe(0);
    expect(component.calculandoSugerenciasOfertas).toBeFalse();
  }));

  it('la sugerencia de importe de pedido no intenta tocar ninguna línea', fakeAsync(() => {
    servicio.ofertasSugeridas.and.returnValue(of([{
      Tipo: 'AmpliarImporte', Producto: null, CantidadActual: 0, CantidadSugerida: 0,
      CantidadRegalo: 0, ImporteQueFalta: 12, ImportePedido: 200, Descuento: 0,
      Texto: 'Añadiendo 12,00 € llegas al regalo'
    }]));
    component['_selectorPlantillaVenta'] = {
      aplicarCantidades: jasmine.createSpy('aplicarCantidades'),
      cargarResumen: () => [], hayAlgunProducto: () => true
    } as any;
    component.cargarSugerenciasOfertas();
    tick();

    component.aplicarSugerenciaOferta(component.sugerenciasOfertas[0]);
    tick();

    expect(component['_selectorPlantillaVenta'].aplicarCantidades).not.toHaveBeenCalled();
    expect(component.sugerenciasOfertas.length).toBe(1);
  }));
});

/**
 * NestoApp#184 / NestoAPI#506: el modo de servicio con el que nace el pedido lo decide el
 * servidor según el stock real de las líneas. La app lo preselecciona al llegar al resumen,
 * sin pisar lo que el vendedor haya elegido a mano.
 */
describe('Modo de servicio sugerido por el servidor (#184)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;

  const sugerencia = (modo: number, motivo = 'Todas las líneas tienen stock en el almacén') =>
    of({ Modo: modo, Nombre: 'X', LineasVerdes: 2, LineasRosas: 0, LineasRojas: 0, Motivo: motivo });

  beforeEach(waitForAsync(() => {
    servicio = {
      modoServicioSugerido: jasmine.createSpy('modoServicioSugerido').and.returnValue(sugerencia(1)),
      ofertasSugeridas: () => of([]),
      validarServirJunto: jasmine.createSpy('validarServirJunto').and.returnValue(of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null })),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of([]),
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
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B1' };
    component['_direccionSeleccionada'] = { contacto: '0', iva: 'G21', servirJunto: false };
    component['modoServicioSeleccionado'] = 3;
    component['productosResumen'] = [{ producto: '38093', cantidad: 2, cantidadOferta: 0 }];
  }));

  it('con stock de todo, el pedido pasa a «Todo junto»', fakeAsync(() => {
    component.cargarModoServicioSugerido();
    tick();

    expect(servicio.modoServicioSugerido).toHaveBeenCalled();
    expect(component.modoServicio).toBe(1);
    expect(component.motivoModoServicio).toContain('stock');
  }));

  it('si el vendedor ya ha elegido modo, no se le pisa', fakeAsync(() => {
    component.cambiarModoServicio(4);
    tick();

    component.cargarModoServicioSugerido();
    tick();

    // #187: se pregunta igual (hay que saber qué modos siguen teniendo sentido), pero su modo manda
    expect(servicio.modoServicioSugerido).toHaveBeenCalled();
    expect(component.modoServicio).toBe(4);
  }));

  it('si el «Todo junto» lo puso la sugerencia, una línea nueva lo puede cambiar', fakeAsync(() => {
    // Lo que vio Carlos en Master: con stock de todo sale «Todo junto»; al volver atrás y meter
    // una línea que hay que reponer de tiendas, el resumen tiene que pasar a «Tras reponer».
    component.cargarModoServicioSugerido();
    tick();
    expect(component.modoServicio).toBe(1);

    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay líneas que hay que reponer de tiendas'));
    component.cargarModoServicioSugerido();
    tick();

    expect(component.modoServicio).toBe(3);
    expect(component.direccionSeleccionada.servirJunto).toBeFalse();
  }));

  it('salir de «Todo junto» por la sugerencia pasa por la validación del servidor', fakeAsync(() => {
    component.cargarModoServicioSugerido();
    tick();
    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay líneas que reponer'));

    component.cargarModoServicioSugerido();
    tick();

    expect(servicio.validarServirJunto).toHaveBeenCalled();
  }));

  it('cambiar de dirección de entrega no pierde el modo que calculó el servidor', fakeAsync(() => {
    servicio.modoServicioSugerido.and.returnValue(sugerencia(4, 'Hay líneas sin stock en ningún sitio'));
    component.cargarModoServicioSugerido();
    tick();
    expect(component.modoServicio).toBe(4);

    // El vendedor cambia a otro contacto de entrega: antes esto devolvía el pedido al 3 local.
    component.direccionSeleccionada = { contacto: '1', iva: 'G21', servirJunto: true };
    tick();

    expect(component.modoServicio).toBe(4);
  }));

  it('si el vendedor eligió «Todo junto» a mano, la sugerencia no se lo quita', fakeAsync(() => {
    component['_direccionSeleccionada'].servirJunto = false;
    component['modoServicioSeleccionado'] = 3;
    component.cambiarModoServicio(1);
    tick();
    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay líneas que reponer'));

    component.cargarModoServicioSugerido();
    tick();

    expect(component.modoServicio).toBe(1);
  }));

  it('si la llamada falla se queda el modo de siempre', fakeAsync(() => {
    servicio.modoServicioSugerido.and.returnValue(throwError(() => ({ statusCode: 500 })));

    expect(() => { component.cargarModoServicioSugerido(); tick(); }).not.toThrow();
    expect(component.modoServicio).toBe(3);
    expect(component.motivoModoServicio).toBe('');
  }));

  it('restaurar un borrador manda sobre la sugerencia', fakeAsync(() => {
    component['borradorEnRestauracion'] = { modoServicio: 4, servirJunto: false } as any;

    component.cargarModoServicioSugerido();
    tick();

    expect(servicio.modoServicioSugerido).not.toHaveBeenCalled();
  }));
});

/**
 * NestoApp#185: al volver atrás, cambiar las líneas y avanzar otra vez, el modo de servicio tiene
 * que recalcularse. El recálculo automático no es una elección del vendedor, así que no le saca
 * los diálogos de la salida manual de «Todo junto».
 */
describe('Recalcular el modo de servicio al volver al resumen (#185)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;
  let alertasCreadas: any[];

  const sugerencia = (modo: number, motivo = 'Motivo del servidor', modos: any[] = []) =>
    of({ Modo: modo, Nombre: 'X', LineasVerdes: 0, LineasRosas: 0, LineasRojas: 0, Motivo: motivo, ModosPermitidos: [], Modos: modos });

  beforeEach(waitForAsync(() => {
    alertasCreadas = [];
    servicio = {
      modoServicioSugerido: jasmine.createSpy('modoServicioSugerido').and.returnValue(sugerencia(1)),
      ofertasSugeridas: jasmine.createSpy('ofertasSugeridas').and.returnValue(of([])),
      validarServirJunto: jasmine.createSpy('validarServirJunto').and.returnValue(of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null })),
      cargarListaPendientes: () => of([]),
      crearPedido: jasmine.createSpy('crearPedido').and.returnValue(of({ numero: '925001' })),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of([]),
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
                onDidDismiss: () => Promise.resolve({ role: 'cancel' })
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
    component.clienteSeleccionado = { empresa: '1', cliente: '12345', contacto: '0', cifNif: 'B1' };
    component['_direccionSeleccionada'] = { contacto: '0', iva: 'G21', servirJunto: false };
    component['modoServicioSeleccionado'] = 3;
    component['productosResumen'] = [{ producto: '38093', cantidad: 2, cantidadOferta: 0 }];
  }));

  it('si el servidor no deja salir de «Todo junto» en un recálculo automático, se queda sin alerta y lo explica', fakeAsync(() => {
    component.cargarModoServicioSugerido();
    tick();
    expect(component.modoServicio).toBe(1);

    servicio.validarServirJunto.and.returnValue(of({ PuedeDesmarcar: false, Mensaje: 'Hay regalos que exigen servir todo junto' }));
    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay líneas que reponer de tiendas'));
    component.cargarModoServicioSugerido();
    tick();

    expect(component.modoServicio).toBe(1);
    expect(alertasCreadas.length).toBe(0);
    expect(component.motivoModoServicio).toContain('regalos');
  }));

  it('los avisos de portes o comisión no piden confirmación en un recálculo automático', fakeAsync(() => {
    component.cargarModoServicioSugerido();
    tick();

    servicio.validarServirJunto.and.returnValue(of({ PuedeDesmarcar: true, Aviso: 'Contra reembolso: se cobra comisión por cada entrega' }));
    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay líneas que reponer de tiendas'));
    component.cargarModoServicioSugerido();
    tick();

    expect(alertasCreadas.length).toBe(0);
    expect(component.modoServicio).toBe(3);
  }));

  it('cuando es el vendedor quien sale de «Todo junto», los avisos se siguen preguntando', fakeAsync(() => {
    component['_direccionSeleccionada'].servirJunto = true;
    component['modoServicioSeleccionado'] = 1;
    servicio.validarServirJunto.and.returnValue(of({ PuedeDesmarcar: true, Aviso: 'Contra reembolso: se cobra comisión por cada entrega' }));

    component.cambiarModoServicio(2);
    tick();

    expect(alertasCreadas.length).toBe(1);
    expect(component.modoServicio).toBe(1); // canceló
  }));

  it('al volver al resumen desde los productos se recalculan modo y ofertas aunque falle la comprobación de regalos', fakeAsync(() => {
    component['sliderRef'] = { nativeElement: { swiper: { activeIndex: 2, previousIndex: 1, update: () => { } } } } as any;
    component['_selectorPlantillaVenta'] = { cargarResumen: () => component['productosResumen'], hayAlgunProducto: () => true } as any;
    spyOn<any>(component, 'validarRegalosSeleccionados').and.callFake(() => Promise.resolve());
    spyOn<any>(component, 'verificarProductosBonificables').and.callFake(() => Promise.reject(new Error('fallo de red')));

    component.avanzar();
    tick(200);

    expect(servicio.modoServicioSugerido).toHaveBeenCalled();
    expect(servicio.ofertasSugeridas).toHaveBeenCalled();
  }));

  const modosAlg = [
    { Modo: 1, Nombre: 'Todo junto', Permitido: true, Motivo: null },
    { Modo: 2, Nombre: 'Según vaya entrando', Permitido: false, Motivo: 'Todo el pedido tiene stock en Algete: sale todo junto.' },
    { Modo: 3, Nombre: 'Tras reponer de tiendas', Permitido: false, Motivo: 'No hay nada que traer de las tiendas.' },
    { Modo: 4, Nombre: 'Ahora lo que hay, el resto de una vez', Permitido: false, Motivo: 'Todo el pedido tiene stock en Algete.' }
  ];

  it('#187: los modos que el servidor no permite se marcan y se explica por qué', fakeAsync(() => {
    servicio.modoServicioSugerido.and.returnValue(sugerencia(1, 'Todo tiene stock', modosAlg));

    component.cargarModoServicioSugerido();
    tick();

    expect(component.esModoServicioPermitido(1)).toBeTrue();
    expect(component.esModoServicioPermitido(2)).toBeFalse();
    expect(component.modosServicioNoPermitidos.map(m => m.Modo)).toEqual([2, 3, 4]);
    expect(component.modosServicioNoPermitidos[0].Motivo).toContain('Algete');
  }));

  it('#187: sin respuesta del servidor, todos los modos se pueden elegir', fakeAsync(() => {
    servicio.modoServicioSugerido.and.returnValue(throwError(() => ({ statusCode: 500 })));

    component.cargarModoServicioSugerido();
    tick();

    expect([1, 2, 3, 4].every(m => component.esModoServicioPermitido(m))).toBeTrue();
    expect(component.modosServicioNoPermitidos.length).toBe(0);
  }));

  it('#187: si el modo que eligió el vendedor deja de tener sentido, se pasa al sugerido y se explica', fakeAsync(() => {
    component.cambiarModoServicio(4); // 3 → 4, elegido a mano
    tick();
    servicio.modoServicioSugerido.and.returnValue(sugerencia(1, 'Todo tiene stock', modosAlg));

    component.cargarModoServicioSugerido();
    tick();

    expect(component.modoServicio).toBe(1);
    expect(component.motivoModoServicio).toContain('Ahora lo que hay, el resto de una vez');
    expect(component.motivoModoServicio).toContain('Todo junto');
  }));

  it('#187: si el modo que eligió el vendedor sigue permitido, se respeta', fakeAsync(() => {
    component.cambiarModoServicio(4);
    tick();
    servicio.modoServicioSugerido.and.returnValue(sugerencia(3, 'Hay que reponer', [
      { Modo: 1, Nombre: 'Todo junto', Permitido: true, Motivo: null },
      { Modo: 2, Nombre: 'Según vaya entrando', Permitido: true, Motivo: null },
      { Modo: 3, Nombre: 'Tras reponer de tiendas', Permitido: true, Motivo: null },
      { Modo: 4, Nombre: 'Ahora lo que hay, el resto de una vez', Permitido: true, Motivo: null }
    ]));

    component.cargarModoServicioSugerido();
    tick();

    expect(component.modoServicio).toBe(4);
  }));

  it('#187: si al crear el pedido la API rechaza el modo, se enseña su mensaje y se preselecciona el que vale', fakeAsync(() => {
    spyOn<any>(component, 'detectarOfertasSinBeneficio').and.returnValue([]);
    spyOn<any>(component, 'prepararPedido').and.returnValue({});
    const ofrecerBorrador = spyOn<any>(component, 'ofrecerGuardarBorrador');
    component['modoServicioSeleccionado'] = 4;
    servicio.crearPedido.and.returnValue(throwError(() => ({
      isBusinessError: true,
      apiError: {
        error: {
          code: 'MODO_SERVICIO_NO_PERMITIDO',
          message: 'El stock ha cambiado mientras montabas el pedido. Elige «Todo junto» y vuelve a guardar.',
          details: { modoSugerido: 1, modoSugeridoNombre: 'Todo junto', modosPermitidos: [1] }
        }
      }
    })));

    component.crearPedido();
    tick();

    expect(component.modoServicio).toBe(1);
    expect(alertasCreadas.some(a => (a.message || '').includes('vuelve a guardar'))).toBeTrue();
    expect(ofrecerBorrador).not.toHaveBeenCalled();
    expect(component.esModoServicioPermitido(4)).toBeFalse();
  }));
});
