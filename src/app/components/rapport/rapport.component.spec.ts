import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage-angular';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

import { RapportComponent } from './rapport.component';
import { RapportService } from './rapport.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';

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
        { provide: RapportService, useValue: { getCliente: () => of(clienteDevuelto) } },
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
});
