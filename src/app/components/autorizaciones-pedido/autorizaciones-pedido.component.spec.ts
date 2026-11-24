import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AutorizacionesPedidoComponent } from './autorizaciones-pedido.component';
import { AutorizacionesPedidoService } from 'src/app/services/autorizaciones-pedido.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';
import { Usuario } from 'src/app/models/Usuario';

describe('AutorizacionesPedidoComponent (#280, #290; Novedades 1258)', () => {
  let component: AutorizacionesPedidoComponent;
  let fixture: ComponentFixture<AutorizacionesPedidoComponent>;
  let servicio: any;
  let params: BehaviorSubject<any>;
  let alertas: any[];
  let usuario: any;
  let nav: any;

  const solicitud = (extra: any = {}) => ({
    Id: 12, Estado: 'Pendiente', Empresa: '1', Cliente: '15191', Contacto: '0', NombreCliente: 'LOLA', Solicitante: 'NUEVAVISION\\Ana',
    NombreSolicitante: 'Ana', FechaSolicitud: '2026-11-19T09:00:00', Importe: 100, NumeroLineas: 1, Motivos: ['Oferta caducada'],
    Errores: [{ Producto: '45929', Motivo: 'Oferta caducada' }], ...extra
  });
  const ultimaAlerta = () => alertas[alertas.length - 1];
  const esperar = async () => { await fixture.whenStable(); await new Promise(r => setTimeout(r)); };

  const montar = (permiso: boolean, parametros: any = {}) => {
    alertas = [];
    params = new BehaviorSubject<any>(parametros);
    usuario = { nombre: 'Ana', permitirCrearPedidoConErroresValidacion: permiso };
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    TestBed.configureTestingModule({
      declarations: [AutorizacionesPedidoComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: params } },
        { provide: AutorizacionesPedidoService, useValue: servicio },
        { provide: Usuario, useValue: usuario },
        { provide: NavController, useValue: nav },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: ToastController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AutorizacionesPedidoComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    servicio = {
      leer: jasmine.createSpy('leer').and.returnValue(of([solicitud()])),
      leerUna: jasmine.createSpy('leerUna').and.returnValue(of(solicitud({
        Pedido: { Lineas: [{ Producto: '45929', texto: 'CREMA', Cantidad: 5, PrecioUnitario: 10, DescuentoLinea: 0.3 }, { Producto: '1', texto: 'OTRA', Cantidad: 1, PrecioUnitario: 2 }] }
      }))),
      autorizar: jasmine.createSpy('autorizar').and.returnValue(of({ Id: 12, Estado: 'Autorizada', Pedido: 931500 })),
      denegar: jasmine.createSpy('denegar').and.returnValue(of({ Id: 12, Estado: 'Denegada' })),
      anular: jasmine.createSpy('anular').and.returnValue(of({ Id: 12, Estado: 'Anulada' }))
    };
  });

  it('quien no autoriza ve solo las suyas pendientes y puede anularlas', waitForAsync(async () => {
    montar(false);
    await esperar();
    expect(servicio.leer).toHaveBeenCalledWith(true, true);
    expect(component.solicitudes.length).toBe(1);
    expect(component.puedeAnular(component.solicitudes[0])).toBeTrue();
    expect(component.puedeAutorizarEsta(component.solicitudes[0])).toBeFalse();
    expect(component.resumen).toBe('1 pendiente');
  }));

  it('quien puede autorizar pide también las de los demás; solo anula las suyas', waitForAsync(async () => {
    servicio.leer.and.returnValue(of([solicitud(), solicitud({ Id: 13, Solicitante: 'NUEVAVISION\\Luis', NombreSolicitante: 'Luis' })]));
    montar(true);
    await esperar();
    expect(servicio.leer).toHaveBeenCalledWith(true, false);
    expect(component.puedeAutorizarEsta(component.solicitudes[1])).toBeTrue();
    expect(component.puedeAnular(component.solicitudes[0])).toBeTrue();
    expect(component.puedeAnular(component.solicitudes[1])).toBeFalse();
  }));

  it('«Ver también las resueltas» vuelve a leer sin el filtro de pendientes', waitForAsync(async () => {
    montar(false);
    await esperar();
    servicio.leer.and.returnValue(of([solicitud(), solicitud({ Id: 9, Estado: 'Denegada', MotivoResolucion: 'no' })]));
    component.cambiarVerResueltas(true);
    await esperar();
    expect(servicio.leer).toHaveBeenCalledWith(false, true);
    expect(component.solicitudes.length).toBe(2);
  }));

  it('al desplegar una, lee su pedido y marca las líneas que no pasan', waitForAsync(async () => {
    montar(false);
    await esperar();
    component.abrir(component.solicitudes[0]);
    expect(servicio.leerUna).toHaveBeenCalledWith(12);
    expect(component.lineas.length).toBe(2);
    expect(component.lineas[0].MotivoError).toBe('Oferta caducada');
    expect(component.lineas[1].MotivoError).toBeNull();
    component.abrir(component.solicitudes[0]);
    expect(component.abierta).toBeNull();
  }));

  it('la push de una denegada (?id=) la busca entre las resueltas, la despliega y dice el motivo', waitForAsync(async () => {
    servicio.leer.and.callFake((pendientes: boolean) => of(pendientes ? [] : [solicitud({
      Estado: 'Denegada', UsuarioResolucion: 'Carlos', FechaResolucion: '2026-11-19T10:15:00', MotivoResolucion: 'no toca'
    })]));
    montar(false, { id: '12' });
    await esperar();
    expect(servicio.leer).toHaveBeenCalledWith(false, true);
    expect(component.verResueltas).toBeTrue();
    expect(component.abierta).toBe(12);
    expect(ultimaAlerta().header).toBe('Autorización denegada');
    expect(ultimaAlerta().message).toContain('Denegada por Carlos el 19/11/2026 10:15: no toca.');
  }));

  it('si la de la push ya no está, se dice', waitForAsync(async () => {
    servicio.leer.and.returnValue(of([]));
    montar(false, { id: 99 });
    await esperar();
    expect(component.mensaje).toBe('La solicitud 99 ya no está en la lista.');
  }));

  it('autorizar crea el pedido y ofrece abrirlo', waitForAsync(async () => {
    montar(true);
    await esperar();
    await component.enviarAutorizacion(component.solicitudes[0], 'vale');
    expect(servicio.autorizar).toHaveBeenCalledWith(12, 'vale');
    expect(ultimaAlerta().message).toBe('Autorizada: se ha creado el pedido 931500. ¿Desea abrirlo?');
    ultimaAlerta().buttons[1].handler();
    expect(nav.navigateForward).toHaveBeenCalledWith('pedido-venta', { queryParams: { empresa: '1', numero: 931500 } });
  }));

  it('si el alta del pedido falla al autorizar, se enseña su error y se vuelve a leer', waitForAsync(async () => {
    montar(true);
    await esperar();
    servicio.autorizar.and.returnValue(throwError(() => ({ statusCode: 400, originalError: { error: { Message: 'El cliente está bloqueado.' } } })));
    servicio.leer.calls.reset();
    await component.enviarAutorizacion(component.solicitudes[0], '');
    expect(ultimaAlerta().header).toBe('No se ha podido autorizar');
    expect(ultimaAlerta().message).toBe('El cliente está bloqueado.');
    expect(servicio.leer).toHaveBeenCalled();
  }));

  it('denegar exige el motivo', waitForAsync(async () => {
    montar(true);
    await esperar();
    component.denegar(component.solicitudes[0]);
    await esperar();
    const dialogo = ultimaAlerta();
    expect(dialogo.header).toBe('Denegar la autorización');
    expect(dialogo.buttons[1].handler({ texto: '   ' })).toBeFalse();
    expect(servicio.denegar).not.toHaveBeenCalled();
    expect(dialogo.buttons[1].handler({ texto: ' no es de la promoción ' })).toBeTrue();
    await esperar();
    expect(servicio.denegar).toHaveBeenCalledWith(12, 'no es de la promoción');
  }));

  it('anular pregunta antes y luego borra la solicitud', waitForAsync(async () => {
    montar(false);
    await esperar();
    await component.anular(component.solicitudes[0]);
    expect(ultimaAlerta().header).toBe('Anular mi solicitud');
    await component.enviarAnulacion(component.solicitudes[0]);
    expect(servicio.anular).toHaveBeenCalledWith(12);
  }));

  it('sin la tabla en el servidor (503) dice que aún no está disponible', waitForAsync(async () => {
    servicio.leer.and.returnValue(throwError(() => ({ statusCode: 503, originalError: { error: { Message: 'falta la tabla' } } })));
    montar(false);
    await esperar();
    expect(component.mensaje).toBe('Las autorizaciones de pedidos todavía no están disponibles en el servidor.');
    expect(component.solicitudes).toEqual([]);
  }));

  it('abre el pedido creado de una autorizada', waitForAsync(async () => {
    montar(false);
    await esperar();
    component.abrirPedidoCreado(solicitud({ Estado: 'Autorizada', PedidoCreado: 931500, Empresa: '3  ' }) as any);
    expect(nav.navigateForward).toHaveBeenCalledWith('pedido-venta', { queryParams: { empresa: '3', numero: 931500 } });
  }));
});
