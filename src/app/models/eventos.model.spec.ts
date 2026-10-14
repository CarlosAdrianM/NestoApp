import { Evento, eventosInscribibles, seGeneraEnlace, textoPlazas } from './eventos.model';

/** NestoApp#217 (NestoAPI#611): eventos a los que se puede inscribir a un cliente. */
describe('Eventos inscribibles (#217)', () => {
  const evento = (id: number, fecha: string, cambios: Partial<Evento> = {}): Evento => ({
    Id: id, Empresa: '1', Titulo: 'Curso ' + id, Fecha: fecha, ImporteSenal: 50, Activo: true, Plazas: 10, PlazasOcupadas: 3, ...cambios
  });
  const hoy = new Date(2026, 9, 14);

  it('solo activos, de hoy en adelante y con plaza, por fecha', () => {
    const lista = eventosInscribibles([
      evento(1, '2026-11-02T10:00:00'),
      evento(2, '2026-10-13T10:00:00'),
      evento(3, '2026-10-14T18:00:00'),
      evento(4, '2026-10-20T10:00:00', { Activo: false }),
      evento(5, '2026-10-21T10:00:00', { Plazas: 5, PlazasOcupadas: 5 }),
      evento(6, '2026-10-22T10:00:00', { Plazas: null })
    ], hoy);
    expect(lista.map(e => e.Id)).toEqual([3, 6, 1]);
  });

  it('plazas que quedan (nada si no hay límite)', () => {
    expect(textoPlazas(evento(1, '2026-11-02', { Plazas: 10, PlazasOcupadas: 9 }))).toBe('Queda 1 plaza');
    expect(textoPlazas(evento(1, '2026-11-02'))).toBe('Quedan 7 plazas');
    expect(textoPlazas(evento(1, '2026-11-02', { Plazas: null }))).toBe('');
  });

  it('el enlace de pago solo con tarjeta', () => {
    expect(seGeneraEnlace('Tarjeta', true)).toBeTrue();
    expect(seGeneraEnlace(null, true)).toBeTrue();
    expect(seGeneraEnlace('Transferencia', true)).toBeFalse();
    expect(seGeneraEnlace('Tarjeta', false)).toBeFalse();
  });
});
