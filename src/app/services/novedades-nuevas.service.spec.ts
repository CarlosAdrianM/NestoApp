import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AlertController, NavController } from '@ionic/angular';
import { Configuracion } from '../components/configuracion/configuracion/configuracion.component';
import { Usuario } from '../models/Usuario';
import { FirebaseAnalytics } from './firebase-analytics.service';
import { NovedadesNuevasService } from './novedades-nuevas.service';

/** NestoApp#177 fase 2 (NestoAPI#495): el aviso «qué hay de nuevo» al iniciar sesión, por Id. */
describe('NovedadesNuevasService (#177 fase 2)', () => {
  let servicio: NovedadesNuevasService;
  let http: HttpTestingController;
  let usuario: Usuario;
  let alertas: any[];
  let nav: any;
  const PARAMETROS = `${Configuracion.API_URL}/ParametrosUsuario`;
  const NOVEDADES = `${Configuracion.API_URL}/Novedades`;
  const novedad = (id: number, extra: any = {}) => ({ Id: id, Version: Configuracion.VERSION, Fecha: '2026-11-11', Categoria: 'Nuevo', Titulo: 'Título ' + id, Ambito: 'NestoApp', ...extra });
  const esperar = () => new Promise(r => setTimeout(r, 0));

  beforeEach(() => {
    alertas = [];
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    localStorage.removeItem(NovedadesNuevasService.CLAVE_LOCAL);
    TestBed.configureTestingModule({
      providers: [
        Usuario,
        { provide: AlertController, useValue: { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } } },
        { provide: NavController, useValue: nav },
        { provide: FirebaseAnalytics, useValue: { logEvent: () => { } } },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    servicio = TestBed.inject(NovedadesNuevasService);
    http = TestBed.inject(HttpTestingController);
    usuario = TestBed.inject(Usuario);
    usuario.nombre = 'marta';
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem(NovedadesNuevasService.CLAVE_LOCAL);
  });

  const contestarParametro = (valor: any, opciones?: any) => {
    const peticion = http.expectOne(r => r.method === 'GET' && r.url === PARAMETROS);
    expect(peticion.request.params.get('clave')).toBe('UltimaNovedadVistaApp');
    expect(peticion.request.params.get('usuario')).toBe('marta');
    peticion.flush(valor, opciones);
  };
  const contestarNovedades = (desdeId: string, lista: any[]) => {
    const peticion = http.expectOne(r => r.method === 'GET' && r.url === NOVEDADES);
    expect(peticion.request.params.get('ambitos')).toBe('NestoApp,NestoAPI');
    expect(peticion.request.params.get('desdeId')).toBe(desdeId);
    expect(peticion.request.params.has('todas')).toBeFalse();
    peticion.flush(lista);
  };

  it('sin sesión no pregunta nada', async () => {
    usuario.nombre = undefined;
    await servicio.comprobar();
    expect(alertas.length).toBe(0);
  });

  it('la primera vez (parámetro vacío) apunta por dónde va y no cuenta el histórico', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('');
    await esperar();
    contestarNovedades('0', [novedad(1100, { Version: '2.0.0' }), novedad(1101, { Version: '2.0.1' })]);
    await esperar();
    const put = http.expectOne(r => r.method === 'PUT' && r.url === PARAMETROS);
    expect(put.request.body.Clave).toBe('UltimaNovedadVistaApp');
    expect(put.request.body.Valor).toBe('1101');
    expect(put.request.body.Usuario).toBe('marta');
    put.flush({});
    await promesa;

    expect(alertas.length).toBe(0);
  });

  it('la primera vez sí cuenta lo que estrena la versión instalada', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('');
    await esperar();
    contestarNovedades('0', [novedad(1100, { Version: '2.0.0' }), novedad(1101), novedad(1102, { Ambito: 'NestoAPI' })]);
    await esperar();
    http.expectOne(r => r.method === 'PUT' && r.url === PARAMETROS && r.body.Valor === '1102').flush({});
    await promesa;

    expect(alertas.length).toBe(1);
    expect(alertas[0].header).toBe('Hay una novedad');
    expect(alertas[0].message).toBe('• Título 1101');
  });

  it('con novedades posteriores a la última vista, avisa, ofrece verlas y guarda la nueva última', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('1100');
    await esperar();
    contestarNovedades('1100', [novedad(1101), novedad(1102, { Ambito: 'NestoAPI', Titulo: 'Portes', Descripcion: 'Ahora van por peso.' })]);
    await esperar();
    http.expectOne(r => r.method === 'PUT' && r.url === PARAMETROS && r.body.Valor === '1102').flush({});
    await promesa;

    expect(alertas[0].header).toBe('Hay 2 novedades');
    expect(alertas[0].message).toBe('• Portes: Ahora van por peso.\n• Título 1101');
    alertas[0].buttons.find((b: any) => b.text === 'Ver novedades').handler();
    expect(nav.navigateForward).toHaveBeenCalledWith('/profile', { queryParams: { novedad: 1101, aviso: jasmine.any(Number) } });
  });

  it('las de una versión que aún no ha llegado al móvil no se avisan y la última vista no las salta', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('1100');
    await esperar();
    contestarNovedades('1100', [novedad(1101, { Version: '99.0.0' }), novedad(1102, { Ambito: 'NestoAPI' })]);
    await esperar();
    await promesa;

    expect(alertas[0].header).toBe('Hay una novedad');
    expect(alertas[0].buttons).toEqual(['Entendido']); // la de la API no está en el perfil
    // No hay PUT (http.verify): la última vista se queda en 1100 hasta que llegue la 99.0.0; la 1102 queda apuntada en el móvil
    expect(JSON.parse(localStorage.getItem(NovedadesNuevasService.CLAVE_LOCAL))).toEqual([1102]);
  });

  it('lo ya avisado en este móvil no se repite', async () => {
    localStorage.setItem(NovedadesNuevasService.CLAVE_LOCAL, '[1102]');
    const promesa = servicio.comprobar();
    contestarParametro('1100');
    await esperar();
    contestarNovedades('1100', [novedad(1101, { Version: '99.0.0' }), novedad(1102, { Ambito: 'NestoAPI' })]);
    await esperar();
    await promesa;

    expect(alertas.length).toBe(0);
  });

  it('sin nada nuevo no avisa ni guarda', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('1100');
    await esperar();
    contestarNovedades('1100', []);
    await promesa;

    expect(alertas.length).toBe(0);
  });

  it('si falta el parámetro en el servidor (404) no se enseña nada ni se pregunta más', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('no', { status: 404, statusText: 'Not Found' });
    await promesa;

    expect(alertas.length).toBe(0);
  });

  it('solo se comprueba una vez por arranque', async () => {
    const promesa = servicio.comprobar();
    contestarParametro('no', { status: 404, statusText: 'Not Found' });
    await promesa;
    await servicio.comprobar(); // sin más peticiones (http.verify)
    expect(alertas.length).toBe(0);
  });
});
