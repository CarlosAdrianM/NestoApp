import {
  Evento, eventosInscribibles, seGeneraEnlace, textoPlazas, esLineaCurso, sinLineasCurso, textoPedidosCreados,
  textoModalidadCurso, textoFormatoEvento, textoPlazasLibres, modalidadesConImporte, nombreModalidadEvento
} from './eventos.model';

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

/** NestoApp#244 / NestoAPI#691 (Nesto#543): vender cursos desde la plantilla. */
describe('Cursos en la plantilla (#244)', () => {
  it('una línea es un curso si viene marcada EsCurso, lleva evento o es del grupo CUR', () => {
    expect(esLineaCurso({ producto: '90077', EsCurso: true })).toBeTrue();
    expect(esLineaCurso({ producto: '90077', eventoId: 12 })).toBeTrue();
    expect(esLineaCurso({ producto: '90077', grupo: 'cur ' })).toBeTrue();
    expect(esLineaCurso({ producto: '38093', grupo: 'COS' })).toBeFalse();
    expect(esLineaCurso(null)).toBeFalse();
  });

  it('los cálculos del pedido de productos van sin los cursos', () => {
    const lineas = [{ producto: 'A', grupo: 'COS', precio: 100 }, { producto: 'C', grupo: 'CUR', precio: 150 }];
    expect(sinLineasCurso(lineas).map(l => l.producto)).toEqual(['A']);
  });

  it('la modalidad se enseña con su importe', () => {
    expect(textoModalidadCurso({ Modalidad: 'Reembolsable', Nombre: 'Con cupón de productos', Importe: 100 })).toBe('Con cupón de productos: 100 €');
    expect(textoModalidadCurso({ Modalidad: 'NoReembolsable', Nombre: '', Importe: 60.5 })).toBe('Sin cupón: 60,50 €');
    expect(nombreModalidadEvento('Gratuita')).toBe('Plaza sin coste');
  });

  it('formato y plazas', () => {
    expect(textoFormatoEvento('Online', 'REI')).toBe('Online');
    expect(textoFormatoEvento('Presencial', 'ALC')).toBe('Presencial en ALC');
    expect(textoFormatoEvento(null, null)).toBe('Presencial');
    expect(textoPlazasLibres(999)).toBe('Sin límite de plazas');
    expect(textoPlazasLibres(1)).toBe('Queda 1 plaza');
    expect(textoPlazasLibres(5)).toBe('Quedan 5 plazas');
    expect(textoPlazasLibres(0)).toBe('Sin plazas');
  });

  it('al guardar, si la API separó el curso en otro pedido, se dice', () => {
    expect(textoPedidosCreados(929100, [{ Numero: 929101, Motivo: 'Cursos' }]))
      .toBe('Se han creado dos pedidos: 929100 (productos) y 929101 (curso). Los cursos se facturan aparte.');
    expect(textoPedidosCreados(929100, null)).toBeNull();
    expect(textoPedidosCreados(929100, [])).toBeNull();
  });
});

/** NestoApp#247 / NestoAPI#692: la ficha del evento que abre la push de anuncio. */
describe('Modalidades de un evento con su importe (#247)', () => {
  it('saca el importe de cada modalidad de las señales del evento', () => {
    const evento: Evento = {
      Id: 1, Empresa: '1', Titulo: 'Curso', Fecha: '2026-11-15', ImporteSenal: 100, ImporteSenalNoReembolsable: 60, Activo: true,
      Modalidades: ['Reembolsable', 'NoReembolsable']
    };
    expect(modalidadesConImporte(evento).map(textoModalidadCurso)).toEqual(['Con cupón de productos: 100 €', 'Sin cupón: 60 €']);
  });

  it('un evento gratuito', () => {
    const evento: Evento = { Id: 1, Empresa: '1', Titulo: 'Curso', Fecha: '2026-11-15', ImporteSenal: 0, Activo: true, Modalidades: ['Gratuita'] };
    expect(modalidadesConImporte(evento).map(textoModalidadCurso)).toEqual(['Plaza sin coste: 0 €']);
    expect(modalidadesConImporte({ ...evento, Modalidades: undefined })).toEqual([]);
  });
});
