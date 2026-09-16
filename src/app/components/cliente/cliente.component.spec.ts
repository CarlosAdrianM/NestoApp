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
