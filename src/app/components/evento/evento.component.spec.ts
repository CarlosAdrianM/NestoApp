import { of, throwError, Subject } from 'rxjs';
import { EventoComponent } from './evento.component';

/** NestoApp#247 / NestoAPI#692: la ficha del evento que abre la push de anuncio. */
describe('EventoComponent (#247)', () => {
  let componente: EventoComponent;
  let servicio: any;
  let params: Subject<any>;

  const evento = () => ({
    Id: 12, Empresa: '1', Titulo: 'Masterclass PDRN', Fecha: '2026-11-15T00:00:00', ImporteSenal: 100, ImporteSenalNoReembolsable: 60, Activo: true,
    Almacen: 'REI', Formato: 'Presencial', HoraInicio: '10:00', HoraFin: '12:00', Ponente: 'Dra. Pérez', Plazas: 10, PlazasOcupadas: 7,
    Modalidades: ['Reembolsable', 'NoReembolsable']
  });

  beforeEach(() => {
    params = new Subject<any>();
    servicio = {
      leerEvento: jasmine.createSpy('leerEvento').and.returnValue(of(evento())),
      leerInscripcionesEvento: jasmine.createSpy('leerInscripcionesEvento').and.returnValue(of([]))
    };
    componente = new EventoComponent({ queryParams: params } as any, servicio, { logEvent: () => { } } as any);
  });

  it('carga el evento del id de la push y enseña lo que el vendedor necesita', () => {
    params.next({ id: '12', aviso: '1' });

    expect(servicio.leerEvento).toHaveBeenCalledWith(12);
    expect(componente.evento.Titulo).toBe('Masterclass PDRN');
    expect(componente.textoFormato).toBe('Presencial en REI');
    expect(componente.horario).toBe('10:00 - 12:00');
    expect(componente.textoPlazas(componente.evento)).toBe('Quedan 3 plazas');
    expect(componente.modalidades.map(componente.textoModalidad)).toEqual(['Con cupón de productos: 100 €', 'Sin cupón: 60 €']);
  });

  it('si el evento ya no existe lo dice', () => {
    servicio.leerEvento.and.returnValue(of(null));
    params.next({ id: '99' });
    expect(componente.evento).toBeNull();
    expect(componente.mensaje).toContain('No se ha encontrado');
  });

  it('si la API falla lo dice sin romper', () => {
    servicio.leerEvento.and.returnValue(throwError(() => ({ status: 500 })));
    params.next({ id: '12' });
    expect(componente.cargando).toBeFalse();
    expect(componente.mensaje).toContain('No se ha podido cargar');
  });

  it('sin id no pide nada', () => {
    params.next({});
    expect(servicio.leerEvento).not.toHaveBeenCalled();
  });
});

/** NestoApp#268 (Nesto#619) / #217 (NestoAPI#741): inscritos del evento e inscribir a un cliente desde su ficha. */
describe('EventoComponent: inscritos e inscribir (#268)', () => {
  let componente: EventoComponent;
  let servicio: any;
  let params: Subject<any>;
  let modales: any[];
  let resultados: any[];

  const inscripcion = (id: number, mio: boolean | null, extra: any = {}) => ({ Id: id, EventoId: 12, Evento: 'Masterclass', Cliente: '1500' + id, Contacto: '0', Nombre: 'Cliente ' + id, Estado: 'Reservada', EstadoTexto: 'Reservada', EsDeMisClientes: mio, Asistentes: 1, ...extra });

  beforeEach(() => {
    params = new Subject<any>();
    modales = [];
    resultados = [];
    servicio = {
      leerEvento: jasmine.createSpy('leerEvento').and.returnValue(of({ Id: 12, Empresa: '1', Titulo: 'Masterclass', Fecha: '2026-11-15T00:00:00', ImporteSenal: 100, Activo: true, Plazas: 10, PlazasOcupadas: 3 })),
      leerInscripcionesEvento: jasmine.createSpy('leerInscripcionesEvento').and.returnValue(of([inscripcion(1, true, { Asistentes: 2 }), inscripcion(2, false), inscripcion(3, true)]))
    };
    const modalCtrl: any = { create: (o: any) => { modales.push(o); const r = resultados.shift() || { data: null, role: 'cancel' }; return Promise.resolve({ present: () => Promise.resolve(), onDidDismiss: () => Promise.resolve(r) }); } };
    componente = new EventoComponent({ queryParams: params } as any, servicio, { logEvent: () => { } } as any, modalCtrl);
  });

  it('con el evento se cargan los inscritos y «Solo mis clientes» va marcado', () => {
    params.next({ id: '12' });
    expect(servicio.leerInscripcionesEvento).toHaveBeenCalledWith(12);
    expect(componente.puedeFiltrarMisClientes).toBeTrue();
    expect(componente.inscripcionesVisibles.map(i => i.Id)).toEqual([1, 3]);
    expect(componente.resumenInscritos).toBe('4 personas apuntadas · 2 inscripciones de mis clientes');
    componente.soloMisClientes = false;
    expect(componente.inscripcionesVisibles.length).toBe(3);
    expect(componente.asistentesExtra(componente.inscripciones[0])).toBe('+1');
  });

  it('si la API no da el dato de mis clientes, no hay filtro y se ven todos', () => {
    servicio.leerInscripcionesEvento.and.returnValue(of([inscripcion(1, null), inscripcion(2, null)]));
    params.next({ id: '12' });
    expect(componente.puedeFiltrarMisClientes).toBeFalse();
    expect(componente.inscripcionesVisibles.length).toBe(2);
  });

  it('«Inscribir a un cliente»: se elige el cliente y se abre la inscripción ya en este evento; al inscribir se recarga', async () => {
    params.next({ id: '12' });
    resultados.push({ data: { empresa: '1', cliente: '15191', contacto: '0', nombre: 'PELUQUERÍA X' }, role: 'elegido' });
    resultados.push({ data: { inscrito: true } });

    await componente.inscribirCliente();

    expect(modales.length).toBe(2);
    expect(modales[0].componentProps.titulo).toBe('Inscribir a…');
    expect(modales[1].componentProps.eventoId).toBe(12);
    expect(modales[1].componentProps.cliente.cliente).toBe('15191');
    expect(servicio.leerEvento).toHaveBeenCalledTimes(2);
  });

  it('si se cancela la elección del cliente no se abre nada más', async () => {
    params.next({ id: '12' });
    await componente.inscribirCliente();
    expect(modales.length).toBe(1);
    expect(servicio.leerEvento).toHaveBeenCalledTimes(1);
  });

  it('sin permiso o con una API anterior, la lista de inscritos queda vacía sin ruido', () => {
    servicio.leerInscripcionesEvento.and.returnValue(throwError(() => ({ status: 403 })));
    params.next({ id: '12' });
    expect(componente.inscripciones).toEqual([]);
    expect(componente.mensaje).toBe('');
  });
});
