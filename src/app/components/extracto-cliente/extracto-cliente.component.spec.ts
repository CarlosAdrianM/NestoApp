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
import { of } from 'rxjs';
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
