import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule, LoadingController } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Storage } from '@ionic/storage-angular';
import { of, throwError } from 'rxjs';
import { Usuario } from 'src/app/models/Usuario';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { PlantillaVentaComponent } from './plantilla-venta.component';
import { PlantillaVentaService } from './plantilla-venta.service';
import { BorradorPlantillaVentaService } from 'src/app/services/borrador-plantilla-venta.service';
import { PagoAPlazosService } from 'src/app/services/pago-a-plazos.service';
import { AutorizacionesPedidoService } from 'src/app/services/autorizaciones-pedido.service';
import { EventosService } from '../inscribir-evento/eventos.service';

/**
 * Tanda 2.30.0 en la plantilla de venta: #293 (campaña «solo en stock», NestoAPI#889), #280 / #290.5 (pedir autorización
 * de un pedido que no pasa la validación, Novedades 1258) y #290.4 (formación sin evento, incidencia 1398).
 */
describe('PlantillaVentaComponent: tanda 2.30.0 (#293 #280 #290)', () => {
  let component: PlantillaVentaComponent;
  let fixture: ComponentFixture<PlantillaVentaComponent>;
  let servicio: any;
  let autorizaciones: any;
  let alertas: any[];

  const ultimaAlerta = () => alertas[alertas.length - 1];
  const pulsar = async (alerta: any, texto: string, datos?: any) => {
    const boton = alerta.buttons.find((b: any) => b.text === texto);
    if (boton?.handler) { await boton.handler(datos); }
  };
  const avisoStock = {
    HayAviso: true, Campana: 'BLACK-FRIDAY-26',
    Mensaje: 'El descuento de Black Friday del 45929 (CREMA) es solo para lo que haya en stock: hoy hay 2 de 5.', Productos: []
  };
  const errorValidacion = () => ({
    isBusinessError: true, statusCode: 400,
    apiError: { error: { code: 'PEDIDO_VALIDACION_FALLO', message: 'La oferta del 38093 está caducada.' } }
  });

  beforeEach(waitForAsync(() => {
    alertas = [];
    servicio = {
      opcionesModos: () => of(null),
      modoFacturacionSugerido: () => of(null),
      modoServicioSugerido: () => of({ Modo: 4, Nombre: 'X', Motivo: '' }),
      ofertasSugeridas: () => of([]),
      validarServirJunto: () => of({ PuedeDesmarcar: true, ProductosProblematicos: [], Mensaje: null }),
      calcularFechaEntrega: () => of(new Date().toISOString()),
      cargarGruposBonificables: () => of([]),
      cargarProductosBonificables: () => of({ Productos: [] }),
      calcularPortes: () => of({}),
      leerCliente: () => of({}),
      sePuedeServirPorGlovo: () => of({ servirPorGlovo: false }),
      crearPedido: jasmine.createSpy('crearPedido').and.returnValue(of({ numero: 929100 })),
      modificarPedido: jasmine.createSpy('modificarPedido').and.returnValue(of({})),
      leerChequeRegalo: () => of(null),
      leerCupones: () => of([]),
      leerSustitucion: () => of(null),
      fechaEntregaAgencia: () => of(null),
      leerSuPedidoObligatorio: () => of(false),
      avisoCondicionesCampana: jasmine.createSpy('avisoCondicionesCampana').and.returnValue(of({ Avisar: false })),
      avisoCampanaSoloEnStock: jasmine.createSpy('avisoCampanaSoloEnStock').and.returnValue(of({ HayAviso: false }))
    };
    autorizaciones = {
      pedir: jasmine.createSpy('pedir').and.returnValue(of({ Id: 12, Estado: 'Pendiente', Destinatarios: ['Ana', 'Luis'] }))
    };

    TestBed.configureTestingModule({
      declarations: [PlantillaVentaComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: PagoAPlazosService, useValue: { disponible: () => of(null), ofrecer: () => Promise.resolve(false) } },
        Usuario,
        { provide: PlantillaVentaService, useValue: servicio },
        { provide: AutorizacionesPedidoService, useValue: autorizaciones },
        { provide: EventosService, useValue: { leerEventosPorProducto: () => of([]) } },
        { provide: BorradorPlantillaVentaService, useValue: { generarId: () => 'nuevo-id' } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: Storage, useValue: {} },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }); } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaVentaComponent);
    component = fixture.componentInstance;
    component.clienteSeleccionado = { empresa: '1', cliente: '15191', contacto: '0', cifNif: 'B1' };
    component['_direccionSeleccionada'] = { contacto: '0', iva: 'G21', servirJunto: false, periodoFacturacion: 'NRM', plazosPago: 'CONTADO', mantenerJunto: false };
    component['plazosPago'] = 'CONTADO';
    component['formaPago'] = 'TRN';
    component['modoServicioSeleccionado'] = 3;
    component['productosResumen'] = [{ producto: '38093', texto: 'CREMA', grupo: 'COS', cantidad: 2, precio: 100, descuento: 0, iva: 'G21', cantidadOferta: 0 }];
    spyOn<any>(component, 'reinicializar');
    spyOn<any>(component, 'detectarOfertasSinBeneficio').and.returnValue([]);
    spyOn<any>(component, 'esTarjetaPrepago').and.returnValue(false);
    spyOn<any>(component, 'ofrecerGuardarBorrador');
  }));

  describe('campaña «solo en stock» antes de crear (#293, NestoAPI#889)', () => {
    it('al crear se consulta siempre con el pedido tal como va; sin aviso no se pregunta ni viaja la elección', fakeAsync(() => {
      component.crearPedido();
      tick();

      expect(servicio.avisoCampanaSoloEnStock).toHaveBeenCalledTimes(1);
      expect(servicio.avisoCampanaSoloEnStock.calls.mostRecent().args[0].cliente).toBe('15191');
      expect(alertas.some(a => a.header === 'Oferta solo para lo que hay en stock')).toBeFalse();
      expect(servicio.crearPedido).toHaveBeenCalled();
      expect('CampanaSoloEnStock' in servicio.crearPedido.calls.mostRecent().args[0]).toBeFalse();
    }));

    it('con aviso se pregunta antes de guardar; «Sí» quita el descuento a lo que no hay', fakeAsync(() => {
      servicio.avisoCampanaSoloEnStock.and.returnValue(of(avisoStock));

      component.crearPedido();
      tick();

      const pregunta = ultimaAlerta();
      expect(pregunta.header).toBe('Oferta solo para lo que hay en stock');
      expect(pregunta.message).toContain('hoy hay 2 de 5.\n\n¿Quitar el descuento de la campaña a lo que no hay en stock?');
      expect(servicio.crearPedido).not.toHaveBeenCalled();

      pulsar(pregunta, 'Sí');
      tick();

      expect(servicio.crearPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('QuitarDescuento');
    }));

    it('«No» lo manda todo con descuento', fakeAsync(() => {
      servicio.avisoCampanaSoloEnStock.and.returnValue(of(avisoStock));

      component.crearPedido();
      tick();
      pulsar(ultimaAlerta(), 'No');
      tick();

      expect(servicio.crearPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('MantenerDescuento');
    }));

    it('va después de la pregunta del contado si saltan las dos', fakeAsync(() => {
      component['plazosPago'] = '1/30';
      component['formaPago'] = 'RCB';
      servicio.avisoCondicionesCampana.and.returnValue(of({ Avisar: true, Mensaje: '¿Cambiar a contado?', PlazosPagoPropuestos: 'CONTADO', Campana: 'BF', Productos: ['38093'] }));
      servicio.avisoCampanaSoloEnStock.and.returnValue(of(avisoStock));

      component.crearPedido();
      tick();
      expect(ultimaAlerta().header).toBe('Pago al contado');
      expect(servicio.avisoCampanaSoloEnStock).not.toHaveBeenCalled();

      pulsar(ultimaAlerta(), 'Sí');
      tick();
      expect(ultimaAlerta().header).toBe('Oferta solo para lo que hay en stock');
      // La consulta del stock ya va con los plazos al contado
      expect(servicio.avisoCampanaSoloEnStock.calls.mostRecent().args[0].plazosPago).toBe('CONTADO');
    }));

    it('si la consulta falla, se crea como siempre', fakeAsync(() => {
      servicio.avisoCampanaSoloEnStock.and.returnValue(throwError(() => ({ status: 404 })));

      component.crearPedido();
      tick();

      expect(servicio.crearPedido).toHaveBeenCalled();
      expect('CampanaSoloEnStock' in servicio.crearPedido.calls.mostRecent().args[0]).toBeFalse();
    }));

    it('la elección se respeta al «crear sin validar» y se olvida en el guardado siguiente', fakeAsync(() => {
      TestBed.inject(Usuario).permitirCrearPedidoConErroresValidacion = true;
      servicio.avisoCampanaSoloEnStock.and.returnValue(of(avisoStock));
      servicio.crearPedido.and.returnValue(throwError(() => errorValidacion()));

      component.crearPedido();
      tick();
      pulsar(ultimaAlerta(), 'Sí');
      tick();
      expect(ultimaAlerta().header).toBe('Error de Validación');

      servicio.crearPedido.and.returnValue(of({ numero: 929100 }));
      pulsar(ultimaAlerta(), 'Crear sin validar');
      tick();
      expect(servicio.crearPedido.calls.mostRecent().args[1]).toBeTrue();
      expect(servicio.crearPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('QuitarDescuento');

      // Otro guardado: se vuelve a consultar y, sin aviso, ya no viaja nada
      servicio.avisoCampanaSoloEnStock.and.returnValue(of({ HayAviso: false }));
      component.crearPedido();
      tick();
      expect('CampanaSoloEnStock' in servicio.crearPedido.calls.mostRecent().args[0]).toBeFalse();
    }));

    it('al crear sin validar también se enseñan los avisos de la grabación', fakeAsync(() => {
      servicio.crearPedido.and.returnValue(of({ numero: 929100, AvisosGrabacion: [{ Tipo: 'CampanaSoloEnStockAplicado', Mensaje: 'Se ha quitado el descuento a 3 unidades del 45929.' }] }));

      component['crearPedidoForzado']();
      tick();

      expect(alertas.find(a => a.header === 'Ojo con este pedido')?.message).toContain('Se ha quitado el descuento');
    }));

    it('al modificar solo se consulta si el guardado añade producto o sube una cantidad', fakeAsync(() => {
      component.pedidoEnEdicionNumero = 929000;
      component['edicionMetaLineas'].set('38093', { idLineaPago: 55, idLineaOferta: null, pagoTienePicking: false, ofertaTienePicking: false });
      component['lineasAlCargarEdicion'] = [{ id: 55, producto: '38093', Cantidad: 2, tipoLinea: 1 }];

      component.crearPedido();
      tick();
      expect(servicio.avisoCampanaSoloEnStock).not.toHaveBeenCalled();
      expect(servicio.modificarPedido).toHaveBeenCalledTimes(1);

      component['productosResumen'][0].cantidad = 3;
      servicio.avisoCampanaSoloEnStock.and.returnValue(of(avisoStock));
      component.crearPedido();
      tick();
      expect(servicio.avisoCampanaSoloEnStock).toHaveBeenCalledTimes(1);
      pulsar(ultimaAlerta(), 'Sí');
      tick();
      expect(servicio.modificarPedido.calls.mostRecent().args[0].CampanaSoloEnStock).toBe('QuitarDescuento');
    }));
  });

  describe('pedir autorización de un pedido que no pasa la validación (#280, #290; Novedades 1258)', () => {
    beforeEach(() => {
      servicio.crearPedido.and.returnValue(throwError(() => errorValidacion()));
    });

    it('quien no puede crearlo sin validar ve «Pedido no válido» con «Pedir autorización»', fakeAsync(() => {
      const pedir = spyOn(component, 'pedirAutorizacionPedido').and.returnValue(Promise.resolve());

      component.crearPedido();
      tick();

      const aviso = ultimaAlerta();
      expect(aviso.header).toBe('Pedido no válido');
      expect(aviso.message).toContain('La oferta del 38093 está caducada.');
      expect(aviso.message).toContain('Puede pedir autorización a quien puede darla');
      pulsar(aviso, 'Pedir autorización');
      expect(pedir).toHaveBeenCalled();
    }));

    it('«Cerrar» sigue ofreciendo guardar el borrador', fakeAsync(() => {
      component.crearPedido();
      tick();
      pulsar(ultimaAlerta(), 'Cerrar');
      tick();
      expect(component['ofrecerGuardarBorrador']).toHaveBeenCalled();
    }));

    it('quien sí puede sigue viendo «Crear sin validar»', fakeAsync(() => {
      TestBed.inject(Usuario).permitirCrearPedidoConErroresValidacion = true;

      component.crearPedido();
      tick();

      expect(ultimaAlerta().header).toBe('Error de Validación');
      expect(alertas.some(a => a.header === 'Pedido no válido')).toBeFalse();
    }));

    it('un error que no es de validación se enseña como siempre', fakeAsync(() => {
      servicio.crearPedido.and.returnValue(throwError(() => ({ isBusinessError: true, apiError: { error: { code: 'PEDIDO_SIN_LINEAS', message: 'El cliente está bloqueado.' } } })));

      component.crearPedido();
      tick();

      expect(alertas.some(a => a.header === 'Pedido no válido')).toBeFalse();
      expect(ultimaAlerta().header).toBe('Error');
    }));

    it('se pide el comentario (opcional, 500 como mucho) y se manda el pedido tal cual', fakeAsync(() => {
      component.pedirAutorizacionPedido();
      tick();
      const dialogo = ultimaAlerta();
      expect(dialogo.header).toBe('Pedir autorización');
      expect(dialogo.buttons[1].handler({ comentario: 'x'.repeat(501) })).toBeFalse();
      expect(autorizaciones.pedir).not.toHaveBeenCalled();

      expect(dialogo.buttons[1].handler({ comentario: ' lo hablé con el cliente ' })).toBeTrue();
      tick();

      expect(autorizaciones.pedir).toHaveBeenCalledTimes(1);
      const [pedido, comentario] = autorizaciones.pedir.calls.mostRecent().args;
      expect(pedido.cliente).toBe('15191');
      expect(pedido.Lineas.length).toBe(1);
      expect(comentario).toBe('lo hablé con el cliente');
      expect(ultimaAlerta().message).toBe('Se ha pedido autorización a Ana y Luis. Le avisaremos cuando contesten.');
      expect(component['reinicializar']).not.toHaveBeenCalled(); // como Nesto: la plantilla se queda como estaba
    }));

    it('cancelar el comentario no pide nada', fakeAsync(() => {
      component.pedirAutorizacionPedido();
      tick();
      pulsar(ultimaAlerta(), 'Cancelar');
      tick();
      expect(autorizaciones.pedir).not.toHaveBeenCalled();
    }));

    it('si ya la había pedido (409 YA_SOLICITADA) se dice que sigue pendiente', fakeAsync(() => {
      autorizaciones.pedir.and.returnValue(throwError(() => ({
        statusCode: 409, originalError: { error: { Message: 'Ya pidió la autorización…', Codigo: 'YA_SOLICITADA', Id: 12 } }
      })));

      component.enviarAutorizacionPedido('');
      tick();

      expect(ultimaAlerta().message).toBe('Ya había pedido esta autorización; sigue pendiente.');
      expect(ultimaAlerta().buttons.some((b: any) => b.text === 'Ver mis solicitudes')).toBeTrue();
    }));

    it('el 400 de «no necesita autorización» se enseña tal cual', fakeAsync(() => {
      autorizaciones.pedir.and.returnValue(throwError(() => ({
        statusCode: 400, originalError: { error: { Message: 'Este pedido no necesita autorización: puede guardarlo.' } }
      })));

      component.enviarAutorizacionPedido('');
      tick();

      expect(ultimaAlerta().message).toBe('Este pedido no necesita autorización: puede guardarlo.');
      expect(ultimaAlerta().buttons).toEqual(['Ok']);
    }));
  });

  describe('formación sin evento (#290, incidencia 1398)', () => {
    const formacion = () => ({ producto: '90324', texto: 'PRÁCTICAS DE ESTÉTICA', grupo: 'CUR', EsFormacion: true, EsCurso: false, cantidad: 1, precio: 50, descuento: 0, cantidadOferta: 0 });

    it('se abre como un producto normal: no se pide evento ni modalidad', () => {
      const elegirEvento = spyOn(component, 'elegirEventoCurso');
      const selector = { abrirDetalle: jasmine.createSpy('abrirDetalle') };
      component['_selectorPlantillaVenta'] = selector as any;

      component.abrirDetalle(formacion(), 'ALG');

      expect(elegirEvento).not.toHaveBeenCalled();
      expect(selector.abrirDetalle).toHaveBeenCalled();
    });

    it('no cuenta como curso (ni correo de cursos ni aviso de prepago) y se avisa de que va aparte si hay productos', () => {
      component['productosResumen'] = [component['productosResumen'][0], formacion()];
      expect(component.hayCursosEnPedido).toBeFalse();
      expect(component.hayFormacionAparte).toBeTrue();

      component['productosResumen'] = [formacion()];
      expect(component.hayFormacionAparte).toBeFalse(); // solo formación: un único pedido, como siempre
    });

    it('al crear, si la API la separó, se dice el pedido de la formación', fakeAsync(() => {
      servicio.crearPedido.and.returnValue(of({ numero: 929100, PedidosAdicionales: [{ Numero: 929101, Motivo: 'Formación' }] }));

      component.crearPedido();
      tick();

      expect(alertas.find(a => a.header === 'Creado')?.message)
        .toContain('Se han creado dos pedidos: 929100 (productos) y 929101 (formación). La formación se factura aparte.');
    }));
  });
});
