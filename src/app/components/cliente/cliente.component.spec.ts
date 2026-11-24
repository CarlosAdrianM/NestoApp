import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { Geolocation } from '../../services/geolocation.service';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { CacheService } from '../../services/cache.service';
import { Storage } from '@ionic/storage-angular';

import { ClienteComponent } from './cliente.component';
import { ClienteService } from './cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DireccionesService } from '../../services/direcciones.service';

describe('ClienteComponent', () => {
  let component: ClienteComponent;
  let fixture: ComponentFixture<ClienteComponent>;
  let servicio: any;
  let alertCreado: any;

  const clienteCreado = { Empresa: '1', 'Nº_Cliente': '12345', Contacto: '1' };

  beforeEach(waitForAsync(() => {
    alertCreado = null;
    servicio = {
      crearCliente: () => of(clienteCreado),
      copiarDatosDelPrincipal: jasmine.createSpy('copiarDatosDelPrincipal')
        .and.returnValue(of({ personasCopiadas: 2, cccsCopiados: 1, cccAsignado: '001' })),
      validarNif: () => of({}),
      validarDatosGenerales: () => of({}),
      validarDatosPago: () => of({}),
      modificarCliente: () => of({}),
      leerClienteCrear: () => of({}),
      leerOrigenes: () => of([{ Codigo: 'META-HARMONIA-0926', Descripcion: 'Lead de Meta · campaña Harmonia', Activo: true }]) // NestoApp#227
    };

    TestBed.configureTestingModule({
    declarations: [ClienteComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: ClienteService, useValue: servicio },
        { provide: AlertController, useValue: { create: (opciones: any) => { alertCreado = opciones; return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({}) }); } } },
        { provide: CacheService, useValue: { setDefaultTTL: () => { }, loadFromObservable: (k, obs) => obs } },
        { provide: Storage, useValue: {} },
        { provide: Geolocation, useValue: { getCurrentPosition: () => Promise.resolve({ coords: { latitude: 0, longitude: 0, accuracy: 0 } }) } },
        { provide: DireccionesService, useValue: { desdeCoordenadas: () => of(null) } },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ClienteComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // NestoApp#159 / NestoAPI#578: la dirección de la ubicación del móvil la da la API, no el plugin.
  describe('dirección a partir de la ubicación (#159)', () => {
    it('rellena calle, número y código postal con lo que devuelve la API', () => {
      const direcciones = TestBed.inject(DireccionesService) as any;
      direcciones.desdeCoordenadas = jasmine.createSpy('desdeCoordenadas').and.returnValue(of({ Calle: 'Calle Mayor', Numero: '3', CodigoPostal: '28840' }));
      component.cliente = { personasContacto: [] };

      component.getGeoencoder(40.56, -3.47);

      expect(direcciones.desdeCoordenadas).toHaveBeenCalledWith(40.56, -3.47);
      expect(component.cliente.codigoPostal).toBe('28840');
      expect(component.cliente.direccionCalleNumero).toBe('Calle Mayor 3');
    });

    it('si la API no encuentra la dirección, los campos se quedan como estaban', () => {
      const direcciones = TestBed.inject(DireccionesService) as any;
      direcciones.desdeCoordenadas = () => of(null);
      component.cliente = { personasContacto: [], codigoPostal: '28001', direccionCalleNumero: 'Lo que había' };

      component.getGeoencoder(40.56, -3.47);

      expect(component.cliente.codigoPostal).toBe('28001');
      expect(component.cliente.direccionCalleNumero).toBe('Lo que había');
    });
  });

  // Issue #168 (NestoAPI#438): al crear un contacto de un cliente que ya existe se ofrece
  // copiarle las personas de contacto y los CCC del principal, que antes copiaba
  // administración a mano.
  describe('copiar los datos del contacto principal', () => {
    it('pregunta si copiar cuando lo creado es un contacto de un cliente que ya existía', fakeAsync(() => {
      const preguntar = spyOn<any>(component, 'preguntarCopiarDatosDelPrincipal').and.resolveTo();
      component.cliente = { esContacto: true, esUnaModificacion: false };

      component.crearCliente();
      tick();

      expect(preguntar).toHaveBeenCalledWith('1', '12345', '1');
    }));

    it('NO pregunta cuando se está creando un cliente nuevo', fakeAsync(() => {
      const preguntar = spyOn<any>(component, 'preguntarCopiarDatosDelPrincipal').and.resolveTo();
      component.cliente = { esContacto: false, esUnaModificacion: false };

      component.crearCliente();
      tick();

      expect(preguntar).not.toHaveBeenCalled();
    }));

    it('NO pregunta cuando se está modificando un contacto que ya existía', fakeAsync(() => {
      const preguntar = spyOn<any>(component, 'preguntarCopiarDatosDelPrincipal').and.resolveTo();
      component.cliente = { esContacto: true, esUnaModificacion: true };

      component.crearCliente();
      tick();

      expect(preguntar).not.toHaveBeenCalled();
    }));

    it('llama al endpoint con el contacto de destino y cuenta lo copiado', fakeAsync(() => {
      component.copiarDatosDelPrincipal('1', '12345', '1');
      tick();

      expect(servicio.copiarDatosDelPrincipal).toHaveBeenCalledWith('1', '12345', '1');
      expect(alertCreado.message).toContain('2 personas de contacto');
      expect(alertCreado.message).toContain('1 cuentas bancarias');
    }));

    it('avisa si el servidor rechaza la copia', fakeAsync(() => {
      servicio.copiarDatosDelPrincipal.and.returnValue(throwError(() => ({ Message: 'No hay contacto principal' })));

      component.copiarDatosDelPrincipal('1', '12345', '1');
      tick();

      expect(alertCreado.header).toBe('Error');
      expect(alertCreado.message).toContain('No hay contacto principal');
    }));
  });

  // Issue #162 (NestoAPI#471 / #362): días de la semana que el centro abre, en
  // Clientes.DiasEnServir (char(5), L..V, '1'=abre / '0'=cierra). El picking no sirve
  // pedidos los días cerrados. Null/vacío/formato raro = '11111' (abre toda la semana).
  // Issue #181: desde el interceptor lo que llega al subscribe es un ProcessedApiError, así
  // que error.ExceptionMessage era siempre undefined y Jesús vio literalmente
  // "No se ha podido cargar el cliente: undefined" al abrir una ficha que dio 404.
  describe('motivo de los errores de la API (#181)', () => {
    const errorProcesado = (mensaje: string, status = 404) => ({
      isBusinessError: false,
      isServerError: false,
      isCancelled: false,
      statusCode: status,
      originalError: { error: { Message: mensaje } }
    });

    it('saca el motivo del ProcessedApiError en vez de undefined', () => {
      const motivo = component['motivoDelError'](errorProcesado('No existe el cliente 1/39627/1'));

      expect(motivo).toBe('No existe el cliente 1/39627/1');
      expect(motivo).not.toContain('undefined');
    });

    it('saca el motivo del formato estructurado nuevo', () => {
      const motivo = component['motivoDelError']({
        apiError: { error: { code: 'PEDIDO_INVALIDO', message: 'El cliente está bloqueado' } },
        originalError: {}
      });

      expect(motivo).toBe('El cliente está bloqueado');
    });

    it('encadena las InnerException del formato antiguo', () => {
      const motivo = component['motivoDelError']({
        originalError: {
          error: {
            ExceptionMessage: 'No se ha podido guardar',
            InnerException: { ExceptionMessage: 'La clave ya existe' }
          }
        }
      });

      expect(motivo).toContain('No se ha podido guardar');
      expect(motivo).toContain('La clave ya existe');
    });

    it('nunca devuelve undefined aunque el error venga vacío', () => {
      const motivo = component['motivoDelError']({});

      expect(motivo).toBeTruthy();
      expect(motivo).not.toContain('undefined');
    });

    it('al fallar la carga del cliente se enseña el motivo', fakeAsync(() => {
      servicio.leerClienteCrear = () => throwError(() => errorProcesado('No existe el cliente 1/39627/1'));

      component['cargarCliente']('1', '39627', '1');
      tick();

      expect(alertCreado.subHeader).toContain('No existe el cliente 1/39627/1');
    }));
  });

  // Issue #180: la dirección que ofrece Google se selecciona, no se escribe. Los vendedores
  // elegían la sugerencia y luego le añadían el portal al final, y la ficha quedaba sin
  // normalizar. Lo que se quiera añadir va en «¿Qué es?» (NestoApp#286).
  describe('la dirección se selecciona, no se escribe (#180)', () => {
    it('al elegir una sugerencia la dirección queda verificada y el campo se bloquea', fakeAsync(() => {
      servicio.leerDetalleDireccion = () => of({ calle: 'CALLE MAYOR', numero: '5', codigoPostal: '28013', poblacion: 'madrid', provincia: 'madrid' });
      component.cliente = {};

      component.seleccionarSugerenciaDireccion({ placeId: 'abc' });
      tick();

      // Issue #201: calle y número con coma, como Nesto y como se guarda en la BD.
      expect(component.cliente.direccionCalleNumero).toBe('CALLE MAYOR, 5');
      expect(component.cliente.direccionVerificada).toBeTrue();
      expect(component.direccionBloqueada).toBeTrue();
    }));

    // NestoApp#271 / NestoAPI#826: la API da calle y número en el formato del país.
    it('si el detalle trae DireccionCalleNumero se usa tal cual (direcciones extranjeras)', fakeAsync(() => {
      servicio.leerDetalleDireccion = () => of({ calle: 'Rue de la Paix', numero: '12', codigoPostal: '75002', poblacion: 'Paris', provincia: 'Île-de-France', paisIso: 'fr', direccionCalleNumero: '12 Rue de la Paix' });
      component.cliente = {};

      component.seleccionarSugerenciaDireccion({ placeId: 'abc' });
      tick();

      expect(component.cliente.direccionCalleNumero).toBe('12 Rue de la Paix');
      expect(component.cliente.pais).toBe('FR');
    }));

    // NestoApp#270 / NestoAPI#821: con un CP nuevo la API devuelve null si no se le mandó nada.
    it('un CP nuevo no pisa la población y la provincia de Google con null', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'CALLE MAYOR, 5', poblacion: null, provincia: null, hayErrores: false }));
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, codigoPostal: '28099', poblacion: 'MADRID', provincia: 'MADRID', tipoLugar: 'Casa' };

      component.goToDatosComisiones();
      tick();

      expect(component.cliente.poblacion).toBe('MADRID');
      expect(component.cliente.provincia).toBe('MADRID');
      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
    }));

    it('la población de la tabla de códigos postales sigue mandando cuando la API la devuelve', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'CALLE MAYOR, 5', poblacion: 'ALCOBENDAS', provincia: 'MADRID', hayErrores: false }));
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, codigoPostal: '28100', poblacion: 'ALCOBENDAS CENTRO', provincia: 'MADRID', tipoLugar: 'Casa' };

      component.goToDatosComisiones();
      tick();

      expect(component.cliente.poblacion).toBe('ALCOBENDAS');
    }));

    it('el 400 de la API («No existe el código postal…») se enseña tal cual', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(throwError(() => ({ message: 'No existe el código postal 28099. Elija la dirección en el buscador de Google para darlo de alta' })));
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: false, codigoPostal: '28099', tipoLugar: 'Casa' };
      component.cliente.direccionVerificada = true; // para que llegue a llamar

      component.goToDatosComisiones();
      tick();

      expect(alertCreado.message).toContain('No existe el código postal 28099');
    }));

    // NestoApp#227 / NestoAPI#623: origen del cliente (campañas)
    it('los orígenes se cargan al abrir y el elegido viaja en el alta', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of({ Empresa: '1', 'Nº_Cliente': '20000', Contacto: '0' }));
      component.cliente = { nombre: 'X', direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, origen: 'META-HARMONIA-0926', personasContacto: [] };
      expect(component.origenes.length).toBe(1);
      expect(component.textoOrigen).toBe('Lead de Meta · campaña Harmonia');

      component.crearCliente();
      tick();

      expect((crear.calls.mostRecent().args[0] as any).origen).toBe('META-HARMONIA-0926');
    }));

    it('el botón de limpiar vacía la dirección y la reabre para buscar otra', () => {
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR 5', direccionVerificada: true };

      component.limpiarDireccion();

      expect(component.cliente.direccionCalleNumero).toBe('');
      expect(component.cliente.direccionVerificada).toBeFalse();
      expect(component.direccionBloqueada).toBeFalse();
    });

    it('sin dirección elegida de Google no se pasa de datos generales', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({}));
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR 5 PORTAL B', direccionVerificada: false };

      component.goToDatosComisiones();
      tick();

      expect(validar).not.toHaveBeenCalled();
      expect(component.slideActual).not.toBe(component.DATOS_COMISIONES);
      expect(alertCreado.message).toContain('Google');
    }));

    it('con la dirección elegida se sigue adelante', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'CALLE MAYOR 5', hayErrores: false }));
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR 5', direccionVerificada: true, tipoLugar: 'Casa' };

      component.goToDatosComisiones();
      tick();

      expect(validar).toHaveBeenCalled();
    }));

    it('una ficha que ya tiene dirección y no se toca no pide nada', fakeAsync(() => {
      component.cliente = { direccion: 'CALLE MAYOR 5, MADRID', direccionCalleNumero: '', direccionVerificada: false, esUnaModificacion: true };

      component.goToDatosComisiones();
      tick();

      expect(component.faltaDireccionVerificada).toBeFalse();
      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
    }));

    it('el lápiz de editar deja la dirección lista para volver a buscarla', () => {
      component.cliente = { direccion: 'CALLE MAYOR 5, MADRID', direccionCalleNumero: 'CALLE MAYOR 5', direccionVerificada: true };

      component.editarDireccion();

      expect(component.cliente.direccion).toBe('');
      expect(component.cliente.direccionCalleNumero).toBe('');
      expect(component.faltaDireccionVerificada).toBeTrue();
    });

    it('no se guarda un cliente cuya dirección no viene de Google', fakeAsync(() => {
      const crear = spyOn(component, 'crearCliente');
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR 5 PORTAL B', direccionVerificada: false, esUnaModificacion: false };

      component.finalizar();
      tick();

      expect(crear).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('Google');
    }));

    it('el cliente viaja con direccionVerificada booleana', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of(clienteCreado));
      component.cliente = { direccion: 'CALLE MAYOR 5, MADRID', esUnaModificacion: false, formaPago: 'EFC', tipoLugar: 'Casa' };

      component.finalizar();
      tick();

      expect(crear).toHaveBeenCalled();
      expect((crear.calls.mostRecent().args[0] as any).direccionVerificada).toBe(false);
    }));
  });

  describe('días de servir (#162)', () => {
    it('sin el campo, todos los días cuentan como abiertos', () => {
      component.cliente = {};

      for (let dia = 0; dia < 5; dia++) {
        expect(component.diaServirAbierto(dia)).toBeTrue();
      }
    });

    it('lee cada posición del campo (L..V)', () => {
      component.cliente = { diasEnServir: '01110' };

      expect(component.diaServirAbierto(0)).toBeFalse();  // lunes
      expect(component.diaServirAbierto(1)).toBeTrue();   // martes
      expect(component.diaServirAbierto(4)).toBeFalse();  // viernes
    });

    it('cerrar un día apaga solo su posición', () => {
      component.cliente = { diasEnServir: '11111' };

      component.cambiarDiaServir(2, false); // miércoles

      expect(component.cliente.diasEnServir).toBe('11011');
    });

    it('abrir un día vuelve a encender su posición', () => {
      component.cliente = { diasEnServir: '01111' };

      component.cambiarDiaServir(0, true); // lunes

      expect(component.cliente.diasEnServir).toBe('11111');
    });

    it('un valor con formato raro se trata como abre toda la semana', () => {
      component.cliente = { diasEnServir: '111' };

      expect(component.diaServirAbierto(3)).toBeTrue();

      component.cambiarDiaServir(3, false); // jueves

      expect(component.cliente.diasEnServir).toBe('11101');
    });
  });

  // Issue #196 (NestoAPI#541): si al guardar la ficha se cierra un día y el cliente ya tiene
  // pedidos con picking, la API no guarda nada y pregunta. «Sí» reenvía con la confirmación
  // (y la API avisa a almacén); «No» deja los días como estaban.
  describe('cerrar días con pedidos en picking (#196)', () => {
    const clienteGuardado = { Empresa: '1 ', 'Nº_Cliente': '27120 ', Contacto: '3 ' };
    const errorDiasConPicking = {
      statusCode: 400,
      apiError: { error: {
        code: 'DIAS_CON_PICKING',
        message: 'El pedido 925633 de este cliente ya está en preparación (tiene picking) y va a salir igual aunque ahora cierre los lunes. ¿Avisamos a almacén? Si no, el cambio de días no se guarda.',
        timestamp: '', details: { pedidos: [925633] }
      } }
    };
    let envios: any[];
    let pop: jasmine.Spy;

    beforeEach(() => {
      envios = [];
      pop = spyOn(component['nav'], 'pop').and.resolveTo(true);
      servicio.leerClienteCrear = () => of({ diasEnServir: '11111', direccion: 'CALLE MAYOR, 5', nifValidado: true, formaPago: 'EFC' });
      component['cargarCliente']('1', '27120', '3');
      component.cambiarDiaServir(0, false);
    });

    const boton = (texto: string) => alertCreado.buttons.find((b: any) => b.text === texto);

    it('pregunta con el mensaje de la API y no sale de la ficha', fakeAsync(() => {
      servicio.modificarCliente = (c: any) => { envios.push({ ...c }); return throwError(() => errorDiasConPicking); };

      component.finalizar();
      tick();

      expect(alertCreado.message).toContain('El pedido 925633');
      expect(boton('Avisar a almacén')).toBeDefined();
      expect(boton('Cancelar')).toBeDefined();
      expect(envios.length).toBe(1);
      expect(envios[0].confirmarDiasEnServirConPicking).toBeFalsy();
      expect(pop).not.toHaveBeenCalled();
    }));

    it('«Avisar a almacén» reenvía la ficha con la confirmación y entonces sale', fakeAsync(() => {
      let intento = 0;
      servicio.modificarCliente = (c: any) => {
        envios.push({ ...c });
        return intento++ === 0 ? throwError(() => errorDiasConPicking) : of(clienteGuardado);
      };

      component.finalizar();
      tick();
      boton('Avisar a almacén').handler();
      tick();

      expect(envios.length).toBe(2);
      expect(envios[1].confirmarDiasEnServirConPicking).toBeTrue();
      expect(envios[1].diasEnServir).toBe('01111');
      expect(pop).toHaveBeenCalled();
    }));

    it('«Cancelar» deja los días como estaban en la ficha y no reenvía nada', fakeAsync(() => {
      servicio.modificarCliente = (c: any) => { envios.push({ ...c }); return throwError(() => errorDiasConPicking); };

      component.finalizar();
      tick();
      boton('Cancelar').handler();
      tick();

      expect(envios.length).toBe(1);
      expect(component.cliente.diasEnServir).toBe('11111');
      expect(component.cliente.confirmarDiasEnServirConPicking).toBeUndefined();
    }));

    it('cualquier otro error se enseña como siempre, sin pregunta', fakeAsync(() => {
      servicio.modificarCliente = () => throwError(() => ({ statusCode: 400, originalError: { error: { Message: 'Días mal formados' } } }));

      component.finalizar();
      tick();

      expect(alertCreado.header).toBe('Error');
      expect(alertCreado.buttons).toEqual(['Ok']);
    }));
  });

  // NestoApp#286 (NestoAPI#874, gemela de Nesto#643): «¿Qué es?» y el número que Google no da.
  describe('«¿Qué es?» y número propio en el alta (#286)', () => {
    const buena = () => ({ direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, codigoPostal: '28013', tipoLugar: 'Casa' } as any);

    it('sin «¿Qué es?» no se pasa de datos generales y no se llama a la API', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ MAYOR, 5' }));
      component.cliente = { ...buena(), tipoLugar: null };

      component.goToDatosComisiones();
      tick();

      expect(validar).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('Indique qué es la dirección');
      expect(component.slideActual).not.toBe(component.DATOS_COMISIONES);
    }));

    it('un local sin rótulo tampoco pasa', fakeAsync(() => {
      component.cliente = { ...buena(), tipoLugar: 'Local', numeroLocal: '6' };

      component.goToDatosComisiones();
      tick();

      expect(alertCreado.message).toContain('rótulo');
    }));

    it('si Google dio la calle sin número, se pide antes de seguir', fakeAsync(() => {
      servicio.leerDetalleDireccion = () => of({ calle: 'Calle Sor Livia Alcorta', codigoPostal: '28100', poblacion: 'Alcobendas' });
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({}));
      component.cliente = { tipoLugar: 'Casa' };
      component.seleccionarSugerenciaDireccion({ placeId: 'abc' });
      tick();
      expect(component.cliente.numeroSinDarPorGoogle).toBeTrue();

      component.goToDatosComisiones();
      tick();

      expect(validar).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('Google no tiene el número');
    }));

    it('en «Número» solo va el portal', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({}));
      component.cliente = { ...buena(), numeroSinDarPorGoogle: true, numero: '99 local 6' };

      component.goToDatosComisiones();
      tick();

      expect(validar).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('solo va el número del portal');
    }));

    it('la dirección que queda es solo la que devuelve la API (calle y número)', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ SOR LIVIA ALCORTA, 13', hayErrores: false }));
      component.cliente = { ...buena(), numeroSinDarPorGoogle: true, numero: '13' };

      component.goToDatosComisiones();
      tick();

      expect(component.cliente.direccion).toBe('C/ SOR LIVIA ALCORTA, 13');
      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
    }));

    it('si Google no encuentra el número, pregunta con el texto de la API; con «No» se queda', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ LA GRANJA, 99', numeroSinConfirmarPorGoogle: true, avisoNumero: 'Google Maps no encuentra el número 99 en C/ LA GRANJA (28108). ¿Quiere guardarlo igualmente?' }));
      const preguntar = spyOn<any>(component, 'preguntar').and.resolveTo(false);
      component.cliente = { ...buena(), numeroSinDarPorGoogle: true, numero: '99' };

      component.goToDatosComisiones();
      tick();

      expect(preguntar).toHaveBeenCalledWith('Número de la calle', jasmine.stringMatching(/no encuentra el número 99/));
      expect(component.cliente.numeroConfirmadoSinGoogle).toBeFalsy();
      expect(component.cliente.direccion).toBeFalsy();
      expect(component.slideActual).not.toBe(component.DATOS_COMISIONES);
    }));

    it('con «Sí» sigue y el alta viaja con el número y NumeroConfirmadoSinGoogle', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ LA GRANJA, 99', numeroSinConfirmarPorGoogle: true, avisoNumero: '¿Quiere guardarlo igualmente?' }));
      spyOn<any>(component, 'preguntar').and.resolveTo(true);
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of(clienteCreado));
      component.cliente = { ...buena(), numeroSinDarPorGoogle: true, numero: '99' };

      component.goToDatosComisiones();
      tick();
      component.crearCliente();
      tick();

      expect(component.slideActual).toBe(component.DATOS_FISCALES); // tras crear vuelve al principio
      const alta = crear.calls.mostRecent().args[0] as any;
      expect(alta.numero).toBe('99');
      expect(alta.numeroConfirmadoSinGoogle).toBeTrue();
      expect(alta.tipoLugar).toBe('Casa');
    }));

    it('cambiar el número obliga a volver a preguntar', () => {
      component.cliente = { numeroConfirmadoSinGoogle: true };
      component.numeroCambiado();
      expect(component.cliente.numeroConfirmadoSinGoogle).toBeFalse();
    });

    it('si Google da el número, no viaja «Numero»', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of(clienteCreado));
      component.cliente = { ...buena(), numero: '5', direccion: 'C/ MAYOR, 5' };

      component.crearCliente();
      tick();

      expect((crear.calls.mostRecent().args[0] as any).numero).toBeNull();
    }));

    it('al finalizar tampoco se crea sin «¿Qué es?»', fakeAsync(() => {
      const crear = spyOn(component, 'crearCliente');
      component.cliente = { direccion: 'C/ MAYOR, 5', esUnaModificacion: false, formaPago: 'EFC' };

      component.finalizar();
      tick();

      expect(crear).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('Indique qué es la dirección');
    }));
  });

  // NestoApp#288 (NestoAPI#879): el código postal sale de Google y la entrega puede ir en otra dirección.
  describe('código postal de Google y dirección de entrega en el alta (#288)', () => {
    const fiscal = () => ({ direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, codigoPostal: '28013', tipoLugar: 'Casa', telefono: '915555555' } as any);
    const entrega = () => ({ direccionCalleNumero: 'Calle la Granja, 99', direccionVerificada: true, codigoPostal: '28108', tipoLugar: 'Nave', numeroNave: '4' } as any);

    it('al crear, el código postal no se teclea', () => {
      component.cliente = {};
      expect(component.codigoPostalEditable).toBeFalse();
      component.cliente = { direccionVerificada: true };
      expect(component.codigoPostalEditable).toBeFalse();
    });

    it('solo se deja escribir si Google elige la dirección sin dar su código postal', fakeAsync(() => {
      servicio.leerDetalleDireccion = () => of({ calle: 'Calle Nueva', numero: '3', poblacion: 'Algete' });
      component.cliente = {};

      component.seleccionarSugerenciaDireccion({ placeId: 'abc' });
      tick();

      expect(component.cliente.direccionVerificada).toBeTrue();
      expect(component.codigoPostalEditable).toBeTrue();
      expect(component.ayudaCodigoPostal).toContain('escríbalo');
    }));

    it('al modificar el código postal sigue como estaba', () => {
      component.cliente = { esUnaModificacion: true };
      expect(component.codigoPostalEditable).toBeTrue();
      component.cliente = { esUnaModificacion: true, direccionVerificada: true };
      expect(component.codigoPostalEditable).toBeFalse();
    });

    it('la casilla solo sale al crear un cliente nuevo, no un contacto ni al modificar', () => {
      component.cliente = {};
      expect(component.puedeIndicarEntregaEnOtraDireccion).toBeTrue();
      component.cliente = { esContacto: true };
      expect(component.puedeIndicarEntregaEnOtraDireccion).toBeFalse();
      component.cliente = { esUnaModificacion: true };
      expect(component.puedeIndicarEntregaEnOtraDireccion).toBeFalse();
    });

    it('al marcarla se propone el teléfono de la fiscal', () => {
      component.cliente = { telefono: '915555555' };
      component.cambiarEntregaEnOtraDireccion(true);
      expect(component.hayDireccionEntrega).toBeTrue();
      expect(component.direccionEntrega.telefono).toBe('915555555');
    });

    it('marcada y sin dirección de entrega no se sigue', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ MAYOR, 5' }));
      component.cliente = fiscal();
      component.cambiarEntregaEnOtraDireccion(true);

      component.goToDatosComisiones();
      tick();

      expect(validar).not.toHaveBeenCalled();
      expect(alertCreado.message).toContain('Dirección de entrega: ');
    }));

    it('valida las dos direcciones por el mismo camino y solo entonces sigue', fakeAsync(() => {
      const validar = spyOn(servicio, 'validarDatosGenerales').and.callFake((b: any) =>
        of(b === component.cliente
          ? { direccionFormateada: 'C/ MAYOR, 5', ruta: 'AT', telefonoFormateado: '915555555' }
          : { direccionFormateada: 'C/ LA GRANJA, 99', poblacion: 'ALCOBENDAS', provincia: 'MADRID', ruta: '00', telefonoFormateado: '916281914' }));
      component.cliente = fiscal();
      component.cambiarEntregaEnOtraDireccion(true);
      Object.assign(component.direccionEntrega, entrega());

      component.goToDatosComisiones();
      tick();

      expect(validar).toHaveBeenCalledTimes(2);
      expect(component.direccionEntrega.direccion).toBe('C/ LA GRANJA, 99');
      expect(component.direccionEntrega.ruta).toBe('00');
      expect(component.direccionEntrega.direccionValidada).toBeTrue();
      expect(component.cliente.ruta).toBe('AT');
      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
    }));

    it('si la de entrega no valida, se enseña el error con su prefijo y no se sigue', fakeAsync(() => {
      spyOn(servicio, 'validarDatosGenerales').and.callFake((b: any) =>
        b === component.cliente ? of({ direccionFormateada: 'C/ MAYOR, 5' }) : throwError(() => ({ message: 'No existe el código postal 28108' })));
      component.cliente = fiscal();
      component.cambiarEntregaEnOtraDireccion(true);
      Object.assign(component.direccionEntrega, entrega());

      component.goToDatosComisiones();
      tick();

      expect(alertCreado.message).toContain('Dirección de entrega: ');
      expect(alertCreado.message).toContain('No existe el código postal 28108');
      expect(component.slideActual).not.toBe(component.DATOS_COMISIONES);
    }));

    it('el alta viaja con DireccionEntrega y el aviso dice el contacto de entrega creado', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of({ Empresa: '1', 'Nº_Cliente': '42200', Contacto: '0', ContactoEntrega: '1' }));
      component.cliente = { ...fiscal(), direccion: 'C/ MAYOR, 5' };
      component.cambiarEntregaEnOtraDireccion(true);
      Object.assign(component.direccionEntrega, entrega(), { direccion: 'C/ LA GRANJA, 99', direccionValidada: true });

      component.crearCliente();
      tick();

      const alta = crear.calls.mostRecent().args[0] as any;
      expect(alta.direccionEntrega.direccion).toBe('C/ LA GRANJA, 99');
      expect(alta.direccionEntrega.tipoLugar).toBe('Nave');
      expect(alta.direccionEntrega.numeroNave).toBe('4');
      expect(alertCreado.subHeader).toContain('el contacto 42200/1');
      // y se queda listo para otra alta
      expect(component.entregaEnOtraDireccion).toBeFalse();
      expect(component.direccionEntrega).toEqual({});
    }));

    it('sin marcar la casilla no viaja DireccionEntrega', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of(clienteCreado));
      component.cliente = { ...fiscal(), direccion: 'C/ MAYOR, 5' };
      Object.assign(component.direccionEntrega, entrega());

      component.crearCliente();
      tick();

      expect('direccionEntrega' in (crear.calls.mostRecent().args[0] as any)).toBeFalse();
    }));

    it('un contacto no lleva dirección de entrega aunque la casilla se quedara marcada', fakeAsync(() => {
      const crear = spyOn(servicio, 'crearCliente').and.returnValue(of(clienteCreado));
      spyOn<any>(component, 'preguntarCopiarDatosDelPrincipal').and.resolveTo();
      component.cliente = { ...fiscal(), direccion: 'C/ MAYOR, 5' };
      component.cambiarEntregaEnOtraDireccion(true);
      component.cliente.esContacto = true;

      component.crearCliente();
      tick();

      expect('direccionEntrega' in (crear.calls.mostRecent().args[0] as any)).toBeFalse();
    }));
  });

  // NestoApp#290 punto 1 (NestoAPI#874 corte 2): «¿Qué es?» al modificar.
  describe('Dirección 2 al modificar (#290)', () => {
    const guardado = { Empresa: '1 ', 'Nº_Cliente': '27120 ', Contacto: '3 ' };
    let envios: any[];

    beforeEach(() => {
      envios = [];
      spyOn(component['nav'], 'pop').and.resolveTo(true);
      servicio.modificarCliente = (c: any) => { envios.push({ ...c }); return of(guardado); };
      servicio.leerClienteCrear = () => of({ direccion: 'C/ MAYOR, 5', direccion2: '1º D', tipoLugar: 'Piso', piso: '1º', puerta: 'D', nifValidado: true, formaPago: 'EFC', codigoPostal: '28013' });
      component['cargarCliente']('1', '27120', '3');
    });

    const cambiarCalle = () => {
      component.editarDireccion();
      tick(600); // el foco que se pide al reabrir la búsqueda (y el de abrir la ficha)
      component.cliente.direccionCalleNumero = 'Calle la Granja, 99';
      component.cliente.direccionVerificada = true;
      spyOn(servicio, 'validarDatosGenerales').and.returnValue(of({ direccionFormateada: 'C/ LA GRANJA, 99' }));
    };

    it('la ficha llega con «¿Qué es?» relleno y sin nada que revisar', () => {
      expect(component.cliente.tipoLugar).toBe('Piso');
      expect(component.esAlta).toBeFalse();
      expect(component.avisoRevisarDireccion2).toBeNull();
      expect(component.puedeQuitarDireccion2).toBeTrue();
      expect(component.direccion2Resumen).toBe('1º D');
    });

    it('si no se toca, no viaja ningún campo de «¿Qué es?»', fakeAsync(() => {
      component.finalizar();
      tick();

      expect(envios.length).toBe(1);
      expect('tipoLugar' in envios[0]).toBeFalse();
      expect('quitarDireccion2' in envios[0]).toBeFalse();
    }));

    it('si se cambia, viajan el tipo y sus campos', fakeAsync(() => {
      component.cliente.tipoLugar = 'Local';
      component.cliente.rotulo = 'El Edén';
      component.queEsCambiado();

      component.finalizar();
      tick();

      expect(envios[0].tipoLugar).toBe('Local');
      expect(envios[0].rotulo).toBe('El Edén');
      expect(envios[0].piso).toBeNull();
    }));

    it('lo cambiado y mal puesto no se guarda', fakeAsync(() => {
      component.cliente.tipoLugar = 'Local';
      component.cliente.rotulo = '';
      component.queEsCambiado();

      component.finalizar();
      tick();

      expect(envios.length).toBe(0);
      expect(alertCreado.message).toContain('rótulo');
    }));

    it('al cambiar la calle pregunta por «¿Qué es?» y no sigue sin revisarlo', fakeAsync(() => {
      cambiarCalle();

      component.goToDatosComisiones();
      tick();

      expect(alertCreado.header).toBe('Ha cambiado la dirección');
      expect(alertCreado.message).toContain('«1º D»');
      expect(alertCreado.buttons.map((b: any) => b.text)).toEqual(['Cambiarlo', 'Quitar', 'Sigue siendo así']);
      expect(component.slideActual).not.toBe(component.DATOS_COMISIONES);
      expect(component.avisoRevisarDireccion2).toContain('Ha cambiado la calle');
    }));

    it('sin revisarlo tampoco se guarda', fakeAsync(() => {
      cambiarCalle();
      component.goToDatosComisiones();
      tick();

      component.finalizar();
      tick();

      expect(envios.length).toBe(0);
    }));

    it('«Sigue siendo así» lo da por revisado y viaja con la dirección nueva', fakeAsync(() => {
      cambiarCalle();
      component.goToDatosComisiones();
      tick();
      component.confirmarDireccion2();

      component.goToDatosComisiones();
      tick();
      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
      component.finalizar();
      tick();

      expect(envios[0].direccion).toBe('C/ LA GRANJA, 99');
      expect(envios[0].tipoLugar).toBe('Piso');
      expect(envios[0].numero).toBeNull();
    }));

    it('«Quitar» manda QuitarDireccion2 y ningún tipo', fakeAsync(() => {
      cambiarCalle();
      component.goToDatosComisiones();
      tick();
      alertCreado.buttons.find((b: any) => b.text === 'Quitar').handler();

      component.finalizar();
      tick();

      expect(component.seQuitaraDireccion2).toBeTrue();
      expect(envios[0].quitarDireccion2).toBeTrue();
      expect('tipoLugar' in envios[0]).toBeFalse();
    }));

    it('un cliente sin Dirección 2 cambia de calle sin que se le pregunte nada', fakeAsync(() => {
      servicio.leerClienteCrear = () => of({ direccion: 'C/ MAYOR, 5', nifValidado: true, formaPago: 'EFC', codigoPostal: '28013' });
      component['cargarCliente']('1', '27120', '3');
      cambiarCalle();

      component.goToDatosComisiones();
      tick();

      expect(component.slideActual).toBe(component.DATOS_COMISIONES);
      expect(component.puedeQuitarDireccion2).toBeFalse();
    }));
  });
});
