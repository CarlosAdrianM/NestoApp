import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FirebaseAnalytics } from '../../services/firebase-analytics.service';
import { Usuario } from 'src/app/models/Usuario';
import { Storage } from '@ionic/storage-angular';

import { ExtractoClienteComponent, ModalEnviarEnlaceCobroComponent } from './extracto-cliente.component';
import { of, throwError } from 'rxjs';
import { ExtractoClienteService } from './extracto-cliente.service';
import { EnvioWhatsAppService } from 'src/app/services/envio-whatsapp.service';
import { AlertController } from '@ionic/angular';
import { fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ExtractoClienteComponent', () => {
  let component: ExtractoClienteComponent;
  let fixture: ComponentFixture<ExtractoClienteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ExtractoClienteComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [IonicModule.forRoot(), RouterTestingModule],
    providers: [
        Usuario,
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: Storage, useValue: {} },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(ExtractoClienteComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/** NestoApp#216 (NestoAPI#609): proponer la corrección del concepto antes de mandar el enlace. */
describe('ModalEnviarEnlaceCobroComponent: revisar el concepto (#216)', () => {
  let modal: ModalEnviarEnlaceCobroComponent;
  let servicio: any;
  let alertas: any[];
  let pulsar: string;

  beforeEach(() => {
    alertas = [];
    pulsar = 'Usar la corrección';
    servicio = {
      revisarConcepto: jasmine.createSpy('revisarConcepto').and.returnValue(of({
        Original: 'Señal curso quiromasage', Propuesto: 'Señal curso quiromasaje', HayCambios: true,
        Cambios: [{ De: 'quiromasage', A: 'quiromasaje' }]
      }))
    };
    const alertCtrl: any = {
      create: (opts: any) => {
        alertas.push(opts);
        return Promise.resolve({ present: () => { opts.buttons.find((b: any) => b.text === pulsar).handler(); return Promise.resolve(); } });
      }
    };
    modal = new ModalEnviarEnlaceCobroComponent(null, servicio, alertCtrl, null, null, null);
    modal.cliente = { empresa: '1 ', cliente: '15191 ', contacto: '0' };
  });

  it('con «Usar la corrección» se queda la propuesta', async () => {
    expect(await modal.revisarConcepto('Señal curso quiromasage')).toBe('Señal curso quiromasaje');
    expect(servicio.revisarConcepto).toHaveBeenCalledWith('Señal curso quiromasage', '1', '15191');
    expect(alertas[0].message).toContain('quiromasage → quiromasaje');
  });

  it('con «Dejar el mío» se queda lo escrito', async () => {
    pulsar = 'Dejar el mío';
    expect(await modal.revisarConcepto('Señal curso quiromasage')).toBe('Señal curso quiromasage');
  });

  it('sin cambios, o si la API falla o es vieja, no se pregunta', async () => {
    servicio.revisarConcepto.and.returnValue(of(null));
    expect(await modal.revisarConcepto('Pago facturas NV1')).toBe('Pago facturas NV1');
    expect(alertas.length).toBe(0);
  });
});

/** NestoApp#260 (NestoAPI#763) y #261 (NestoAPI#737) en la ficha del cliente. */
describe('ExtractoClienteComponent: horario preferible (#260) y factura por WhatsApp (#261)', () => {
  let component: ExtractoClienteComponent;
  let fixture: ComponentFixture<ExtractoClienteComponent>;
  let servicio: any;
  let whatsapp: any;
  let alertas: any[];

  beforeEach(waitForAsync(() => {
    alertas = [];
    servicio = {
      cargarDeuda: () => of([]),
      leerHorarioPreferible: jasmine.createSpy('leerHorarioPreferible').and.returnValue(of({ Texto: 'L-V 10:00-14:00', Aviso: 'Lo intentaremos, sin compromiso.' })),
      guardarHorarioPreferible: jasmine.createSpy('guardarHorarioPreferible').and.returnValue(of({ Texto: 'S 10:00-13:00' }))
    };
    whatsapp = { enviarDocumento: jasmine.createSpy('enviarDocumento').and.returnValue(Promise.resolve(true)) };
    TestBed.configureTestingModule({
      declarations: [ExtractoClienteComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        Usuario,
        { provide: ExtractoClienteService, useValue: servicio },
        { provide: EnvioWhatsAppService, useValue: whatsapp },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: File, useValue: { dataDirectory: '' } },
        { provide: Storage, useValue: {} },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ExtractoClienteComponent);
    component = fixture.componentInstance;
    component.clienteSeleccionado = { empresa: '1', cliente: '15191', contacto: '0' };
  }));

  it('al elegir el cliente se lee su horario preferible y se enseña con el aviso', fakeAsync(() => {
    component.onSegmentChange();
    tick();
    expect(servicio.leerHorarioPreferible).toHaveBeenCalledWith('1', '15191', '0');
    expect(component.textoHorarioPreferible).toBe('L-V 10:00-14:00');
    expect(component.avisoHorarioPreferible).toBe('Lo intentaremos, sin compromiso.');
  }));

  it('el mismo cliente no se vuelve a pedir', fakeAsync(() => {
    component.onSegmentChange();
    component.onSegmentChange();
    tick();
    expect(servicio.leerHorarioPreferible).toHaveBeenCalledTimes(1);
  }));

  it('el editor guarda el texto y se queda lo que devuelve la API', fakeAsync(() => {
    component.editarHorarioPreferible();
    tick();
    const editor = alertas[0];
    expect(editor.header).toBe('Horario preferible');
    expect(editor.message).toContain('no hay compromiso');
    editor.buttons.find((b: any) => b.text === 'Guardar').handler({ texto: 'S 10:00-13:00' });
    tick();
    expect(servicio.guardarHorarioPreferible).toHaveBeenCalledWith('1', '15191', '0', 'S 10:00-13:00');
    expect(component.textoHorarioPreferible).toBe('S 10:00-13:00');
  }));

  it('un 400 de formato se enseña tal cual', fakeAsync(() => {
    servicio.guardarHorarioPreferible.and.returnValue(throwError(() => ({ message: 'La franja «25:00-26:00» no es válida' })));
    component.guardarHorarioPreferible('L 25:00-26:00');
    tick();
    expect(alertas[0].header).toBe('No se ha podido guardar el horario');
    expect(alertas[0].message).toContain('25:00-26:00');
  }));

  it('la factura por WhatsApp pasa por el servicio con su empresa y número', () => {
    component.enviarFacturaPorWhatsApp({ empresa: '1', documento: 'NV2616199' });
    expect(whatsapp.enviarDocumento).toHaveBeenCalledWith('Factura', '1', 'NV2616199');
  });
});
