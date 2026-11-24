import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActionSheetController, AlertController, IonicModule, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';

import { PedidoVentaComponent } from './pedido-venta.component';
import { PedidoVentaService, sinCamposSoloLectura } from './pedido-venta.service';
import { PlantillaVentaService } from '../plantilla-venta/plantilla-venta.service';
import { LineaVenta } from '../linea-venta/linea-venta';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { EnvioWhatsAppService } from 'src/app/services/envio-whatsapp.service';
import { PagoAPlazosService } from 'src/app/services/pago-a-plazos.service';
import { CampanaSoloEnStockService } from 'src/app/services/campana-solo-en-stock.service';
import { DondeEstaLoQueFaltaService } from 'src/app/services/donde-esta-lo-que-falta.service';

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

  it('#237: el estado de envío 5 es «Cerrado a mano», en gris', () => {
    expect(component.textoEstadoEnvio(5)).toBe('Cerrado a mano');
    expect(component.colorEstadoEnvio(5)).toBe('medium');
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

  it('#232: si la muestra sin stock es una línea sin picking, ofrece borrarla y la borra con un sí', fakeAsync(() => {
    const muestra = { tipoLinea: 1, Producto: '17404', texto: 'MUESTRA', Cantidad: 1, picking: 0 };
    const crema = { tipoLinea: 1, Producto: '20000', texto: 'CREMA', Cantidad: 2, picking: 0 };
    component.pedido = { servirJunto: true, modoServicio: 1, formaPago: 'EFC', Lineas: [muestra, crema] } as any;
    const validar = spyOn(component['plantillaVentaService'], 'validarServirJunto').and.returnValues(
      of({ PuedeDesmarcar: false, ProductosProblematicos: [{ ProductoId: '17404', ProductoNombre: 'MUESTRA', AlmacenConStock: null }], Mensaje: 'Sin stock' }),
      of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null }));
    const alertas: any[] = [];
    spyOn(component['alertCtrl'], 'create').and.callFake((o: any) => {
      alertas.push(o);
      return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ role: 'confirm' }) } as any);
    });

    component.cambiarModoServicio(2);
    tick();

    expect(alertas[0].message).toContain('¿Quiere borrarlas del pedido');
    expect((validar.calls.mostRecent().args[2] as any[]).map(l => l.ProductoId)).toEqual(['20000']);
    expect(component.pedido.Lineas).toEqual([crema] as any);
    expect(component.pedido.modoServicio).toBe(2);
  }));

  it('#232: con la muestra ya en picking no se ofrece; se dice que se queda en «Todo junto»', fakeAsync(() => {
    component.pedido = { servirJunto: true, modoServicio: 1, formaPago: 'EFC',
      Lineas: [{ tipoLinea: 1, Producto: '17404', Cantidad: 1, picking: 55 }] } as any;
    spyOn(component['plantillaVentaService'], 'validarServirJunto').and.returnValue(
      of({ PuedeDesmarcar: false, ProductosProblematicos: [{ ProductoId: '17404', ProductoNombre: 'M', AlmacenConStock: null }], Mensaje: 'Sin stock' }));
    const alertas: any[] = [];
    spyOn(component['alertCtrl'], 'create').and.callFake((o: any) => {
      alertas.push(o);
      return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) } as any);
    });

    component.cambiarModoServicio(2);
    tick();

    expect(alertas.length).toBe(1);
    expect(alertas[0].message).toBe('Sin stock. El pedido se queda en «Todo junto».');
    expect(component.pedido.modoServicio).toBe(1);
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
    // NestoApp#242: con una API sin OpcionesModos (null) se sigue preguntando como siempre.
    spyOn(component['plantillaVentaService'], 'opcionesModos').and.returnValue(of(null));
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

/** NestoApp#215 (NestoAPI#606): fecha de entrega a la agencia en el detalle del pedido. */
describe('PedidoVentaComponent: fecha de entrega a la agencia (#215)', () => {
  let component: PedidoVentaComponent;

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
    component = TestBed.createComponent(PedidoVentaComponent).componentInstance;
  }));

  it('enseña la de ahora y, si difiere, la prometida', () => {
    spyOn(component['servicio'], 'cargarFechaEntregaAgencia').and.returnValue(of({
      PrimeraEntrega: '2026-10-16T00:00:00', EntregaCompleta: '2026-10-16T00:00:00', FechaEntregaAgencia: '2026-10-16T00:00:00',
      Aplica: 'Completa', Entregas: [], Motivo: null, FechaPrometida: '2026-10-15T00:00:00'
    }));

    component.cargarFechaEntregaAgencia('1', 928170);

    expect(component['servicio'].cargarFechaEntregaAgencia).toHaveBeenCalledWith('1', 928170);
    expect(component.textoFechaEntregaAgencia).toBe('Se entrega a la agencia el viernes 16/10');
    expect(component.textoFechaPrometida).toBe('Al crear el pedido se prometió el jueves 15/10');
  });

  it('con una API sin el endpoint no enseña nada', () => {
    spyOn(component['servicio'], 'cargarFechaEntregaAgencia').and.returnValue(of(null));
    component.cargarFechaEntregaAgencia('1', 928170);
    expect(component.textoFechaEntregaAgencia).toBe('');
  });
});

/** NestoApp#223 (Nesto#522): fotos del packing de cada bulto en el detalle del pedido. */
describe('PedidoVentaComponent: fotos de los bultos (#223)', () => {
  let component: PedidoVentaComponent;
  let hojas: any[];

  const bulto = (id: number, tieneFoto = true) => ({
    Id: id, Empresa: '1', Pedido: 926940, Picking: 5, Bulto: id, Peso: 2, TieneFoto: tieneFoto, NumeroEnvio: null,
    Usuario: 'mozo', FechaFoto: '2026-10-09T10:00:00', RutaFotoPublica: tieneFoto ? `api/Almacen/Fotos/${id}-abc` : null
  });

  beforeEach(waitForAsync(() => {
    hojas = [];
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: ActionSheetController, useValue: { create: (o: any) => { hojas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    component = TestBed.createComponent(PedidoVentaComponent).componentInstance;
  }));

  it('carga los bultos y pide el enlace de la foto solo de los que la tienen', () => {
    spyOn(component['servicio'], 'cargarBultos').and.returnValue(of([bulto(1), bulto(2, false)] as any));
    const enlace = spyOn(component['servicio'], 'enlaceFotoBulto').and.returnValue(of({ Url: 'https://blob/1.jpg?sas', MinutosDeVigencia: 15 }));

    component.cargarBultos('1', 926940);

    expect(component.bultos.length).toBe(2);
    expect(enlace).toHaveBeenCalledTimes(1);
    expect(component.fotosBultos[1]).toBe('https://blob/1.jpg?sas');
  });

  it('sin hoja de compartir del sistema, ofrece WhatsApp o copiar el enlace público', async () => {
    const nav: any = navigator;
    const share = nav.share;
    nav.share = undefined;
    try {
      await component.compartirFotoBulto(bulto(1) as any);
    } finally {
      nav.share = share;
    }

    expect(hojas.length).toBe(1);
    expect(hojas[0].buttons.map((b: any) => b.text)).toEqual(['Mandar por WhatsApp', 'Copiar el enlace', 'Cancelar']);
    expect(component.enlacePublicoFoto(bulto(1) as any)).toContain('/api/Almacen/Fotos/1-abc');
  });
});

/**
 * NestoApp#254 (retener), #242 (opciones de modos), #241 (forma de pago y CCC), #250 (origen del modo),
 * #252 (fecha lejana) y #240 (fecha sin determinar) en el detalle del pedido.
 */
describe('PedidoVentaComponent: retener, opciones de modos, fecha lejana (#254 / #242 / #241 / #250 / #252 / #240)', () => {
  let component: PedidoVentaComponent;
  let fixture: ComponentFixture<PedidoVentaComponent>;
  let servicio: any;
  let plantilla: any;
  let alertas: any[];
  let plazos: any;
  let campana: any;
  let dondeEsta: any;

  const pedidoBase = (extra: any = {}) => ({
    empresa: '1', numero: 929057, cliente: '15191', contacto: '0', contactoCobro: '0', formaPago: 'TRN', ccc: null,
    plazosPago: 'CONTADO', periodoFacturacion: 'NRM', notaEntrega: false, iva: 'G21', vendedor: 'NV',
    mantenerJunto: false, modoFacturacion: 1, modoServicio: 3, servirJunto: false, retencion: null,
    Lineas: [{ id: 1, estado: -1, picking: 0, tipoLinea: 1, Producto: 'A', Cantidad: 1, fechaEntrega: '2026-10-28T00:00:00' }],
    ...extra
  });

  const opciones = (facturacionVisible: boolean, casillaVisible: boolean, valor = true) => ({
    Servicio: { Modo: 3, Nombre: '', LineasVerdes: 0, LineasRosas: 0, LineasRojas: 0, Motivo: '' },
    Facturacion: { Modo: 1, Nombre: 'Por entregas', Motivo: '', ModosPermitidos: [1, 2, 3], Modos: [], Visible: facturacionVisible, MotivoOculta: facturacionVisible ? null : 'Con «Todo junto» el pedido sale de una vez.' },
    ServirPendienteAlHaberStock: { Visible: casillaVisible, Valor: valor, Motivo: null }
  });

  const ultimaAlerta = () => alertas[alertas.length - 1];
  const pulsar = async (alerta: any, texto: string, datos?: any) => {
    const boton = alerta.buttons.find((b: any) => b.text === texto);
    if (boton?.handler) { await boton.handler(datos); }
  };

  beforeEach(waitForAsync(() => {
    alertas = [];
    servicio = {
      cargarPedido: jasmine.createSpy('cargarPedido').and.returnValue(of(pedidoBase())),
      cargarFechaEntregaAgencia: () => of(null),
      cargarBultos: () => of([]),
      cargarEnlacesSeguimiento: () => of([]),
      cargarParametrosIva: () => of([]),
      modificarPedido: jasmine.createSpy('modificarPedido').and.returnValue(of({})),
      retener: jasmine.createSpy('retener').and.returnValue(of({ Id: 1, Pedido: 929057, Motivo: 'Noviembre', HastaFecha: '2026-11-15T00:00:00', Usuario: 'NUEVAVISION\\Alfredo', Fecha: '2026-10-27T10:00:00' })),
      liberar: jasmine.createSpy('liberar').and.returnValue(of({ Id: 1, Pedido: 929057, Liberado: '2026-10-27T11:00:00' })),
      leerRetenidosPorFalta: jasmine.createSpy('leerRetenidosPorFalta').and.returnValue(of([])),
      decidirRetencionPorFalta: jasmine.createSpy('decidirRetencionPorFalta').and.returnValue(of({}))
    };
    plantilla = {
      opcionesModos: jasmine.createSpy('opcionesModos').and.returnValue(of(opciones(true, false))),
      modoFacturacionSugerido: jasmine.createSpy('modoFacturacionSugerido').and.returnValue(of(null))
    };
    plazos = {
      estado: jasmine.createSpy('estado').and.returnValue(of(null)),
      disponible: jasmine.createSpy('disponible').and.returnValue(of(null)),
      ofrecer: jasmine.createSpy('ofrecer').and.returnValue(Promise.resolve(true)),
      preguntarCancelar: jasmine.createSpy('preguntarCancelar').and.returnValue(Promise.resolve(true))
    };
    campana = { consultar: jasmine.createSpy('consultar').and.returnValue(of({ HayAviso: false })) };
    dondeEsta = { leer: jasmine.createSpy('leer').and.returnValue(of({ Empresa: '1', Pedido: 929057, TodoEnAlgete: true, Mensaje: 'Todo está en Algete', Productos: [] })) };
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: PedidoVentaService, useValue: servicio },
        { provide: PlantillaVentaService, useValue: plantilla },
        { provide: PagoAPlazosService, useValue: plazos },
        { provide: CampanaSoloEnStockService, useValue: campana },
        { provide: DondeEstaLoQueFaltaService, useValue: dondeEsta },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }); } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: ToastController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PedidoVentaComponent);
    component = fixture.componentInstance;
  }));

  describe('retenido hasta nuevo aviso (#254)', () => {
    it('un pedido con modo 5 enseña «Retenido», deshabilita el selector y dice quién y hasta cuándo', fakeAsync(() => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ modoServicio: 5, servirJunto: false,
        retencion: { Id: 1, Pedido: 929057, Motivo: 'El cliente lo quiere para noviembre', HastaFecha: '2026-11-15T00:00:00', Usuario: 'NUEVAVISION\\Alfredo', Fecha: '2026-10-22T10:00:00', Liberado: null } })));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.modoServicioPedido).toBe(5);
      expect(component.estaRetenido).toBeTrue();
      expect(component.listaModosServicioSelector.some(m => m.codigo === 5 && m.nombre === 'Retenido')).toBeTrue();
      expect(component.textoRetencion).toBe('Retenido por Alfredo desde el 22/10/2026 hasta el 15/11/2026: El cliente lo quiere para noviembre');
      expect(component.puedeRetener).toBeFalse();
    }));

    it('retenido, el selector no cambia el modo (hay que liberar antes) y el PUT sigue mandando el 5', fakeAsync(() => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ modoServicio: 5, servirJunto: true })));
      component.cargarPedido('1', 929057);
      tick();

      component.cambiarModoServicio(1);

      expect(component.pedido.modoServicio).toBe(5);
      expect(component.pedidoParaGuardar().modoServicio).toBe(5);
      expect(component.pedidoParaGuardar().OrigenModoServicio).toBeUndefined();
    }));

    it('el 5 nunca se elige desde el selector', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(component.listaModosServicioSelector.some(m => m.codigo === 5)).toBeFalse();

      component.cambiarModoServicio(5);
      expect(component.pedido.modoServicio).toBe(3);
    }));

    it('«Retener…» pide el motivo (obligatorio) y la fecha opcional, y recarga el pedido', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      expect(component.puedeRetener).toBeTrue();

      await component.retenerPedido();
      const dialogo = ultimaAlerta();
      expect(dialogo.header).toBe('Retener el pedido');
      expect(dialogo.inputs.map((i: any) => i.name)).toEqual(['motivo', 'hasta']);

      await pulsar(dialogo, 'Retener', { motivo: ' Noviembre ', hasta: '2026-11-15T00:00:00' });
      tick();

      expect(servicio.retener).toHaveBeenCalledWith('1', 929057, { Motivo: 'Noviembre', HastaFecha: '2026-11-15' });
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2);
    }));

    it('sin motivo no se retiene', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();

      await component.enviarRetencion('  ', null);
      tick();

      expect(servicio.retener).not.toHaveBeenCalled();
      expect(ultimaAlerta().message).toContain('motivo');
    }));

    it('«Liberar» pide confirmación y libera', fakeAsync(async () => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ modoServicio: 5 })));
      component.cargarPedido('1', 929057);
      tick();

      const liberando = component.liberarPedido();
      await Promise.resolve();
      await pulsar(ultimaAlerta(), 'Liberar');
      await liberando;
      tick();

      expect(servicio.liberar).toHaveBeenCalledWith('1', 929057);
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2);
    }));
  });

  // NestoApp#281 / NestoAPI#864: pagar a plazos el pedido.
  describe('pagar a plazos (#281)', () => {
    const estado = (extra: any = {}) => ({ HaySolicitud: true, Estado: 'Pendiente', NombreProveedor: 'Aplázame', Importe: 300, ...extra });
    const disponible = (extra: any = {}) => ({ Disponible: true, NombreProveedor: 'Aplázame', Importe: 300, Motivo: null, ...extra });

    it('sin solicitud y disponible: sale el botón con el nombre del proveedor', fakeAsync(() => {
      plazos.disponible.and.returnValue(of(disponible()));
      component.cargarPedido('1', 929057);
      tick();
      expect(plazos.estado).toHaveBeenCalledWith('1', 929057);
      expect(component.puedePedirPagoAPlazos).toBeTrue();
      expect(component.nombreProveedorPlazos).toBe('Aplázame');
      expect(component.textoPlazosNoDisponible).toBe('');
    }));

    it('no disponible: no hay botón y se dice el motivo', fakeAsync(() => {
      plazos.disponible.and.returnValue(of(disponible({ Disponible: false, Motivo: 'El importe es menor que el mínimo.' })));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.puedePedirPagoAPlazos).toBeFalse();
      expect(component.textoPlazosNoDisponible).toBe('Aplázame no disponible: El importe es menor que el mínimo.');
    }));

    it('con una solicitud pendiente: su estado, «Cancelar» y no se vuelve a ofrecer', fakeAsync(() => {
      plazos.estado.and.returnValue(of(estado()));
      component.cargarPedido('1', 929057);
      tick();
      expect(plazos.disponible).not.toHaveBeenCalled();
      expect(component.textoPagoAPlazos).toContain('pendiente de que el cliente termine');
      expect(component.puedeCancelarPagoAPlazos).toBeTrue();
      expect(component.puedePedirPagoAPlazos).toBeFalse();
    }));

    it('«Pagar a plazos» lleva el diálogo y, si se pide, recarga el estado', fakeAsync(async () => {
      plazos.disponible.and.returnValue(of(disponible()));
      component.cargarPedido('1', 929057);
      tick();
      await component.pedirPagoAPlazos();
      tick();
      expect(plazos.ofrecer).toHaveBeenCalledWith('1', 929057, jasmine.objectContaining({ Disponible: true }));
      expect(plazos.estado).toHaveBeenCalledTimes(2);
    }));
  });

  // NestoApp#279 / NestoAPI#858: el pedido «todo junto» retenido en el packing por una falta.
  describe('retenido por una falta: servir lo que hay o esperar (#279)', () => {
    const retencion = (extra: any = {}) => ({
      Id: 7, Empresa: '1', Pedido: 929057, Picking: 55, Cliente: '15191', Contacto: '0', NombreCliente: 'LOLA',
      Productos: '41234 CHAMPÚ X 1L', Fecha: '2026-11-13T10:00:00', Plazo: '2026-11-13T12:30:00', Estado: 'Pendiente',
      UsuarioDecision: null, FechaDecision: null, PorPlazo: false, PuedeDecidir: true, Mensaje: null, ...extra
    });

    it('al cargar el pedido busca su retención pendiente y la enseña', fakeAsync(() => {
      servicio.leerRetenidosPorFalta.and.returnValue(of([retencion({ Pedido: 1 }), retencion()]));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.retencionPorFalta?.Id).toBe(7);
      expect(component.textoRetencionPorFalta).toContain('41234 CHAMPÚ X 1L');
    }));

    it('sin retención pendiente (o si la API falla) no hay banda', fakeAsync(() => {
      servicio.leerRetenidosPorFalta.and.returnValue(of([retencion({ Estado: 'Esperar' })]));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.retencionPorFalta).toBeNull();
    }));

    it('«Servir lo que hay» pide confirmación, decide y recarga el pedido', fakeAsync(async () => {
      servicio.leerRetenidosPorFalta.and.returnValue(of([retencion()]));
      component.cargarPedido('1', 929057);
      tick();

      const decidiendo = component.decidirRetencionPorFalta('ServirLoQueHay');
      await Promise.resolve();
      expect(ultimaAlerta().header).toBe('Servir lo que hay');
      await pulsar(ultimaAlerta(), 'Servir lo que hay');
      await decidiendo;
      tick();

      expect(servicio.decidirRetencionPorFalta).toHaveBeenCalledWith('1', 929057, 'ServirLoQueHay');
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2);
    }));

    it('si la API dice que no (409: ya decidido, picking sin terminar…), enseña su mensaje', fakeAsync(async () => {
      servicio.leerRetenidosPorFalta.and.returnValue(of([retencion()]));
      servicio.decidirRetencionPorFalta.and.returnValue(throwError(() => ({ status: 409, error: { Message: 'El picking todavía no está terminado.' } })));
      component.cargarPedido('1', 929057);
      tick();

      const decidiendo = component.decidirRetencionPorFalta('Esperar');
      await Promise.resolve();
      await pulsar(ultimaAlerta(), 'Esperar');
      await decidiendo;
      tick();

      expect(ultimaAlerta().message).toContain('El picking todavía no está terminado.');
    }));

    it('si no puede decidir, no salen los botones', fakeAsync(() => {
      servicio.leerRetenidosPorFalta.and.returnValue(of([retencion({ PuedeDecidir: false })]));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.puedeDecidirRetencionPorFalta).toBeFalse();
    }));
  });

  describe('opciones de modos y «Servir lo pendiente en cuanto haya stock» (#242)', () => {
    it('con «Todo junto» la API oculta el selector de facturación y no se manda el modo', fakeAsync(() => {
      plantilla.opcionesModos.and.returnValue(of(opciones(false, false)));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.facturacionVisible).toBeFalse();
      expect(component.motivoFacturacionOculta).toContain('Todo junto');
      component.cambiarModoFacturacion(3);
      expect(component.pedidoParaGuardar().modoFacturacion).toBeNull();
    }));

    it('con «Todo ahora» sale la casilla marcada por defecto y solo viaja si se toca', fakeAsync(() => {
      plantilla.opcionesModos.and.returnValue(of(opciones(true, true, true)));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.casillaServirPendienteVisible).toBeTrue();
      expect(component.pedido.servirPendienteAlHaberStock).toBeTrue();
      expect(component.pedidoParaGuardar().servirPendienteAlHaberStock).toBeNull();

      component.cambiarServirPendiente(false);
      expect(component.pedidoParaGuardar().servirPendienteAlHaberStock).toBeFalse();
    }));

    it('con una API anterior (404) se pregunta el modo de facturación como siempre y no hay casilla', fakeAsync(() => {
      plantilla.opcionesModos.and.returnValue(of(null));
      component.cargarPedido('1', 929057);
      tick();

      expect(plantilla.modoFacturacionSugerido).toHaveBeenCalled();
      expect(component.facturacionVisible).toBeTrue();
      expect(component.casillaServirPendienteVisible).toBeFalse();
      expect(component.pedidoParaGuardar().servirPendienteAlHaberStock).toBeNull();
    }));

    it('cambiar el modo de servicio vuelve a pedir las opciones', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(plantilla.opcionesModos).toHaveBeenCalledTimes(1);

      component.cambiarModoServicio(1);
      tick();

      expect(plantilla.opcionesModos).toHaveBeenCalledTimes(2);
      expect(plantilla.opcionesModos.calls.mostRecent().args[0].modoServicio).toBe(1);
    }));
  });

  describe('la forma de pago y el CCC vuelven a pedir el modo de facturación (#241)', () => {
    it('pasar de transferencia a efectivo pregunta otra vez', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(plantilla.opcionesModos).toHaveBeenCalledTimes(1);

      component.seleccionarFormaPago('EFC');
      tick();
      expect(plantilla.opcionesModos).toHaveBeenCalledTimes(2);

      component.cambiarCcc('ES00');
      tick();
      expect(plantilla.opcionesModos).toHaveBeenCalledTimes(3);
    }));
  });

  describe('origen del modo de servicio (#250)', () => {
    it('sin tocar el modo no se manda origen; si el vendedor lo cambia, «Usuario»', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(component.pedidoParaGuardar().OrigenModoServicio).toBeUndefined();

      component.cambiarModoServicio(2);
      expect(component.pedidoParaGuardar().OrigenModoServicio).toBe('Usuario');
    }));
  });

  describe('aviso de fecha de entrega lejana al modificar (#252)', () => {
    const errorFechaLejana = {
      statusCode: 400,
      apiError: { error: { code: 'FECHA_ENTREGA_LEJANA', message: 'La fecha de entrega de las líneas es el miércoles 27/10/2027 (dentro de 365 días). ¿Es correcta?', timestamp: '' } }
    };

    it('cada guardado manda ConfirmarFechaEntregaLejana false', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(component.pedidoParaGuardar().ConfirmarFechaEntregaLejana).toBeFalse();
    }));

    it('con «Sí» repite la misma petición confirmada', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      servicio.modificarPedido.and.returnValues(throwError(() => errorFechaLejana), of({}));

      const enviando = component.enviarModificacion(false);
      tick();
      await enviando;
      const pregunta = ultimaAlerta();
      expect(pregunta.message).toContain('¿Es correcta?');
      await pulsar(pregunta, 'Sí');
      tick();

      expect(servicio.modificarPedido).toHaveBeenCalledTimes(2);
      expect(servicio.modificarPedido.calls.argsFor(1)[0].ConfirmarFechaEntregaLejana).toBeTrue();
    }));

    it('con «No» no se graba ni sale ningún otro error', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      servicio.modificarPedido.and.returnValue(throwError(() => errorFechaLejana));

      const enviando = component.enviarModificacion(false);
      tick();
      await enviando;
      const pregunta = ultimaAlerta();
      await pulsar(pregunta, 'Cancelar');
      tick();

      expect(servicio.modificarPedido).toHaveBeenCalledTimes(1);
      expect(alertas.filter(a => a.header === 'Error').length).toBe(0);
      // El siguiente guardado vuelve a preguntar
      component.modificarPedido();
      tick();
      expect(component.pedidoParaGuardar().ConfirmarFechaEntregaLejana).toBeFalse();
    }));
  });

  describe('fecha de entrega sin determinar (#240)', () => {
    it('una línea pendiente con 31/12/2099 avisa y se pinta como «Sin fecha»', fakeAsync(() => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ Lineas: [{ id: 1, estado: -1, picking: 0, tipoLinea: 1, fechaEntrega: '2099-12-31T00:00:00' }] })));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.sinFechaEntrega).toBeTrue();
      expect(component.textoFecha('2099-12-31T00:00:00')).toBe('Sin fecha');
      expect(component.textoFecha('2026-10-28T00:00:00')).toBe('28/10/2026');
    }));
  });
  describe('versión del pedido y 409 PEDIDO_CAMBIADO (#285)', () => {
    const errorCambiado = {
      statusCode: 409,
      apiError: { error: { code: 'PEDIDO_CAMBIADO', timestamp: '', details: { Version: 'v2', Usuario: 'Aida' },
        message: 'El pedido 929057 lo ha modificado Aida a las 15:14 desde que usted lo abrió. Recárguelo y vuelva a hacer los cambios.' } }
    };

    it('el PUT devuelve la versión que trajo el GET', fakeAsync(() => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ Version: 'v1' })));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.pedidoParaGuardar().Version).toBe('v1');
    }));

    /** Carga el pedido, deja que el vendedor lo cambie, y hace que el guardado dé el 409. Devuelve el aviso «Pedido modificado». */
    const guardarConElPedidoCambiado = async (cambiosDelVendedor: () => void, enElServidor: any) => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ Version: 'v1' })));
      component.cargarPedido('1', 929057);
      tick();
      cambiosDelVendedor();
      servicio.cargarPedido.and.returnValue(of(enElServidor));
      servicio.modificarPedido.and.returnValue(throwError(() => errorCambiado));
      const enviando = component.enviarModificacion(false);
      tick();
      await enviando;
      return ultimaAlerta();
    };
    const lineaNueva = () => new LineaVenta({ id: 0, estado: -1, picking: 0, tipoLinea: 1, Producto: 'B', Cantidad: 2, fechaEntrega: '2026-10-28T00:00:00' } as any);

    it('ante el 409 enseña el mensaje de la API y ofrece recargar conservando los cambios, sin ellos o «Ahora no», como Nesto', fakeAsync(async () => {
      const aviso = await guardarConElPedidoCambiado(() => { }, pedidoBase({ Version: 'v2' }));

      expect(aviso.header).toBe('Pedido modificado');
      expect(aviso.message).toBe(errorCambiado.apiError.error.message +
        '\n\nNo se ha guardado nada. Puede recargarlo conservando sus cambios: solo se le preguntará por lo que hayan cambiado los dos.');
      expect(aviso.buttons.map((b: any) => b.text)).toEqual(['Recargar conservando mis cambios', 'Recargar sin mis cambios', 'Ahora no']);
      expect(alertas.filter(a => a.header === 'Error').length).toBe(0);

      await pulsar(aviso, 'Ahora no');
      tick();
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(1);
      expect(servicio.modificarPedido).toHaveBeenCalledTimes(1);
    }));

    it('«Recargar sin mis cambios» avisa de que se pierden y, si acepta, vuelve a leer el pedido', fakeAsync(async () => {
      const aviso = await guardarConElPedidoCambiado(() => component.pedido.Lineas[0].Cantidad = 4, pedidoBase({ Version: 'v2' }));

      await pulsar(aviso, 'Recargar sin mis cambios');
      tick();
      const confirmacion = ultimaAlerta();
      expect(confirmacion.header).toBe('Recargar sin sus cambios');
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(1);
      await pulsar(confirmacion, 'Recargar');
      tick();

      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2);
      expect(component.pedido.Lineas[0].Cantidad).toBe(1);
      expect(component.pedidoParaGuardar().Version).toBe('v2');
    }));

    it('«Recargar conservando mis cambios» pone lo del vendedor encima de lo que guardó el otro, sin preguntar si no chocan', fakeAsync(async () => {
      const aviso = await guardarConElPedidoCambiado(() => {
        component.pedido.Lineas[0].Cantidad = 4;
        component.pedido.Lineas.push(lineaNueva());
        component.pedido.comentarios = 'Llamar antes';
      }, pedidoBase({ Version: 'v2', formaPago: 'EFC' }));

      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();

      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2);
      expect(alertas.filter(a => a.header === 'Los dos han cambiado lo mismo').length).toBe(0);
      expect(ultimaAlerta().header).toBe('Recargar el pedido');
      expect(ultimaAlerta().message).toBe('Se ha recargado el pedido con sus cambios encima. Revíselo y guárdelo.');
      const guardar = component.pedidoParaGuardar();
      expect(guardar.Version).toBe('v2');
      expect(guardar.formaPago).toBe('EFC'); // lo del otro
      expect(guardar.comentarios).toBe('Llamar antes'); // lo mío
      expect(guardar.Lineas.map((l: any) => [l.id, l.Producto, l.Cantidad])).toEqual([[1, 'A', 4], [0, 'B', 2]]);
      expect(component.pedido.Lineas.every(l => l instanceof LineaVenta)).toBeTrue();
    }));

    it('tras recargar conservando, los cambios siguen contando como sin guardar (y como líneas añadidas para la campaña)', fakeAsync(async () => {
      const aviso = await guardarConElPedidoCambiado(() => component.pedido.Lineas.push(lineaNueva()), pedidoBase({ Version: 'v2' }));
      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();
      campana.consultar.and.returnValue(of({ HayAviso: false }));
      servicio.modificarPedido.and.returnValue(of({ Version: 'v3' }));

      const guardando = component.guardarPreguntando();
      tick();
      await guardando;

      expect(campana.consultar).toHaveBeenCalled();
    }));

    it('sin cambios del vendedor recarga y lo dice', fakeAsync(async () => {
      const aviso = await guardarConElPedidoCambiado(() => { }, pedidoBase({ Version: 'v2', formaPago: 'EFC' }));
      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();

      expect(ultimaAlerta().message).toBe('Se ha recargado el pedido. No tenía cambios sin guardar.');
      expect(component.pedido.formaPago).toBe('EFC');
    }));

    it('si los dos han cambiado lo mismo pregunta con cuál se queda, nombrando a quien lo cambió', fakeAsync(async () => {
      const enElServidor = pedidoBase({ Version: 'v2' });
      enElServidor.Lineas[0].Cantidad = 7;
      const aviso = await guardarConElPedidoCambiado(() => component.pedido.Lineas[0].Cantidad = 4, enElServidor);

      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();
      const pregunta = ultimaAlerta();
      expect(pregunta.header).toBe('Los dos han cambiado lo mismo');
      expect(pregunta.message).toBe('Aida cambió la cantidad de la línea 1 (A) a 7 y usted a 4: ¿con cuál se queda?');
      expect(pregunta.buttons.map((b: any) => b.text)).toEqual(['Con 4 (el mío)', 'Con 7', 'Cancelar']);
      await pulsar(pregunta, 'Con 4 (el mío)');
      tick();

      expect(component.pedido.Lineas[0].Cantidad).toBe(4);
      expect(component.pedidoParaGuardar().Version).toBe('v2');
    }));

    it('si elige lo del otro se queda lo guardado', fakeAsync(async () => {
      const enElServidor = pedidoBase({ Version: 'v2' });
      enElServidor.Lineas[0].Cantidad = 7;
      const aviso = await guardarConElPedidoCambiado(() => component.pedido.Lineas[0].Cantidad = 4, enElServidor);
      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();
      await pulsar(ultimaAlerta(), 'Con 7');
      tick();

      expect(component.pedido.Lineas[0].Cantidad).toBe(7);
    }));

    it('«Cancelar» en una pregunta deja la pantalla como estaba', fakeAsync(async () => {
      const enElServidor = pedidoBase({ Version: 'v2', formaPago: 'EFC' });
      enElServidor.Lineas[0].Cantidad = 7;
      const aviso = await guardarConElPedidoCambiado(() => component.pedido.Lineas[0].Cantidad = 4, enElServidor);
      await pulsar(aviso, 'Recargar conservando mis cambios');
      tick();
      await pulsar(ultimaAlerta(), 'Cancelar');
      tick();

      expect(ultimaAlerta().message).toBe('No se ha recargado nada: el pedido sigue como lo tenía.');
      expect(component.pedido.Lineas[0].Cantidad).toBe(4);
      expect(component.pedido.formaPago).toBe('TRN');
      expect(component.pedidoParaGuardar().Version).toBe('v1');
    }));

    it('recargar no cambia las fechas de las líneas: cada una conserva la suya', fakeAsync(() => {
      const conDosFechas = pedidoBase();
      conDosFechas.Lineas.push({ id: 2, estado: -1, picking: 0, tipoLinea: 1, Producto: 'B', Cantidad: 1, fechaEntrega: '2026-11-05T00:00:00' });
      servicio.cargarPedido.and.returnValue(of(conDosFechas));
      component.cargarPedido('1', 929057);
      tick();
      servicio.cargarPedido.and.returnValue(of(JSON.parse(JSON.stringify(conDosFechas))));
      component.cargarPedido('1', 929057);
      tick();

      expect(component.pedido.Lineas.map(l => l.fechaEntrega)).toEqual(['2026-10-28T00:00:00', '2026-11-05T00:00:00']);
    }));
  });

  describe('campaña «solo en stock» al modificar (#293)', () => {
    const aviso = { HayAviso: true, Campana: 'Black Friday',
      Mensaje: 'El descuento de Black Friday del 45929 (CREMA) es solo para lo que haya en stock: hoy hay 2 de 5.', Productos: [] };
    const anadirLinea = () => component.pedido.Lineas.push(new LineaVenta({ id: 0, estado: -1, picking: 0, tipoLinea: 1, Producto: '45929', Cantidad: 5 } as any));

    it('sin líneas nuevas ni más cantidad no se consulta ni se manda la elección', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();

      const guardando = component.guardarPreguntando();
      tick();
      await guardando;

      expect(campana.consultar).not.toHaveBeenCalled();
      expect('CampanaSoloEnStock' in servicio.modificarPedido.calls.mostRecent().args[0]).toBeFalse();
    }));

    it('al añadir una línea pregunta y «Sí» manda QuitarDescuento', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      anadirLinea();
      campana.consultar.and.returnValue(of(aviso));

      component.guardarPreguntando();
      tick();
      const pregunta = ultimaAlerta();
      expect(pregunta.header).toBe('Oferta solo para lo que hay en stock');
      expect(pregunta.message).toContain('hoy hay 2 de 5.');
      expect(pregunta.message).toContain('¿Quitar el descuento de la campaña a lo que no hay en stock?');
      expect(servicio.modificarPedido).not.toHaveBeenCalled();
      await pulsar(pregunta, 'Sí');
      tick();

      expect(servicio.modificarPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('QuitarDescuento');
    }));

    it('«No» manda MantenerDescuento', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      component.pedido.Lineas[0].Cantidad = 3; // sube la cantidad de una que ya estaba
      campana.consultar.and.returnValue(of(aviso));

      component.guardarPreguntando();
      tick();
      await pulsar(ultimaAlerta(), 'No');
      tick();

      expect(servicio.modificarPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('MantenerDescuento');
    }));

    it('si la API dice que no hay aviso se guarda como siempre', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      anadirLinea();

      const guardando = component.guardarPreguntando();
      tick();
      await guardando;

      expect(campana.consultar).toHaveBeenCalledTimes(1);
      expect('CampanaSoloEnStock' in servicio.modificarPedido.calls.mostRecent().args[0]).toBeFalse();
    }));

    it('tras guardar enseña lo que ha hecho la API con la campaña y se olvida de la elección', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      anadirLinea();
      campana.consultar.and.returnValue(of(aviso));
      servicio.modificarPedido.and.returnValue(of({ Avisos: [
        { Tipo: 'CampanaSoloEnStockAplicado', Mensaje: 'Se ha quitado el descuento de Black Friday a 3 unidades del 45929.' },
        { Tipo: 'OtroQueLaAppNoConoce', Mensaje: 'no se enseña' }] }));

      component.guardarPreguntando();
      tick();
      await pulsar(ultimaAlerta(), 'Sí');
      tick();

      const modificado = alertas.find(a => a.header === 'Modificado');
      expect(modificado.message).toContain('Se ha quitado el descuento de Black Friday a 3 unidades del 45929.');
      expect(modificado.message).not.toContain('no se enseña');
      expect(servicio.cargarPedido).toHaveBeenCalledTimes(2); // la API ha partido líneas: se vuelve a leer
      expect('CampanaSoloEnStock' in component.pedidoParaGuardar()).toBeFalse();
    }));
  });

  describe('añadir productos a un pedido en preparación (#287)', () => {
    const errorEnPreparacion = (opciones: string[]) => ({
      statusCode: 409,
      apiError: { error: { code: 'PEDIDO_EN_PREPARACION', timestamp: '',
        message: 'El pedido 929057 ya está en preparación (picking 55) y sale hoy. Haga un pedido nuevo con lo que quiera añadir o, desde Nesto, pida a Almacén que lo meta en el mismo envío.',
        details: { empresa: '1', pedido: 929057, Pickings: [55], Envio: null, AgenciaYaLoTiene: false, Opciones: opciones, Productos: ['45929'] } } }
    });

    it('«Pedir a Almacén» solo se ofrece si viene en Opciones', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      servicio.modificarPedido.and.returnValue(throwError(() => errorEnPreparacion(['PedidoNuevo'])));

      const enviando = component.enviarModificacion(false);
      tick();
      await enviando.catch(() => { });
      tick();

      const pregunta = ultimaAlerta();
      expect(pregunta.header).toBe('El pedido ya está en preparación');
      expect(pregunta.buttons.map((b: any) => b.text)).toEqual(['Hacer un pedido nuevo con lo añadido', 'Cancelar']);
    }));

    it('con la elección repite el PUT con AmpliacionEnPreparacion y ofrece abrir el pedido nuevo', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      servicio.modificarPedido.and.returnValues(
        throwError(() => errorEnPreparacion(['PedidoNuevo', 'PedirAlmacen'])),
        of({ PedidoNuevo: 931050, Avisos: [{ Tipo: 'AmpliacionEnPedidoNuevo', Mensaje: 'Lo añadido va en el pedido nuevo 931050.', Datos: { PedidoNuevo: 931050, Pedido: 929057 } }] }));

      component.enviarModificacion(false);
      tick();
      const pregunta = ultimaAlerta();
      expect(pregunta.buttons.map((b: any) => b.text)).toContain('Pedir a Almacén que lo meta en el envío de hoy');
      await pulsar(pregunta, 'Hacer un pedido nuevo con lo añadido');
      tick();

      expect(servicio.modificarPedido).toHaveBeenCalledTimes(2);
      expect(servicio.modificarPedido.calls.argsFor(1)[0].AmpliacionEnPreparacion).toBe('PedidoNuevo');
      const modificado = alertas.find(a => a.header === 'Modificado');
      expect(modificado.message).toContain('Lo añadido va en el pedido nuevo 931050.');
      expect(modificado.buttons.some((b: any) => b.text === 'Abrir el pedido 931050')).toBeTrue();
      expect('AmpliacionEnPreparacion' in component.pedidoParaGuardar()).toBeFalse();
    }));

    it('«Cancelar» no vuelve a enviar nada', fakeAsync(async () => {
      component.cargarPedido('1', 929057);
      tick();
      servicio.modificarPedido.and.returnValue(throwError(() => errorEnPreparacion(['PedidoNuevo'])));

      component.enviarModificacion(false);
      tick();
      await pulsar(ultimaAlerta(), 'Cancelar');
      tick();

      expect(servicio.modificarPedido).toHaveBeenCalledTimes(1);
      expect(alertas.filter(a => a.header === 'Error').length).toBe(0);
    }));
  });

  describe('modo 6, «Junto con lo pendiente del cliente» (#287)', () => {
    const conModo6 = () => {
      const o: any = opciones(true, false);
      o.Servicio.Modos = [
        { Modo: 1, Nombre: 'Todo junto', Permitido: true, Motivo: null },
        { Modo: 6, Nombre: 'Junto con lo pendiente del cliente', Permitido: true, Motivo: null,
          Explicacion: 'Saldrá junto con la nota de entrega 929701.', PedidosConLosQueSeJunta: [929701] }];
      return o;
    };

    it('no se ofrece si la API no lo trae', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(component.listaModosServicioSelector.some(m => m.codigo === 6)).toBeFalse();
    }));

    it('se ofrece cuando viene, y al elegirlo se manda modoServicio 6 con servirJunto y se enseña su explicación', fakeAsync(() => {
      plantilla.opcionesModos.and.returnValue(of(conModo6()));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.listaModosServicioSelector.some(m => m.codigo === 6)).toBeTrue();
      expect(component.explicacionJuntoConLoPendiente).toBe('');

      component.cambiarModoServicio(6);
      tick();

      const guardado = component.pedidoParaGuardar();
      expect(guardado.modoServicio).toBe(6);
      expect(guardado.servirJunto).toBeTrue();
      expect(component.explicacionJuntoConLoPendiente).toBe('Saldrá junto con la nota de entrega 929701.');
    }));

    it('un pedido guardado en 6 lo enseña como tal', fakeAsync(() => {
      servicio.cargarPedido.and.returnValue(of(pedidoBase({ modoServicio: 6, servirJunto: true })));
      component.cargarPedido('1', 929057);
      tick();
      expect(component.modoServicioPedido).toBe(6);
      expect(component.listaModosServicioSelector.some(m => m.codigo === 6)).toBeTrue();
    }));
  });

  describe('¿Dónde está lo que falta? (#289)', () => {
    it('no se pide al cargar el pedido, solo al abrir la sección', fakeAsync(() => {
      component.cargarPedido('1', 929057);
      tick();
      expect(dondeEsta.leer).not.toHaveBeenCalled();

      component.alternarDondeEstaLoQueFalta();
      tick();

      expect(dondeEsta.leer).toHaveBeenCalledOnceWith('1', 929057);
      expect(component.verDondeEstaLoQueFalta).toBeTrue();
      expect(component.frasesDondeEstaLoQueFalta).toEqual(['Todo está en Algete']);
    }));

    it('una línea por producto con el texto de la API, y al cerrar no vuelve a preguntar', fakeAsync(() => {
      const texto = '43818 MULTIVIT GLOW CREMA RICA (1 ud.): viene en la reposición 81463 de Alcobendas; pendiente de recibir en Algete.';
      dondeEsta.leer.and.returnValue(of({ Empresa: '1', Pedido: 929057, TodoEnAlgete: false, Mensaje: null,
        Productos: [{ Producto: '43818', Nombre: 'MULTIVIT', Unidades: 1, Texto: texto, Situaciones: [] }] }));
      component.cargarPedido('1', 929057);
      tick();

      component.alternarDondeEstaLoQueFalta();
      tick();
      expect(component.frasesDondeEstaLoQueFalta).toEqual([texto]);

      component.alternarDondeEstaLoQueFalta();
      expect(component.verDondeEstaLoQueFalta).toBeFalse();
      expect(dondeEsta.leer).toHaveBeenCalledTimes(1);
    }));

    it('si la consulta falla lo dice sin romper la pantalla', fakeAsync(() => {
      dondeEsta.leer.and.returnValue(throwError(() => ({ statusCode: 500 })));
      component.cargarPedido('1', 929057);
      tick();

      component.alternarDondeEstaLoQueFalta();
      tick();

      expect(component.errorDondeEstaLoQueFalta).toContain('No se ha podido consultar');
      expect(component.cargandoDondeEstaLoQueFalta).toBeFalse();
    }));
  });
});

/** NestoApp#261 (NestoAPI#737): el pedido por WhatsApp con enlace de descarga. */
describe('PedidoVentaComponent: enviar por WhatsApp (#261)', () => {
  let component: PedidoVentaComponent;
  let whatsapp: any;

  beforeEach(waitForAsync(() => {
    whatsapp = { enviarDocumento: jasmine.createSpy('enviarDocumento').and.returnValue(Promise.resolve(true)) };
    TestBed.configureTestingModule({
      declarations: [PedidoVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: EnvioWhatsAppService, useValue: whatsapp },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    component = TestBed.createComponent(PedidoVentaComponent).componentInstance;
  }));

  it('pasa por el servicio con la empresa y el número del pedido', () => {
    component.pedido = { empresa: '1', numero: 929498 } as any;
    component.enviarPorWhatsApp();
    expect(whatsapp.enviarDocumento).toHaveBeenCalledWith('Pedido', '1', 929498);
  });

  it('sin pedido cargado no hace nada', () => {
    component.pedido = null as any;
    component.enviarPorWhatsApp();
    expect(whatsapp.enviarDocumento).not.toHaveBeenCalled();
  });

  describe('envío devuelto o con incidencia (#273)', () => {
    it('solo los devueltos (4) y los incidentados (3) ofrecen contestar', () => {
      expect(component.esperaRespuestaDevolucion({ Numero: 1, Estado: 4 })).toBeTrue();
      expect(component.esperaRespuestaDevolucion({ Numero: 1, Estado: 3 })).toBeTrue();
      expect(component.esperaRespuestaDevolucion({ Numero: 1, Estado: 2 })).toBeFalse();
      expect(component.esperaRespuestaDevolucion({ Numero: 1, Estado: 5 })).toBeFalse();
    });

    it('«Contestar» abre la pantalla de decisión de ese envío', () => {
      const nav = (component as any).nav;
      spyOn(nav, 'navigateForward');
      component.pedido = { empresa: '1', numero: 929498 } as any;

      component.contestarDevolucion({ Numero: 123, Estado: 4 });

      expect(nav.navigateForward).toHaveBeenCalledWith('envio-devuelto', { queryParams: { empresa: '1', envio: 123 } });
    });
  });

  describe('recoge en tienda (#205)', () => {
    it('el interruptor solo sale si la API trae la marca', () => {
      component.pedido = { empresa: '1', numero: 929498, RecogeEnTienda: false } as any;
      expect(component.tieneRecogeEnTienda).toBeTrue();
      component.pedido = { empresa: '1', numero: 929498 } as any;
      expect(component.tieneRecogeEnTienda).toBeFalse();
      component.pedido = null as any;
      expect(component.tieneRecogeEnTienda).toBeFalse();
    });
  });
});
