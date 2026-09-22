import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { Usuario } from 'src/app/models/Usuario';
import { Geolocation } from '../../services/geolocation.service';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { CacheService } from '../../services/cache.service';
import { Storage } from '@ionic/storage-angular';

import { ClienteComponent } from './cliente.component';
import { ClienteService } from './cliente.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of, throwError } from 'rxjs';

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
      leerClienteCrear: () => of({})
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
        { provide: NativeGeocoder, useValue: { reverseGeocode: () => Promise.resolve([]) } },
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
  // normalizar. Lo que se quiera añadir va en "Dirección (resto de información)".
  describe('la dirección se selecciona, no se escribe (#180)', () => {
    it('al elegir una sugerencia la dirección queda verificada y el campo se bloquea', fakeAsync(() => {
      servicio.leerDetalleDireccion = () => of({ calle: 'CALLE MAYOR', numero: '5', codigoPostal: '28013', poblacion: 'madrid', provincia: 'madrid' });
      component.cliente = {};

      component.seleccionarSugerenciaDireccion({ placeId: 'abc' });
      tick();

      expect(component.cliente.direccionCalleNumero).toBe('CALLE MAYOR 5');
      expect(component.cliente.direccionVerificada).toBeTrue();
      expect(component.direccionBloqueada).toBeTrue();
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
      component.cliente = { direccionCalleNumero: 'CALLE MAYOR 5', direccionVerificada: true };

      component.goToDatosComisiones();
      tick();

      expect(validar).toHaveBeenCalled();
    }));

    it('una ficha que ya tiene dirección y no se toca no pide nada', fakeAsync(() => {
      component.cliente = { direccion: 'CALLE MAYOR 5, MADRID', direccionCalleNumero: '', direccionVerificada: false };

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
      component.cliente = { direccion: 'CALLE MAYOR 5, MADRID', esUnaModificacion: false, formaPago: 'EFC' };

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
});
