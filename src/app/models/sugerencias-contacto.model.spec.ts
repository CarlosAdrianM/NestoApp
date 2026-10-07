import { SugerenciaContacto, colorPrioridad, marcarAtendida, ordenarSugerenciasContacto, telefonoParaLlamar } from './sugerencias-contacto.model';

const sugerencia = (cliente: string, orden: number, atendida = false): SugerenciaContacto => ({
  SugerenciaId: orden, Cliente: cliente, Contacto: '0', Nombre: 'Cliente ' + cliente, Direccion: '', Poblacion: '',
  Telefono: '', Prioridad: 'Alta', Orden: orden, Motivo: '', Probabilidad: 0.5, DiasDesdeUltimoContacto: null,
  DiasDesdeUltimoPedido: 30, CadenciaDias: 15, PedidosUltimos12Meses: 4, ImporteUltimos12Meses: 1000, Atendida: atendida
});

describe('sugerencias-contacto.model (#212)', () => {
  it('ordena las pendientes por Orden y deja las atendidas al final', () => {
    const lista = [sugerencia('3', 3), sugerencia('1', 1, true), sugerencia('2', 2), sugerencia('4', 4, true)];

    expect(ordenarSugerenciasContacto(lista).map(s => s.Cliente)).toEqual(['2', '3', '1', '4']);
  });

  it('sin Orden (0) va detrás y respeta el orden de llegada', () => {
    const lista = [sugerencia('a', 0), sugerencia('b', 0), sugerencia('c', 1)];

    expect(ordenarSugerenciasContacto(lista).map(s => s.Cliente)).toEqual(['c', 'a', 'b']);
  });

  it('una lista nula se queda en vacía', () => {
    expect(ordenarSugerenciasContacto(null)).toEqual([]);
  });

  it('al crear el rapport la sugerencia queda atendida y baja al final, sin tocar la original', () => {
    const lista = [sugerencia('1', 1), sugerencia('2', 2)];

    const resultado = marcarAtendida(lista, '1  ', '0 ');

    expect(resultado.map(s => s.Cliente)).toEqual(['2', '1']);
    expect(resultado[1].Atendida).toBeTrue();
    expect(lista[0].Atendida).toBeFalse();
  });

  it('un rapport de otro cliente no marca nada', () => {
    expect(marcarAtendida([sugerencia('1', 1)], '9', '0')[0].Atendida).toBeFalse();
  });

  it('cada prioridad tiene su color', () => {
    expect(colorPrioridad('Máxima')).toBe('danger');
    expect(colorPrioridad('Alta')).toBe('warning');
    expect(colorPrioridad('Media')).toBe('primary');
    expect(colorPrioridad('Baja')).toBe('medium');
  });

  it('para llamar se usa el primer teléfono y solo sus cifras', () => {
    expect(telefonoParaLlamar('91 123 45 67 / 600 11 22 33')).toBe('911234567');
    expect(telefonoParaLlamar('+34 600-11-22-33')).toBe('+34600112233');
    expect(telefonoParaLlamar(null)).toBe('');
  });
});
