import { esFechaSinDeterminar, textoFechaEntrega, TEXTO_SIN_FECHA } from './fechas';

/** NestoApp#240 (novedad 715 de Marta): las notas de entrega automáticas nacen con fecha 31/12/2099. */
describe('Fecha de entrega sin determinar (#240)', () => {
  it('el 31/12/2099 es «sin determinar»', () => {
    expect(esFechaSinDeterminar('2099-12-31T00:00:00')).toBeTrue();
    expect(esFechaSinDeterminar(new Date(2099, 11, 31))).toBeTrue();
  });

  it('una fecha normal no lo es', () => {
    expect(esFechaSinDeterminar('2026-10-22T00:00:00')).toBeFalse();
    expect(esFechaSinDeterminar(null)).toBeFalse();
    expect(esFechaSinDeterminar('no es fecha')).toBeFalse();
  });

  it('se enseña «Sin fecha» en vez de 31/12/99', () => {
    expect(textoFechaEntrega('2099-12-31T00:00:00')).toBe(TEXTO_SIN_FECHA);
  });

  it('las demás fechas, con el año de cuatro cifras', () => {
    expect(textoFechaEntrega('2026-10-22T00:00:00')).toBe('22/10/2026');
    expect(textoFechaEntrega(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('sin fecha, nada', () => {
    expect(textoFechaEntrega(null)).toBe('');
    expect(textoFechaEntrega(undefined)).toBe('');
  });
});
