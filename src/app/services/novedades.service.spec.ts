import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { NovedadesService, Novedad, agruparPorVersion, colorCategoria } from './novedades.service';

/**
 * NestoApp#177: las novedades del perfil salen de la tabla Novedades de la API (Nesto#372)
 * en vez del HTML hardcodeado. Hasta que NestoAPI#489 esté publicado, el GET baja todo y
 * se filtra Ambito === 'NestoApp' en el cliente (chapuza temporal).
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

  it('descarta las novedades que no son de NestoApp (chapuza hasta NestoAPI#489)', () => {
    let resultado: Novedad[] = [];
    service.leerNovedades().subscribe(n => resultado = n);

    const req = httpMock.expectOne(r => r.url.endsWith('/Novedades'));
    expect(req.request.method).toBe('GET');
    // Sin desdeVersion: el servidor compararía versiones de Nesto (1.10.x) con las de la app (2.x)
    expect(req.request.params.has('desdeVersion')).toBeFalse();
    req.flush([
      novedadBase({ Id: 1, Version: '1.10.28.0', Titulo: 'Cosa de Nesto', Ambito: 'Nesto' }),
      novedadBase({ Id: 2, Version: '2.20.1', Titulo: 'Cosa de la app', Ambito: 'NestoApp' }),
      novedadBase({ Id: 3, Version: '1.10.28.0', Titulo: 'Cosa de la API', Ambito: 'NestoAPI' })
    ]);

    expect(resultado.length).toBe(1);
    expect(resultado[0].Titulo).toBe('Cosa de la app');
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
