import { SugerenciaOferta, esAccionable, resumenSugerencias } from './sugerencias-ofertas.model';

/**
 * NestoApp#169 / NestoAPI#457. Aquí solo se prueba qué se puede aplicar de un toque y el texto
 * del plegable: las reglas de ofertas y los mensajes son del servidor.
 */
describe('Sugerencias de ofertas (#169)', () => {
  const sugerencia = (extra: Partial<SugerenciaOferta>): SugerenciaOferta => ({
    Tipo: 'AmpliarCantidad', Producto: '38093', CantidadActual: 5, CantidadSugerida: 6,
    CantidadRegalo: 1, ImporteQueFalta: 0, ImportePedido: 0, Texto: 'Con 1 unidad más te llevas la séptima',
    Descuento: 0, ...extra
  });

  it('una sugerencia con producto y cantidad se puede aplicar', () => {
    expect(esAccionable(sugerencia({}))).toBeTrue();
  });

  it('la de llegar a un importe de pedido solo informa', () => {
    const porImporte = sugerencia({
      Tipo: 'AmpliarImporte', Producto: null, CantidadActual: 0, CantidadSugerida: 0,
      ImporteQueFalta: 12, ImportePedido: 200, Texto: 'Añadiendo 12,00 € llegas al regalo'
    });

    expect(esAccionable(porImporte)).toBeFalse();
  });

  it('el resumen cuenta las sugerencias en singular y plural', () => {
    expect(resumenSugerencias([])).toBe('');
    expect(resumenSugerencias([sugerencia({})])).toBe('1 oferta sin aplicar');
    expect(resumenSugerencias([sugerencia({}), sugerencia({})])).toBe('2 ofertas sin aplicar');
  });

  it('sin lista no se rompe', () => {
    expect(resumenSugerencias(null)).toBe('');
    expect(esAccionable(null)).toBeFalse();
  });
});
