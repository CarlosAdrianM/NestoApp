import {
  RecogidaSolicitada, mensajeErrorRecogida, puedeAnularRecogida, recogidasSinResolver, solicitudValida,
  textoEstadoRecogida, textoRecogida, colorEstadoRecogida, tieneCodigoParaEnsenar
} from './recogida-solicitada.model';

describe('Recogidas solicitadas por el vendedor (#259, NestoAPI#855)', () => {
  const recogida = (extra: Partial<RecogidaSolicitada> = {}): RecogidaSolicitada => ({
    Id: 1, Empresa: '1', Cliente: '15191', Contacto: '0', NombreCliente: 'LOLA', Texto: 'El aparato X para reparar', Bultos: 1,
    FacturaOriginal: null, QuienRecoge: 'Reparto', Estado: 'Solicitada', FechaSolicitud: '2026-11-13T10:00:00',
    PedidoNota: null, CodigoDocumento: null, CodigosBultos: [], MotivoRechazo: null, ...extra
  } as RecogidaSolicitada);

  it('textoEstadoRecogida: los estados en lenguaje de usuario', () => {
    expect(textoEstadoRecogida('Solicitada')).toBe('Pendiente de confirmar');
    expect(textoEstadoRecogida('Confirmada')).toBe('Confirmada');
    expect(textoEstadoRecogida('EnReparto')).toBe('En reparto');
    expect(textoEstadoRecogida('Recogida')).toBe('Recogida');
    expect(textoEstadoRecogida('Rechazada')).toBe('Rechazada');
    expect(textoEstadoRecogida('Anulada')).toBe('Anulada');
    expect(colorEstadoRecogida('Rechazada')).toBe('danger');
    expect(colorEstadoRecogida('Recogida')).toBe('success');
  });

  it('textoRecogida: quién recoge y cuántos bultos', () => {
    expect(textoRecogida(recogida())).toBe('La recoge el reparto · 1 bulto');
    expect(textoRecogida(recogida({ QuienRecoge: 'Vendedor', Bultos: 3, FacturaOriginal: 'NV26/001234' }))).toBe('La recoge usted · 3 bultos · factura NV26/001234');
  });

  it('solo se anula mientras está pendiente o confirmada sin empezar', () => {
    expect(puedeAnularRecogida(recogida())).toBeTrue();
    expect(puedeAnularRecogida(recogida({ Estado: 'Confirmada' }))).toBeTrue();
    expect(puedeAnularRecogida(recogida({ Estado: 'EnReparto' }))).toBeFalse();
    expect(puedeAnularRecogida(recogida({ Estado: 'Rechazada' }))).toBeFalse();
  });

  it('el código de barras se enseña cuando la recoge el vendedor y ya está confirmada', () => {
    expect(tieneCodigoParaEnsenar(recogida({ QuienRecoge: 'Vendedor', Estado: 'Confirmada', CodigoDocumento: 'NR905123' }))).toBeTrue();
    expect(tieneCodigoParaEnsenar(recogida({ QuienRecoge: 'Vendedor', Estado: 'Solicitada', CodigoDocumento: null }))).toBeFalse();
    expect(tieneCodigoParaEnsenar(recogida({ QuienRecoge: 'Reparto', Estado: 'Confirmada', CodigoDocumento: 'NR905123' }))).toBeFalse();
    expect(tieneCodigoParaEnsenar(recogida({ QuienRecoge: 'Vendedor', Estado: 'Recogida', CodigoDocumento: 'NR905123' }))).toBeFalse();
  });

  it('recogidasSinResolver: las pendientes o en marcha (409 si se pide otra)', () => {
    const lista = [recogida(), recogida({ Id: 2, Estado: 'Recogida' }), recogida({ Id: 3, Estado: 'EnReparto' })];
    expect(recogidasSinResolver(lista).map(r => r.Id)).toEqual([1, 3]);
  });

  describe('solicitudValida', () => {
    it('el texto es obligatorio y de 500 como mucho; bultos de 1 a 999', () => {
      expect(solicitudValida({ Cliente: '1', Contacto: '0', Texto: '  ', Bultos: 1 })).toBe('Diga qué hay que recoger.');
      expect(solicitudValida({ Cliente: '1', Contacto: '0', Texto: 'x'.repeat(501), Bultos: 1 })).toContain('500');
      expect(solicitudValida({ Cliente: '1', Contacto: '0', Texto: 'Aparato', Bultos: 0 })).toContain('bultos');
      expect(solicitudValida({ Cliente: '1', Contacto: '0', Texto: 'Aparato', Bultos: 1000 })).toContain('bultos');
      expect(solicitudValida({ Cliente: '1', Contacto: '0', Texto: 'Aparato', Bultos: 2 })).toBe('');
    });
  });

  describe('mensajeErrorRecogida', () => {
    it('503: todavía no disponible; el resto, el Message de la API', () => {
      expect(mensajeErrorRecogida({ status: 503 })).toContain('todavía no');
      expect(mensajeErrorRecogida({ status: 404 })).toContain('todavía no');
      expect(mensajeErrorRecogida({ status: 400, error: { Message: 'Este contacto no es de ruta propia.' } })).toBe('Este contacto no es de ruta propia.');
      expect(mensajeErrorRecogida({ status: 409, error: 'Ya hay otra sin resolver.' })).toBe('Ya hay otra sin resolver.');
      expect(mensajeErrorRecogida({ status: 0 })).toContain('conexión');
    });
  });
});
