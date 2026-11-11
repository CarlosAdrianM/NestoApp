import { Novedad } from '../services/novedades.service';
import { novedadesDeLaVersionInstalada, novedadesParaAvisar, seVeEnElPerfil, siguienteUltimaNovedadVista, textoAvisoNovedades, ultimaNovedadVistaDe } from './novedades-nuevas.model';

/** NestoApp#177 fase 2 (NestoAPI#495): el aviso «qué hay de nuevo», por Id. */
describe('Aviso de novedades nuevas (#177 fase 2)', () => {
  const novedad = (id: number, extra: Partial<Novedad> = {}): Novedad => ({
    Id: id, Version: '2.28.0', Fecha: '2026-11-11', Categoria: 'Nuevo', Titulo: 'Título ' + id, Ambito: 'NestoApp', ...extra
  });

  it('se avisan las de la app de la versión instalada o anteriores y las de NestoAPI, de la más nueva a la más antigua', () => {
    const nuevas = [novedad(10), novedad(11, { Ambito: 'NestoAPI', Version: '11.11.26' }), novedad(12, { Version: '2.27.0' })];
    expect(novedadesParaAvisar(nuevas, '2.28.0').map(n => n.Id)).toEqual([12, 11, 10]);
  });

  it('las de una versión de la app que aún no ha llegado al móvil no se avisan todavía; las sugerencias, nunca', () => {
    const nuevas = [novedad(10), novedad(11, { Version: '2.29.0' }), novedad(12, { Version: null })];
    expect(novedadesParaAvisar(nuevas, '2.28.0').map(n => n.Id)).toEqual([10]);
  });

  it('las ya avisadas en este móvil no se repiten', () => {
    expect(novedadesParaAvisar([novedad(10), novedad(11)], '2.28.0', [10]).map(n => n.Id)).toEqual([11]);
    expect(novedadesParaAvisar(null, '2.28.0')).toEqual([]);
  });

  it('se da por visto hasta el Id mayor (sugerencias incluidas)', () => {
    expect(siguienteUltimaNovedadVista([novedad(10), novedad(12, { Version: null }), novedad(11)], '2.28.0', 5)).toBe(12);
  });

  it('si alguna de la app aún no ha llegado, se queda justo antes de la primera de esas', () => {
    const nuevas = [novedad(10), novedad(11, { Version: '2.29.0' }), novedad(12, { Ambito: 'NestoAPI' }), novedad(13, { Version: '2.29.0' })];
    expect(siguienteUltimaNovedadVista(nuevas, '2.28.0', 5)).toBe(10);
  });

  it('nunca retrocede; sin nuevas se queda donde estaba', () => {
    expect(siguienteUltimaNovedadVista([novedad(3, { Version: '2.29.0' })], '2.28.0', 5)).toBe(5);
    expect(siguienteUltimaNovedadVista([], '2.28.0', 5)).toBe(5);
  });

  it('el parámetro vacío o raro es «nunca ha visto nada»', () => {
    expect(ultimaNovedadVistaDe('')).toBeNull();
    expect(ultimaNovedadVistaDe(null)).toBeNull();
    expect(ultimaNovedadVistaDe('abc')).toBeNull();
    expect(ultimaNovedadVistaDe(' 1101 ')).toBe(1101);
    expect(ultimaNovedadVistaDe('0')).toBe(0);
  });

  it('el texto: un título por línea y cuántas más', () => {
    expect(textoAvisoNovedades([novedad(1), novedad(2)])).toBe('• Título 1\n• Título 2');
    expect(textoAvisoNovedades([novedad(1), novedad(2), novedad(3), novedad(4)], 2)).toBe('• Título 1\n• Título 2\ny 2 más');
    expect(textoAvisoNovedades([novedad(1), novedad(2), novedad(3)], 2)).toBe('• Título 1\n• Título 2\ny 1 más');
  });

  it('las que no son de la app no salen en el perfil: su explicación va en el aviso', () => {
    const deLaApi = novedad(5, { Ambito: 'NestoAPI', Titulo: 'Portes', Descripcion: ' Desde hoy los portes se calculan por peso. ' });
    expect(seVeEnElPerfil(deLaApi)).toBeFalse();
    expect(seVeEnElPerfil(novedad(1))).toBeTrue();
    expect(textoAvisoNovedades([novedad(1, { Descripcion: 'No sale' }), deLaApi])).toBe('• Título 1\n• Portes: Desde hoy los portes se calculan por peso.');
  });

  it('la primera vez solo se cuenta lo que estrena la versión instalada, no el histórico ni lo de la API', () => {
    const todas = [novedad(1, { Version: '2.20.0' }), novedad(2, { Version: '2.28.0' }), novedad(3, { Ambito: 'NestoAPI', Version: '2.28.0' }), novedad(4, { Version: '2.29.0' })];
    expect(novedadesDeLaVersionInstalada(todas, '2.28.0').map(n => n.Id)).toEqual([2]);
  });
});
