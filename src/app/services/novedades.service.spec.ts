import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { NovedadesService, Novedad, agruparPorVersion, colorCategoria, aplicarVoto, tieneFeedback } from './novedades.service';

/**
 * NestoApp#177: las novedades del perfil salen de la tabla Novedades de la API (Nesto#372)
 * en vez del HTML hardcodeado. #186: se piden con ?ambito=NestoApp (NestoAPI#489).
 */
describe('NovedadesService (#177)', () => {
  let service: NovedadesService;
  let httpMock: HttpTestingController;

  const novedadBase = (extra: Partial<Novedad>): Novedad => ({
    Id: 1, Version: '2.20.1', Fecha: '2026-09-16', Categoria: 'Nuevo',
    Titulo: 'Título', Descripcion: '', Ambito: 'NestoApp', ...extra
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NovedadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('pide solo las de NestoApp con ?ambito=NestoApp (#186) y no filtra en cliente', () => {
    let resultado: Novedad[] = [];
    service.leerNovedades().subscribe(n => resultado = n);

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades'));
    expect(req.request.method).toBe('GET');
    // #186: sin ámbito, NestoAPI (#489) devuelve las del escritorio y nunca las de la app
    expect(req.request.params.get('ambito')).toBe('NestoApp');
    // Sin desdeVersion: el perfil enseña el histórico completo
    expect(req.request.params.has('desdeVersion')).toBeFalse();
    req.flush([
      novedadBase({ Id: 2, Version: '2.20.5', Titulo: 'Cosa de la app', Ambito: 'NestoApp' }),
      novedadBase({ Id: 1, Version: '2.20.1', Titulo: 'Otra de la app', Ambito: 'NestoApp' })
    ]);

    expect(resultado.map(n => n.Titulo)).toEqual(['Cosa de la app', 'Otra de la app']);
  });

  it('una respuesta vacía o rara devuelve lista vacía sin reventar', () => {
    let resultado: Novedad[] | undefined;
    service.leerNovedades().subscribe(n => resultado = n);

    httpMock.expectOne(r => r.url.endsWith('/Novedades')).flush(null);

    expect(resultado).toEqual([]);
  });
});

describe('agruparPorVersion (#177)', () => {
  const novedad = (version: string, titulo: string, fecha: string = '2026-09-16'): Novedad => ({
    Id: 0, Version: version, Fecha: fecha, Categoria: 'Nuevo', Titulo: titulo, Descripcion: '', Ambito: 'NestoApp'
  });

  it('agrupa por versión conservando el orden del servidor', () => {
    const grupos = agruparPorVersion([
      novedad('2.20.1', 'a'),
      novedad('2.20.1', 'b'),
      novedad('2.20.0', 'c')
    ]);

    expect(grupos.map(g => g.version)).toEqual(['2.20.1', '2.20.0']);
    expect(grupos[0].novedades.map(n => n.Titulo)).toEqual(['a', 'b']);
    expect(grupos[1].novedades.map(n => n.Titulo)).toEqual(['c']);
  });

  it('la fecha del grupo es la de su primera entrada', () => {
    const grupos = agruparPorVersion([
      novedad('2.20.1', 'a', '2026-09-16'),
      novedad('2.20.1', 'b', '2026-09-17')
    ]);

    expect(grupos[0].fecha).toBe('2026-09-16');
  });

  it('con lista vacía devuelve vacío', () => {
    expect(agruparPorVersion([])).toEqual([]);
  });
});

describe('colorCategoria (#177)', () => {
  it('mapea las categorías a los colores de siempre (sin tocar la paleta)', () => {
    expect(colorCategoria('Nuevo')).toBe('success');
    expect(colorCategoria('Mejorado')).toBe('primary');
    expect(colorCategoria('Corregido')).toBe('warning');
    expect(colorCategoria('Otra cosa')).toBe('medium');
  });
});

/**
 * NestoApp#188 / NestoAPI#520: votos y comentarios con captura en cada novedad del perfil.
 */
describe('Feedback de las novedades (#188)', () => {
  let service: NovedadesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(NovedadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('el voto va por PUT api/Novedades/{id}/Voto con el valor (0 = quitar)', () => {
    service.votar(7, 0).subscribe();
    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/7/Voto'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ Voto: 0 });
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('los comentarios se leen, se crean y se borran en sus rutas', () => {
    service.leerComentarios(7).subscribe();
    expect(httpMock.expectOne(r => r.url.endsWith('/Novedades/7/Comentarios') && r.method === 'GET')).toBeTruthy();

    service.crearComentario(7, { Texto: 'Muy útil', VersionCliente: '2.20.6' }).subscribe();
    const post = httpMock.expectOne(r => r.url.endsWith('/Novedades/7/Comentarios') && r.method === 'POST');
    expect(post.request.body).toEqual({ Texto: 'Muy útil', VersionCliente: '2.20.6' });

    service.borrarComentario(12).subscribe();
    expect(httpMock.expectOne(r => r.url.endsWith('/Novedades/Comentarios/12') && r.method === 'DELETE')).toBeTruthy();

    service.leerImagenComentario(12).subscribe();
    const imagen = httpMock.expectOne(r => r.url.endsWith('/Novedades/Comentarios/12/Imagen'));
    expect(imagen.request.responseType).toBe('blob');
  });

  const novedad = (extra: Partial<Novedad> = {}): Novedad => ({
    Id: 1, Version: '2.20.5', Fecha: '2026-09-22', Categoria: 'Nuevo', Titulo: 't', Ambito: 'NestoApp',
    VotosPositivos: 3, VotosNegativos: 1, MiVoto: null, NumeroComentarios: 0, ...extra
  });

  it('sin los contadores de la API (tablas sin crear) no hay feedback', () => {
    expect(tieneFeedback(novedad())).toBeTrue();
    expect(tieneFeedback(novedad({ VotosPositivos: undefined }))).toBeFalse();
    expect(tieneFeedback(novedad({ VotosPositivos: null as any }))).toBeFalse();
  });

  it('votar sin voto previo suma y lo apunta como mío', () => {
    const r = aplicarVoto(novedad(), 1);
    expect(r.voto).toBe(1);
    expect(r.novedad.VotosPositivos).toBe(4);
    expect(r.novedad.MiVoto).toBe(1);
  });

  it('pulsar el mismo voto lo quita', () => {
    const r = aplicarVoto(novedad({ MiVoto: 1 }), 1);
    expect(r.voto).toBe(0);
    expect(r.novedad.VotosPositivos).toBe(2);
    expect(r.novedad.MiVoto).toBeNull();
  });

  it('pulsar el otro lo cambia', () => {
    const r = aplicarVoto(novedad({ MiVoto: 1 }), -1);
    expect(r.voto).toBe(-1);
    expect(r.novedad.VotosPositivos).toBe(2);
    expect(r.novedad.VotosNegativos).toBe(2);
    expect(r.novedad.MiVoto).toBe(-1);
  });
});

describe('Sugerencias y buscador de novedades (#190)', () => {
  let service: NovedadesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(NovedadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('las sugerencias se piden de la app y en el orden de la API (votos), sin reordenar', () => {
    let recibidas: Novedad[] = [];
    service.leerSugerencias().subscribe(s => recibidas = s);

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/Sugerencias') && r.method === 'GET');
    expect(req.request.params.get('ambito')).toBe('NestoApp');
    req.flush([
      { Id: 9, Version: null, Titulo: 'Muy votada', VotosPositivos: 5, VotosNegativos: 0 },
      { Id: 8, Version: null, Titulo: 'Poco votada', VotosPositivos: 1, VotosNegativos: 0 }
    ]);

    expect(recibidas.map(s => s.Id)).toEqual([9, 8]);
  });

  it('una sugerencia nueva va por POST con texto, imagen y versión', () => {
    service.crearSugerencia({ Texto: 'Filtro por ruta', ImagenBase64: 'data:image/png;base64,AAAA', ImagenTipo: 'image/png', VersionCliente: '2.20.8' }).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/Sugerencias') && r.method === 'POST');
    expect(req.request.body.Texto).toBe('Filtro por ruta');
    expect(req.request.body.ImagenTipo).toBe('image/png');
    req.flush({ Id: 360, Version: null });
  });

  it('la captura de una sugerencia se baja como blob (lleva JWT)', () => {
    service.leerImagenNovedad(360).subscribe();

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/360/Imagen'));
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['x']));
  });

  it('el buscador manda el texto y el ámbito', () => {
    let resultados: Novedad[] = [];
    service.buscar('reembolso envío').subscribe(r => resultados = r);

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/Buscar'));
    expect(req.request.params.get('texto')).toBe('reembolso envío');
    expect(req.request.params.get('ambito')).toBe('NestoApp');
    req.flush(null);

    expect(resultados).toEqual([]);
  });
});

describe('Mencionables (#194)', () => {
  let service: NovedadesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });
    service = TestBed.inject(NovedadesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('se piden una sola vez, con el ámbito de la app', () => {
    let primera: any[] = [];
    let segunda: any[] = [];
    service.leerMencionables().subscribe(m => primera = m);
    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades/Mencionables'));
    expect(req.request.params.get('ambito')).toBe('NestoApp');
    req.flush([{ Nombre: 'Carlos', Clave: 'Carlos', Aplicacion: 'NestoApp' }]);

    service.leerMencionables().subscribe(m => segunda = m);

    expect(primera.length).toBe(1);
    expect(segunda.length).toBe(1);
  });

  it('si fallan, lista vacía y se vuelven a pedir la próxima vez', () => {
    let recibidos: any[] = null;
    service.leerMencionables().subscribe(m => recibidos = m);
    httpMock.expectOne(r => r.url.endsWith('/Novedades/Mencionables')).flush('x', { status: 500, statusText: 'Error' });
    expect(recibidos).toEqual([]);

    service.leerMencionables().subscribe();
    httpMock.expectOne(r => r.url.endsWith('/Novedades/Mencionables')).flush([]);
  });
});
