import { BultoPedido, enlacePublicoFotoBulto, textoBulto } from './bultos-pedido.model';

/** NestoApp#223 (Nesto#522): fotos del packing de cada bulto. */
describe('Bultos del pedido (#223)', () => {
  const bulto = (cambios: Partial<BultoPedido> = {}): BultoPedido => ({
    Id: 17, Empresa: '1', Pedido: 926940, Picking: 5, Bulto: 2, Peso: 3.4, TieneFoto: true, NumeroEnvio: 81234,
    Usuario: 'NUEVAVISION\\mozo', FechaFoto: '2026-10-09T10:00:00', RutaFotoPublica: 'api/Almacen/Fotos/17-abc', ...cambios
  });

  it('el enlace público es el servidor más la ruta que da la API', () => {
    expect(enlacePublicoFotoBulto(bulto(), 'https://api.nuevavision.es')).toBe('https://api.nuevavision.es/api/Almacen/Fotos/17-abc');
    expect(enlacePublicoFotoBulto(bulto({ RutaFotoPublica: null }), 'https://api.nuevavision.es')).toBeNull();
  });

  it('describe el bulto con peso y envío si los hay', () => {
    expect(textoBulto(bulto())).toBe('Bulto 2 · 3,40 kg · envío 81234');
    expect(textoBulto(bulto({ Peso: null, NumeroEnvio: null }))).toBe('Bulto 2');
  });
});
