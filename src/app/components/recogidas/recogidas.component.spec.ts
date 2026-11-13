import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RecogidasComponent } from './recogidas.component';
import { CodigoBarrasComponent } from './codigo-barras.component';
import { RecogidasSolicitadasService } from 'src/app/services/recogidas-solicitadas.service';
import { FirebaseAnalytics } from 'src/app/services/firebase-analytics.service';

describe('RecogidasComponent (#259, NestoAPI#855)', () => {
  let component: RecogidasComponent;
  let fixture: ComponentFixture<RecogidasComponent>;
  let servicio: any;
  let params: BehaviorSubject<any>;
  let alertas: any[];

  const recogida = (extra: any = {}) => ({
    Id: 7, Empresa: '1', Cliente: '15191', Contacto: '0', NombreCliente: 'LOLA', Texto: 'Aparato X', Bultos: 1, FacturaOriginal: null,
    QuienRecoge: 'Reparto', Estado: 'Solicitada', FechaSolicitud: '2026-11-13T10:00:00', PedidoNota: null, CodigoDocumento: null,
    CodigosBultos: [], MotivoRechazo: null, ...extra
  });
  const ultimaAlerta = () => alertas[alertas.length - 1];

  beforeEach(waitForAsync(() => {
    alertas = [];
    params = new BehaviorSubject<any>({ empresa: '1', cliente: '15191', contacto: '0', nombre: 'LOLA' });
    servicio = {
      leer: jasmine.createSpy('leer').and.returnValue(of([recogida()])),
      solicitar: jasmine.createSpy('solicitar').and.returnValue(of(recogida())),
      anular: jasmine.createSpy('anular').and.returnValue(of(recogida({ Estado: 'Anulada' })))
    };
    TestBed.configureTestingModule({
      declarations: [RecogidasComponent, CodigoBarrasComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: params } },
        { provide: RecogidasSolicitadasService, useValue: servicio },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: LoadingController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) } },
        { provide: ToastController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RecogidasComponent);
    component = fixture.componentInstance;
  }));

  it('carga las recogidas del cliente que llega por la URL', () => {
    expect(servicio.leer).toHaveBeenCalledWith('1', '15191', '0');
    expect(component.recogidas.length).toBe(1);
    expect(component.haySinResolver).toBeTrue();
    expect(component.titulo).toBe('15191/0 · LOLA');
  });

  it('una push de otro cliente recarga la misma página', () => {
    params.next({ cliente: '20000', contacto: '1', aviso: 5 });
    expect(servicio.leer).toHaveBeenCalledWith('1', '20000', '1');
  });

  it('sin el script en la API (503) dice que aún no está disponible', () => {
    servicio.leer.and.returnValue(throwError(() => ({ status: 503 })));
    component.cargar();
    expect(component.mensaje).toContain('todavía no');
  });

  it('solicitar: no manda nada sin texto', fakeAsync(async () => {
    component.abrirFormulario();
    await component.solicitar();
    tick();
    expect(servicio.solicitar).not.toHaveBeenCalled();
    expect(ultimaAlerta().message).toBe('Diga qué hay que recoger.');
  }));

  it('solicitar: manda la recogida («la recojo yo») y recarga', fakeAsync(async () => {
    component.abrirFormulario();
    component.nueva = { Texto: 'Aparato X', Bultos: 2, FacturaOriginal: '', QuienRecoge: 'Vendedor' };
    await component.solicitar();
    tick();
    expect(servicio.solicitar).toHaveBeenCalledWith({
      Empresa: '1', Cliente: '15191', Contacto: '0', Texto: 'Aparato X', Bultos: 2, FacturaOriginal: '', QuienRecoge: 'Vendedor'
    });
    expect(component.mostrarFormulario).toBeFalse();
    expect(servicio.leer).toHaveBeenCalledTimes(2);
  }));

  it('solicitar: si la API dice que no (ruta propia, 409…), enseña su mensaje', fakeAsync(async () => {
    servicio.solicitar.and.returnValue(throwError(() => ({ status: 400, error: { Message: 'No es de ruta propia: pídala como «la recojo yo».' } })));
    component.nueva = { Texto: 'Aparato X', Bultos: 1, FacturaOriginal: '', QuienRecoge: 'Reparto' };
    await component.solicitar();
    tick();
    expect(ultimaAlerta().message).toContain('ruta propia');
  }));

  it('anular pide confirmación (con motivo opcional) y anula', fakeAsync(async () => {
    await component.anular(component.recogidas[0]);
    const boton = ultimaAlerta().buttons.find((b: any) => b.text === 'Anular');
    boton.handler({ motivo: 'Ya no hace falta' });
    tick();
    expect(servicio.anular).toHaveBeenCalledWith(7, 'Ya no hace falta');
  }));

  it('«la recojo yo» confirmada pinta el código NR como código de barras', () => {
    servicio.leer.and.returnValue(of([recogida({ QuienRecoge: 'Vendedor', Estado: 'Confirmada', CodigoDocumento: 'NR905123' })]));
    component.cargar();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector('codigo-barras svg');
    expect(svg).toBeTruthy();
    expect(svg.querySelectorAll('rect').length).toBeGreaterThan(10);
    expect(svg.textContent).toContain('NR905123');
  });
});
