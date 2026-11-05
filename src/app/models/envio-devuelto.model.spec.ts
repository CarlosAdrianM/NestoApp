import { EnvioDevuelto, enviosDevueltosVisibles, estaDecidido, textoDecisionEnvio, textoEstadoEnvioDevuelto, textoResultadoDecision } from './envio-devuelto.model';

/** NestoApp#267 (NestoAPI#699, corte 2): envíos devueltos y la decisión del vendedor. */
describe('Envíos devueltos (#267)', () => {
  const envio = (cambios: Partial<EnvioDevuelto> = {}): EnvioDevuelto => ({
    Numero: 123, Empresa: '1', Cliente: '15191', Contacto: '0', Pedido: 929498, Estado: 4, Fecha: '2026-11-03T00:00:00',
    Nombre: 'PELUQUERÍA X', Vendedor: 'JM', Decision: 'SinDecidir', ...cambios
  });

  it('devuelto o con incidencia', () => {
    expect(textoEstadoEnvioDevuelto(4)).toBe('Devuelto');
    expect(textoEstadoEnvioDevuelto(3)).toBe('Con incidencia');
  });

  it('sin decidir no hay texto de decisión', () => {
    expect(estaDecidido(envio())).toBeFalse();
    expect(textoDecisionEnvio(envio())).toBe('');
  });

  it('reenviado: el envío nuevo, si tiene etiqueta y quién lo decidió', () => {
    expect(textoDecisionEnvio(envio({ Decision: 'Reenviar', EnvioNuevo: 124, EnvioNuevoConEtiqueta: false, UsuarioDecision: 'NUEVAVISION\\Marta', FechaDecision: '2026-11-04T09:00:00' })))
      .toBe('Ya se decidió volver a enviarlo: envío nuevo 124 (pendiente de etiqueta: el almacén la imprime cuando llega la caja). Lo decidió NUEVAVISION\\Marta el 04/11/2026.');
    expect(textoDecisionEnvio(envio({ Decision: 'Abonar', UsuarioDecision: 'Carlos' }))).toBe('Ya se decidió abonarlo: el almacén hace el abono. Lo decidió Carlos.');
    expect(textoDecisionEnvio(envio({ Decision: 'EntregadoPorLaAgencia', EnvioAnulado: 124 }))).toBe('La agencia acabó entregando el envío original; el reenvío 124 se anuló.');
  });

  it('la lista del vendedor: los suyos, sin decidir primero y luego los más recientes', () => {
    const lista = [
      envio({ Numero: 1, Decision: 'Abonar', Fecha: '2026-11-04' }),
      envio({ Numero: 2, Vendedor: 'OTRO', Fecha: '2026-11-02' }),
      envio({ Numero: 3, Fecha: '2026-11-01' }),
      envio({ Numero: 4, Fecha: '2026-11-03', Vendedor: ' jm ' })
    ];
    expect(enviosDevueltosVisibles(lista, 'JM', true).map(e => e.Numero)).toEqual([4, 3, 1]);
    expect(enviosDevueltosVisibles(lista, 'JM', false).map(e => e.Numero)).toEqual([4, 2, 3, 1]);
    expect(enviosDevueltosVisibles(lista, null, true).length).toBe(4);
    expect(enviosDevueltosVisibles(null, 'JM', true)).toEqual([]);
  });

  it('lo que se le dice tras decidir', () => {
    expect(textoResultadoDecision({ EnvioOrigen: 123, Pedido: 929498, Decision: 'Reenviar', EnvioNuevo: 124, PortesIncluidos: true, Avisos: ['El reembolso se mantiene.'] }))
      .toBe('Se ha creado el envío nuevo 124 del pedido 929498. El almacén lo tramita cuando llegue la caja devuelta.\n\nSe le cobran los portes del reenvío.\n\nEl reembolso se mantiene.');
    expect(textoResultadoDecision({ EnvioOrigen: 123, Decision: 'Abonar' })).toBe('Se ha anotado que el cliente no lo quiere: el almacén hará el abono.');
    expect(textoResultadoDecision(null)).toBe('');
  });
});
