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
    servicio = { leerEvento: jasmine.createSpy('leerEvento').and.returnValue(of(evento())) };
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
