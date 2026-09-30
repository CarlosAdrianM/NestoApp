import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, LoadingController, ModalController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';

import { PedidoVentaComponent } from './pedido-venta.component';
import { sinCamposSoloLectura } from './pedido-venta.service';
import { LineaVenta } from '../linea-venta/linea-venta';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('PedidoVentaComponent', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [PedidoVentaComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('Setter fechaEntrega sin conversión a Date (#85)', () => {

  it('debe asignar el string ISO directamente a las líneas sin convertir a Date', () => {
    const linea = new LineaVenta();
    linea.estado = 1;
    linea.picking = 0;

    // Simular lo que hace el setter: asignar string directamente
    const valorDatetime = '2026-02-17';
    linea.fechaEntrega = valorDatetime;

    // Debe ser el mismo string, no un objeto Date
    expect(linea.fechaEntrega).toBe('2026-02-17');
    expect(typeof linea.fechaEntrega).toBe('string');
  });

  it('el bug original con new Date() puede desfasar la fecha al serializar', () => {
    // Documentar el bug: new Date("2026-02-17") crea medianoche UTC,
    // que al serializar en zona CET puede dar día anterior
    const fechaDate = new Date('2026-02-17');

    // En UTC es medianoche del 17, pero toLocaleDateString en CET es 17
    // El problema real ocurre cuando JSON.stringify envía la fecha al backend
    const jsonDate = JSON.stringify(fechaDate); // "2026-02-17T00:00:00.000Z"
    expect(jsonDate).toContain('2026-02-17T00:00:00.000Z');

    // Mientras que con string directo:
    const fechaString = '2026-02-17';
    const jsonString = JSON.stringify(fechaString); // "\"2026-02-17\""
    expect(jsonString).toContain('2026-02-17');
    // El string no tiene componente horario, así que no hay desfase posible
  });
});

describe('Recoger Producto: borrado de etiqueta de recogida (#165)', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
    component.pedido = { empresa: '1', numero: 123 } as any;
  }));

  it('al desmarcar y CANCELAR la confirmación no borra la etiqueta y deja la casilla marcada', async () => {
    component.recogerProducto = false;
    component['envioRecogidaExistente'] = { Numero: 55 };
    spyOn<any>(component, 'confirmarBorradoEtiquetaRecogida').and.returnValue(Promise.resolve(false));
    const cancelarSpy = spyOn(component['servicio'], 'cancelarEtiquetaPendiente');

    await component.sincronizarRecogerProducto();

    expect(cancelarSpy).not.toHaveBeenCalled();
    expect(component.recogerProducto).toBeTrue();
  });

  it('al desmarcar y CONFIRMAR borra la etiqueta pendiente', async () => {
    component.recogerProducto = false;
    component['envioRecogidaExistente'] = { Numero: 55 };
    spyOn<any>(component, 'confirmarBorradoEtiquetaRecogida').and.returnValue(Promise.resolve(true));
    spyOn<any>(component, 'cargarSeguimientos');
    const cancelarSpy = spyOn(component['servicio'], 'cancelarEtiquetaPendiente').and.returnValue(of({}));

    await component.sincronizarRecogerProducto();

    expect(cancelarSpy).toHaveBeenCalledWith(55);
  });

  // Issue #200 (NestoAPI#494): con Agencia = 0 la API deja que el comparador elija la agencia
  // en modo envío + retorno; con 1 siempre era GLS.
  it('al marcar crea la etiqueta con agencia 0 para que la elija el comparador', async () => {
    component.recogerProducto = true;
    component['envioRecogidaExistente'] = null;
    component.pedido = { empresa: '1', numero: 925633 } as any;
    spyOn<any>(component, 'cargarSeguimientos');
    const crearSpy = spyOn(component['servicio'], 'crearEtiquetaPendiente').and.returnValue(of({}));

    await component.sincronizarRecogerProducto();

    expect(crearSpy).toHaveBeenCalledWith('1', 925633, 0, 1);
  });

  it('un 409 al crear muestra un mensaje claro en vez del error crudo', async () => {
    component.recogerProducto = true;
    component['envioRecogidaExistente'] = null;
    spyOn(component['servicio'], 'crearEtiquetaPendiente').and.returnValue(throwError(() => ({ status: 409 })));
    const alertSpy = spyOn(component['alertCtrl'], 'create').and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() } as any)
    );

    await component.sincronizarRecogerProducto();

    expect(alertSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      message: 'Ya existe una etiqueta pendiente para este pedido'
    }));
  });
});

/**
 * NestoApp#174 / NestoAPI#482: en el detalle del pedido, el toggle «Servir junto» pasa a ser
 * un selector de modo de servicio. Un pedido viejo sin modo enseña el que deriva de
 * servirJunto; al cambiar, modoServicio y servirJunto viajan coherentes en el PUT.
 */
describe('Modo de servicio en pedido-venta (#174)', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
  }));

  it('un pedido viejo sin modo enseña el derivado de servirJunto', () => {
    component.pedido = { servirJunto: true, Lineas: [] } as any;
    expect(component.modoServicioPedido).toBe(1);

    component.pedido = { servirJunto: false, Lineas: [] } as any;
    expect(component.modoServicioPedido).toBe(2);
  });

  it('un pedido con modo parcial lo enseña tal cual', () => {
    component.pedido = { servirJunto: false, modoServicio: 3, Lineas: [] } as any;
    expect(component.modoServicioPedido).toBe(3);
  });

  it('cambiar entre modos parciales actualiza el pedido sin validar', fakeAsync(() => {
    component.pedido = { servirJunto: false, modoServicio: 3, Lineas: [] } as any;
    const validar = spyOn(component['plantillaVentaService'], 'validarServirJunto');

    component.cambiarModoServicio(4);
    tick();

    expect(validar).not.toHaveBeenCalled();
    expect(component.pedido.modoServicio).toBe(4);
    expect(component.pedido.servirJunto).toBeFalse();
  }));

  it('volver a todo junto marca servirJunto sin validar', fakeAsync(() => {
    component.pedido = { servirJunto: false, modoServicio: 3, Lineas: [] } as any;
    const validar = spyOn(component['plantillaVentaService'], 'validarServirJunto');

    component.cambiarModoServicio(1);
    tick();

    expect(validar).not.toHaveBeenCalled();
    expect(component.pedido.modoServicio).toBe(1);
    expect(component.pedido.servirJunto).toBeTrue();
  }));

  it('salir de todo junto valida y revierte si el servidor deniega', fakeAsync(() => {
    component.pedido = { servirJunto: true, modoServicio: 1, formaPago: 'EFC', Lineas: [] } as any;
    const validar = spyOn(component['plantillaVentaService'], 'validarServirJunto')
      .and.returnValue(of({ PuedeDesmarcar: false, ProductosProblematicos: [], Mensaje: 'Hay muestras pendientes' }));
    spyOn(component['alertCtrl'], 'create').and.returnValue(
      Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) } as any)
    );

    component.cambiarModoServicio(2);
    tick();

    expect(validar).toHaveBeenCalled();
    expect(component.pedido.modoServicio).toBe(1);
    expect(component.pedido.servirJunto).toBeTrue();
  }));

  it('salir de todo junto con permiso del servidor deja el modo elegido', fakeAsync(() => {
    component.pedido = { servirJunto: true, modoServicio: 1, formaPago: 'EFC', Lineas: [] } as any;
    spyOn(component['plantillaVentaService'], 'validarServirJunto')
      .and.returnValue(of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null }));

    component.cambiarModoServicio(3);
    tick();

    expect(component.pedido.modoServicio).toBe(3);
    expect(component.pedido.servirJunto).toBeFalse();
  }));

  it('#187: si al modificar la API rechaza el modo, se enseña su mensaje y se preselecciona el que vale', fakeAsync(() => {
    component.pedido = { empresa: '1', numero: 900001, servirJunto: false, modoServicio: 4, Lineas: [] } as any;
    const alertas: any[] = [];
    spyOn(component['alertCtrl'], 'create').and.callFake((opts: any) => {
      alertas.push(opts);
      return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) } as any);
    });
    const error: any = {
      isBusinessError: true,
      apiError: {
        error: {
          code: 'MODO_SERVICIO_NO_PERMITIDO',
          message: 'El stock ha cambiado. Elige «Todo junto» y vuelve a guardar.',
          details: { modoSugerido: 1, modoSugeridoNombre: 'Todo junto', modosPermitidos: [1] }
        }
      }
    };

    component['manejarErrorModificacionPedido'](error, false);
    tick();

    expect(component.pedido.modoServicio).toBe(1);
    expect(component.pedido.servirJunto).toBeTrue();
    expect(alertas.length).toBe(1);
    expect(alertas[0].header).toBe('Modo de entrega');
    expect(alertas[0].message).toContain('vuelve a guardar');
  }));

  it('#191: con picking no se cambia el modo; vuelve al guardado y ofrece pedírselo a almacén', fakeAsync(() => {
    component.pedido = { empresa: '1', numero: 926879, servirJunto: true, modoServicio: 1, Lineas: [] } as any;
    component['modoServicioGuardado'] = 2; // el que tenía antes de que el vendedor lo tocase
    const ofrecer = spyOn(component['solicitudCambioModo'], 'ofrecer').and.returnValue(Promise.resolve());
    const error: any = {
      isBusinessError: true,
      apiError: { error: { code: 'MODO_CON_PICKING', message: 'Este pedido ya está en preparación (tiene picking).' } }
    };

    component['manejarErrorModificacionPedido'](error, false);
    tick();

    expect(ofrecer).toHaveBeenCalledWith('Este pedido ya está en preparación (tiene picking).', '1', 926879, 1);
    expect(component.pedido.modoServicio).toBe(2);
    expect(component.pedido.servirJunto).toBeFalse();
  }));
});

/**
 * NestoApp#197 / NestoAPI#542: modo de facturación en el pedido (sustituye a «Mantener junto»).
 */
describe('Modo de facturación en el pedido (#197)', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;
  let sugerido: jasmine.Spy;

  const sugerencia = (modo: number, permitidos: number[] = [1, 2, 3]) => of({
    Modo: modo, Nombre: 'X', Motivo: '', ModosPermitidos: permitidos,
    Modos: [1, 2, 3].map(m => ({ Modo: m, Nombre: 'M' + m, Permitido: permitidos.includes(m), Motivo: permitidos.includes(m) ? null : 'Los plazos no son los de la ficha' }))
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
    component.pedido = {
      empresa: '1', numero: 901234, cliente: '15191', contacto: '0', contactoCobro: '0',
      plazosPago: 'CONTADO', periodoFacturacion: 'NRM', notaEntrega: false,
      mantenerJunto: false, modoFacturacion: 3, Lineas: []
    } as any;
    sugerido = spyOn(component['plantillaVentaService'], 'modoFacturacionSugerido').and.returnValue(sugerencia(3));
  }));

  it('pide la sugerencia con el número del pedido y sin líneas', () => {
    component.pedirModoFacturacionSugerido();

    const enviado = sugerido.calls.mostRecent().args[0];
    expect(enviado.numero).toBe(901234);
    expect(enviado.Lineas).toEqual([]);
    expect(component.modoFacturacionPedido).toBe(3);
  });

  it('no vuelve a pedirla si no cambian cliente, dirección, plazos ni periodo', () => {
    component.pedirModoFacturacionSugerido();
    component.cambiarModoFacturacion(2);
    component.pedirModoFacturacionSugerido();
    expect(sugerido).toHaveBeenCalledTimes(1);

    component.cambiarContacto('1');
    expect(sugerido).toHaveBeenCalledTimes(2);

    component.seleccionarPlazosPago({ plazoPago: '30D', descuentoPP: 0 });
    expect(sugerido).toHaveBeenCalledTimes(3);
  });

  it('si el vendedor no toca el selector, se guarda con modoFacturacion null', () => {
    const guardado = component.pedidoParaGuardar();
    expect(guardado.modoFacturacion).toBeNull();
    expect(component.pedido.modoFacturacion).toBe(3); // la pantalla sigue enseñando el que rige
  });

  it('elegir «Al completar» marca mantenerJunto y viaja el modo', () => {
    component.cambiarModoFacturacion(2);
    const guardado = component.pedidoParaGuardar();
    expect(guardado.modoFacturacion).toBe(2);
    expect(guardado.mantenerJunto).toBeTrue();
  });

  it('elegir 1 o 3 desmarca mantenerJunto', () => {
    component.pedido.mantenerJunto = true;
    component.pedido.modoFacturacion = 2;
    component.cambiarModoFacturacion(3);
    expect(component.pedido.mantenerJunto).toBeFalse();
    component.cambiarModoFacturacion(1);
    expect(component.pedido.mantenerJunto).toBeFalse();
  });

  it('si el modo elegido deja de estar permitido, vuelve al sugerido y ya no cuenta como elección', () => {
    component.cambiarModoFacturacion(1);
    sugerido.and.returnValue(sugerencia(2, [2, 3]));

    component.seleccionarPlazosPago({ plazoPago: '60D', descuentoPP: 0 });

    expect(component.modoFacturacionPedido).toBe(2);
    expect(component.pedido.mantenerJunto).toBeTrue();
    expect(component.esModoFacturacionPermitido(1)).toBeFalse();
    expect(component.modosFacturacionNoPermitidos.map(m => m.Modo)).toEqual([1]);
  });

  it('una nota de entrega bloquea el selector', () => {
    sugerido.and.returnValue(of({ Modo: 1, Nombre: 'X', Motivo: '', ModosPermitidos: [], Modos: [] }));
    component.pedirModoFacturacionSugerido();
    expect(component.selectorFacturacionBloqueado).toBeTrue();
  });

  it('si la sugerencia falla, se deja elegir todo', () => {
    sugerido.and.returnValue(throwError(() => ({ status: 500 })));
    component.pedirModoFacturacionSugerido();
    expect(component.esModoFacturacionPermitido(1)).toBeTrue();
    expect(component.selectorFacturacionBloqueado).toBeFalse();
  });

  it('un error al guardar vuelve a pedir la sugerencia aunque no haya cambiado nada', async () => {
    component.pedirModoFacturacionSugerido();
    spyOn(component['alertCtrl'], 'create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() } as any));

    await component['manejarErrorModificacionPedido']({ message: 'Los plazos de pago no son de la ficha' } as any, false);

    expect(sugerido).toHaveBeenCalledTimes(2);
  });
});

describe('Campos de solo lectura del modo de facturación (#197)', () => {
  it('la línea conserva recoger y yaFacturado que manda la API', () => {
    const linea = new LineaVenta({ id: 1, recoger: 2, yaFacturado: true });
    expect(linea.recoger).toBe(2);
    expect(linea.yaFacturado).toBeTrue();
  });

  it('no se mandan nunca al guardar', () => {
    const pedido = {
      numero: 1, pedidoOrigen: 5, albaranOrigen: 7, modoFacturacion: 2,
      Lineas: [new LineaVenta({ id: 1, recoger: 2, yaFacturado: true, Producto: '38093' })]
    };
    const json = JSON.parse(JSON.stringify(pedido, sinCamposSoloLectura));
    expect(json.pedidoOrigen).toBeUndefined();
    expect(json.albaranOrigen).toBeUndefined();
    expect(json.Lineas[0].recoger).toBeUndefined();
    expect(json.Lineas[0].yaFacturado).toBeUndefined();
    expect(json.Lineas[0].Producto).toBe('38093');
    expect(json.modoFacturacion).toBe(2);
  });
});

/** NestoApp#198 / NestoAPI#519: pasar a otro cliente un pedido que todavía no ha salido. */
describe('Cambiar el cliente del pedido (#198)', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;
  let alertas: any[];
  let botonesPulsados: string[];
  let clienteElegido: any;

  beforeEach(waitForAsync(() => {
    alertas = [];
    botonesPulsados = [];
    clienteElegido = { cliente: '20000', contacto: '0', nombre: 'FICHA NUEVA' };
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        {
          provide: ModalController, useValue: {
            create: () => Promise.resolve({
              present: () => Promise.resolve(),
              onDidDismiss: () => Promise.resolve(clienteElegido ? { data: clienteElegido, role: 'elegido' } : { data: null, role: 'cancel' })
            })
          }
        },
        {
          provide: AlertController, useValue: {
            create: (opts: any) => {
              alertas.push(opts);
              return Promise.resolve({
                present: async () => {
                  const texto = botonesPulsados.shift();
                  const boton = (opts.buttons || []).find((b: any) => b && b.text === texto);
                  if (boton && boton.handler) { await boton.handler(); }
                }
              });
            }
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
    component.pedido = {
      empresa: '1', numero: 922500, cliente: '15191', contacto: '0',
      Lineas: [new LineaVenta({ id: 1, picking: 0, estado: 1, Producto: '38093' })]
    } as any;
    component['huellaGuardada'] = component['huellaPedido']();
  }));

  const respuesta = { Empresa: '1', Numero: 922500, ClienteAnterior: '15191', ContactoAnterior: '0', Cliente: '20000', Contacto: '0', Cambios: ['Forma de pago: EFC → RCB'] };

  it('solo se ofrece si ninguna línea ha salido', () => {
    expect(component.puedeCambiarCliente).toBeTrue();
    component.pedido.Lineas[0].picking = 12;
    expect(component.puedeCambiarCliente).toBeFalse();
  });

  it('pide el cliente, confirma, llama a CambiarCliente, enseña los cambios y recarga', fakeAsync(() => {
    botonesPulsados = ['Cambiar'];
    const cambiar = spyOn(component['servicio'], 'cambiarCliente').and.returnValue(of(respuesta));
    const recargar = spyOn(component, 'cargarPedido').and.returnValue(Promise.resolve());

    component.cambiarCliente();
    tick();

    expect(cambiar).toHaveBeenCalledWith('1', 922500, jasmine.objectContaining({ Cliente: '20000', Contacto: '0', CreadoSinPasarValidacion: false }));
    expect(recargar).toHaveBeenCalledWith('1', 922500);
    const final = alertas[alertas.length - 1];
    expect(final.header).toBe('Cliente cambiado');
    expect(final.message.value).toContain('Forma de pago: EFC → RCB');
  }));

  it('si cancela la confirmación no se toca nada', fakeAsync(() => {
    botonesPulsados = ['Cancelar'];
    const cambiar = spyOn(component['servicio'], 'cambiarCliente');

    component.cambiarCliente();
    tick();

    expect(cambiar).not.toHaveBeenCalled();
  }));

  it('si cierra el buscador sin elegir, no pregunta nada', fakeAsync(() => {
    clienteElegido = null;
    component.cambiarCliente();
    tick();
    expect(alertas.length).toBe(0);
  }));

  it('con cambios sin guardar avisa de que se pierden', fakeAsync(() => {
    component.pedido.comentarios = 'algo nuevo';
    const cambiar = spyOn(component['servicio'], 'cambiarCliente');

    component.cambiarCliente();
    tick();

    expect(alertas[0].message).toContain('se perderán');
    expect(cambiar).not.toHaveBeenCalled();
  }));

  it('sin cambios no habla de perder nada', fakeAsync(() => {
    component.cambiarCliente();
    tick();
    expect(alertas[0].message).not.toContain('se perderán');
  }));

  it('un 400 enseña el motivo de la API', fakeAsync(() => {
    botonesPulsados = ['Cambiar'];
    spyOn(component['servicio'], 'cambiarCliente').and.returnValue(throwError(() => ({ status: 400, message: 'La línea 3 tiene picking' })));
    spyOn(component['errorHandler'], 'extractErrorMessage').and.returnValue('La línea 3 tiene picking');

    component.cambiarCliente();
    tick();

    const final = alertas[alertas.length - 1];
    expect(final.header).toBe('No se ha podido cambiar el cliente');
    expect(final.message).toBe('La línea 3 tiene picking');
  }));

  it('si no pasa la validación y tiene permiso, puede reenviarlo sin validar', fakeAsync(() => {
    botonesPulsados = ['Cambiar', 'Cambiar sin validar'];
    component['usuario'].permitirCrearPedidoConErroresValidacion = true;
    const cambiar = spyOn(component['servicio'], 'cambiarCliente').and.returnValues(
      throwError(() => ({ status: 400, apiError: { error: { code: 'PEDIDO_VALIDACION_FALLO', message: 'Oferta no válida' } } })),
      of(respuesta));
    spyOn(component, 'cargarPedido').and.returnValue(Promise.resolve());

    component.cambiarCliente();
    tick();

    expect(cambiar).toHaveBeenCalledTimes(2);
    expect(cambiar.calls.mostRecent().args[2].CreadoSinPasarValidacion).toBeTrue();
  }));
});
