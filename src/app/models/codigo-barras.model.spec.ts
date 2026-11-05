import { esCodigoBarras, textoSinProductoCodigoBarras } from './codigo-barras.model';

/** NestoApp#262 (Nesto#582 / NestoAPI#605): buscar por código de barras. */
describe('Código de barras (#262)', () => {
  it('EAN-8, UPC-A, EAN-13 e ITF-14 son códigos de barras', () => {
    expect(esCodigoBarras('8437017506362')).toBeTrue();
    expect(esCodigoBarras('12345678')).toBeTrue();
    expect(esCodigoBarras('012345678905')).toBeTrue();
    expect(esCodigoBarras('18437017506369')).toBeTrue();
    expect(esCodigoBarras(' 8437017506362 ')).toBeTrue();
  });

  it('una referencia nuestra o un texto no lo son', () => {
    expect(esCodigoBarras('38093')).toBeFalse();
    expect(esCodigoBarras('CERA ROSETA')).toBeFalse();
    expect(esCodigoBarras('843701750636X')).toBeFalse();
    expect(esCodigoBarras('')).toBeFalse();
    expect(esCodigoBarras(null)).toBeFalse();
  });

  it('el aviso cuando no hay producto', () => {
    expect(textoSinProductoCodigoBarras('8437017506362')).toBe('No hay ningún producto con el código de barras 8437017506362');
  });
});
