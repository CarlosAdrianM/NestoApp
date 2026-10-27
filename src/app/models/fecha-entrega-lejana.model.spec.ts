import { conConfirmacionFechaLejana, leerFechaEntregaLejana } from './fecha-entrega-lejana.model';

/** NestoApp#252 / NestoAPI#712 (pedido 929057 con fecha 27/10/2027 por error). */
describe('Aviso de fecha de entrega lejana (#252)', () => {
  const error400 = {
    statusCode: 400,
    apiError: {
      error: {
        code: 'FECHA_ENTREGA_LEJANA',
        message: 'La fecha de entrega de las líneas es el miércoles 27/10/2027 (dentro de 365 días). ¿Es correcta?',
        timestamp: '',
        details: { empresa: '1', pedido: 0, fechaEntrega: '2027-10-27', dias: 365, lineas: 2 }
      }
    }
  };

  it('lee la pregunta de la API y sus detalles', () => {
    const aviso = leerFechaEntregaLejana(error400);
    expect(aviso.mensaje).toContain('¿Es correcta?');
    expect(aviso.fechaEntrega).toBe('2027-10-27');
    expect(aviso.dias).toBe(365);
    expect(aviso.lineas).toBe(2);
  });

  it('cualquier otro error no es un aviso de fecha', () => {
    expect(leerFechaEntregaLejana({ statusCode: 400, apiError: { error: { code: 'PEDIDO_VALIDACION_FALLO', message: 'x' } } })).toBeNull();
    expect(leerFechaEntregaLejana({ statusCode: 500 })).toBeNull();
    expect(leerFechaEntregaLejana(null)).toBeNull();
  });

  it('sin detalles sigue valiendo (solo la pregunta)', () => {
    const aviso = leerFechaEntregaLejana({ apiError: { error: { code: 'FECHA_ENTREGA_LEJANA', message: '¿Seguro?' } } });
    expect(aviso.mensaje).toBe('¿Seguro?');
    expect(aviso.fechaEntrega).toBeNull();
    expect(aviso.dias).toBeNull();
  });

  it('el pedido se manda con la confirmación que toque, sin tocar el original', () => {
    const pedido: any = { numero: 1, Lineas: [] };
    expect(conConfirmacionFechaLejana(pedido, false).ConfirmarFechaEntregaLejana).toBeFalse();
    expect(conConfirmacionFechaLejana(pedido, true).ConfirmarFechaEntregaLejana).toBeTrue();
    expect((pedido as any).ConfirmarFechaEntregaLejana).toBeUndefined();
  });
});
