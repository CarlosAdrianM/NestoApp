import { objetoDeQueryParam } from './query-param';

describe('objetoDeQueryParam', () => {
  it('devuelve el objeto tal cual cuando llega como objeto (navegación nativa / en memoria)', () => {
    const obj = { descuento: 0.1, Producto: '12345' };
    expect(objetoDeQueryParam(obj)).toBe(obj);
  });

  it('devuelve null ante la cadena "[object Object]" (build Web tras recarga) — causa de #155', () => {
    expect(objetoDeQueryParam('[object Object]')).toBeNull();
  });

  it('parsea una cadena JSON válida a objeto', () => {
    const resultado = objetoDeQueryParam('{"Tipo":"V","Cliente":"1"}');
    expect(resultado).toEqual({ Tipo: 'V', Cliente: '1' });
  });

  it('devuelve null para undefined/null', () => {
    expect(objetoDeQueryParam(undefined)).toBeNull();
    expect(objetoDeQueryParam(null)).toBeNull();
  });

  it('devuelve null para cadenas escalares no-JSON', () => {
    expect(objetoDeQueryParam('ALG')).toBeNull();
    expect(objetoDeQueryParam('123')).toBeNull(); // JSON.parse('123') es number, no objeto
  });
});
