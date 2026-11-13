import { TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { GlobosService } from './globos.service';
import { Usuario } from '../models/Usuario';
import { Globo } from '../models/globo.model';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';

describe('GlobosService (NestoAPI#774)', () => {
  let servicio: GlobosService;
  let http: HttpTestingController;
  let popovers: any[];
  let rolAlCerrar: string;
  let usuario: any;
  let router: any;
  let anclas: HTMLElement[];

  const globo = (extra: Partial<Globo> = {}): Globo => ({
    Id: 1, Aplicacion: 'NestoApp', Pantalla: 'pedido-venta', Ancla: 'pedido-venta.PagarAPlazos', Titulo: 'Nuevo',
    Texto: 'Pague a plazos', Orden: 10, NovedadId: null, ...extra
  });
  const pedirGlobos = () => http.expectOne(r => r.url.endsWith('/Globos') && r.method === 'GET');
  const ancla = (clave: string, visible = true) => {
    const el = document.createElement('button');
    el.textContent = 'x';
    el.style.display = visible ? 'inline-block' : 'none';
    document.body.appendChild(el);
    anclas.push(el);
    servicio.registrarAncla(clave, el);
    return el;
  };

  beforeEach(() => {
    popovers = [];
    anclas = [];
    rolAlCerrar = 'visto';
    usuario = { nombre: 'dlopez' };
    router = { events: { pipe: () => ({ subscribe: () => { } }) }, navigateByUrl: jasmine.createSpy('navigateByUrl') };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(),
        { provide: Usuario, useValue: usuario },
        { provide: Router, useValue: router },
        { provide: PopoverController, useValue: { create: (o: any) => { popovers.push(o); return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve({ role: rolAlCerrar }) }); } } }
      ]
    });
    servicio = TestBed.inject(GlobosService);
    servicio.esperaEntrada = 0;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    anclas.forEach(a => a.remove());
    http.verify();
  });

  it('pide los de la pantalla con la aplicación y la versión, y lo pinta junto a su control', fakeAsync(() => {
    const boton = ancla('pedido-venta.PagarAPlazos');
    servicio.alEntrar('pedido-venta');
    tick();
    const req = pedirGlobos();
    expect(req.request.params.get('aplicacion')).toBe('NestoApp');
    expect(req.request.params.get('pantalla')).toBe('pedido-venta');
    expect(req.request.params.get('version')).toBe(Configuracion.VERSION);
    req.flush([globo()]);
    flushMicrotasks();

    expect(popovers.length).toBe(1);
    expect(popovers[0].event.target).toBe(boton);
    expect(popovers[0].componentProps.globo.Id).toBe(1);
    tick();
    http.expectOne(r => r.url.endsWith('/Globos/1/Visto') && r.method === 'POST').flush({ Id: 1, YaEstaba: false });
  }));

  it('espera a que su control se vea; si no aparece, no lo enseña ni lo marca', fakeAsync(() => {
    ancla('pedido-venta.PagarAPlazos', false);
    servicio.alEntrar('pedido-venta');
    tick();
    pedirGlobos().flush([globo()]);
    tick(11000);
    expect(popovers.length).toBe(0);
  }));

  it('sin ancla, tarjeta centrada; enseña dos como mucho, de uno en uno', fakeAsync(() => {
    servicio.alEntrar('recogidas');
    tick();
    pedirGlobos().flush([globo({ Id: 1, Ancla: null }), globo({ Id: 2, Ancla: '' }), globo({ Id: 3, Ancla: null })]);
    tick();
    expect(popovers.length).toBe(2);
    expect(popovers[0].event).toBeUndefined();
    http.match(r => r.url.includes('/Visto')).forEach(r => r.flush({}));
  }));

  it('cerrado tocando fuera: no se marca visto ni se encadena el siguiente', fakeAsync(() => {
    rolAlCerrar = 'backdrop';
    servicio.alEntrar('recogidas');
    tick();
    pedirGlobos().flush([globo({ Id: 1, Ancla: null }), globo({ Id: 2, Ancla: null })]);
    tick();
    expect(popovers.length).toBe(1);
  }));

  it('«Ver la novedad» lo marca visto y abre la novedad', fakeAsync(() => {
    rolAlCerrar = 'novedad';
    servicio.alEntrar('recogidas');
    tick();
    pedirGlobos().flush([globo({ Ancla: null, NovedadId: 1300 })]);
    tick();
    http.expectOne(r => r.url.endsWith('/Globos/1/Visto')).flush({});
    expect(router.navigateByUrl).toHaveBeenCalledWith(jasmine.stringMatching(/^\/profile\?novedad=1300&aviso=\d+$/));
  }));

  it('sin sesión no pide nada; si la API falla, no sale nada', fakeAsync(() => {
    usuario.nombre = undefined;
    servicio.alEntrar('pedido-venta');
    tick();
    http.expectNone(r => r.url.endsWith('/Globos'));

    usuario.nombre = 'dlopez';
    servicio.alEntrar('pedido-venta');
    tick();
    pedirGlobos().flush({ Message: 'x' }, { status: 503, statusText: 'x' });
    tick();
    expect(popovers.length).toBe(0);
  }));

  it('una vez enseñado en la sesión, no se repite al volver a la pantalla', fakeAsync(() => {
    servicio.alEntrar('recogidas');
    tick();
    pedirGlobos().flush([globo({ Ancla: null })]);
    tick();
    http.expectOne(r => r.url.endsWith('/Globos/1/Visto')).flush({});
    servicio.alEntrar('recogidas');
    tick();
    pedirGlobos().flush([globo({ Ancla: null })]);
    tick();
    expect(popovers.length).toBe(1);
  }));
});
