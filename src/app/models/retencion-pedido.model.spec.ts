import { RetencionPedido, hastaFechaParaApi, nombreUsuarioSinDominio, numerosRetenidos, textoRetencion } from './retencion-pedido.model';

/** NestoApp#254 / NestoAPI#698: retener un pedido hasta nuevo aviso. */
describe('Retención de un pedido (#254)', () => {
  const retencion: RetencionPedido = {
    Id: 1, Empresa: '1', Pedido: 929057, Motivo: 'El cliente lo quiere para noviembre', HastaFecha: '2026-11-15T00:00:00',
    ModoServicioAnterior: 3, Usuario: 'NUEVAVISION\\Alfredo', Fecha: '2026-10-22T10:00:00', Liberado: null,
    UsuarioLiberacion: null, MotivoLiberacion: null, UltimoRecordatorio: null
  };

  it('el aviso quita el dominio y dice desde cuándo y hasta cuándo', () => {
    expect(textoRetencion(retencion)).toBe('Retenido por Alfredo desde el 22/10/2026 hasta el 15/11/2026: El cliente lo quiere para noviembre');
  });

  it('sin fecha, «hasta nuevo aviso»', () => {
    expect(textoRetencion({ ...retencion, HastaFecha: null, Motivo: '' })).toBe('Retenido por Alfredo desde el 22/10/2026 hasta nuevo aviso');
    expect(textoRetencion(null)).toBe('');
  });

  it('el usuario sin dominio', () => {
    expect(nombreUsuarioSinDominio('NUEVAVISION\\Marta')).toBe('Marta');
    expect(nombreUsuarioSinDominio('Marta')).toBe('Marta');
    expect(nombreUsuarioSinDominio('')).toBe('alguien');
  });

  it('la fecha del diálogo va solo con el día, y vacía es «hasta nuevo aviso»', () => {
    expect(hastaFechaParaApi('2026-11-15T00:00:00+01:00')).toBe('2026-11-15');
    expect(hastaFechaParaApi('')).toBeNull();
    expect(hastaFechaParaApi(null)).toBeNull();
  });

  it('los números retenidos para marcar la lista (solo los vivos)', () => {
    const numeros = numerosRetenidos([
      { ...retencion, Cliente: '1', NombreCliente: '', Vendedor: 'NV' },
      { ...retencion, Pedido: 1, Liberado: '2026-10-23', Cliente: '1', NombreCliente: '', Vendedor: 'NV' }
    ]);
    expect(numeros.has(929057)).toBeTrue();
    expect(numeros.has(1)).toBeFalse();
    expect(numerosRetenidos(null).size).toBe(0);
  });
});
