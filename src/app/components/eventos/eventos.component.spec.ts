import { of, throwError } from 'rxjs';
import { EventosComponent } from './eventos.component';

/** NestoApp#268 (Nesto#619; Sancho, Novedades 1021): los próximos eventos en la app. */
describe('EventosComponent (#268)', () => {
  let componente: EventosComponent;
  let servicio: any;
  let nav: any;
  const futuro = (dias: number) => { const d = new Date(); d.setDate(d.getDate() + dias); return d.toISOString().substring(0, 10) + 'T10:00:00'; };

  beforeEach(() => {
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    servicio = { leerEventos: jasmine.createSpy('leerEventos').and.returnValue(of([
      { Id: 1, Empresa: '1', Titulo: 'Más lejano', Fecha: futuro(9), Activo: true, Plazas: 10, PlazasOcupadas: 10, Almacen: 'REI', Formato: 'Presencial' },
      { Id: 2, Empresa: '1', Titulo: 'Pasado', Fecha: futuro(-2), Activo: true },
      { Id: 3, Empresa: '1', Titulo: 'Próximo', Fecha: futuro(1), Activo: true, Plazas: null, PlazasOcupadas: 4, Formato: 'Online' }
    ])) };
    componente = new EventosComponent(servicio, nav, { logEvent: () => { } } as any);
  });

  it('enseña los próximos por fecha, con aforo y formato', () => {
    componente.ionViewWillEnter();
    expect(componente.eventos.map(e => e.Id)).toEqual([3, 1]);
    expect(componente.textoAforo(componente.eventos[0])).toBe('4 apuntados · sin límite de plazas');
    expect(componente.textoFormato(componente.eventos[0])).toBe('Online');
    expect(componente.completo(componente.eventos[1])).toBeTrue();
  });

  it('al tocar uno se abre su ficha', () => {
    componente.abrir({ Id: 3 } as any);
    expect(nav.navigateForward).toHaveBeenCalledWith('evento', { queryParams: { id: 3 } });
  });

  it('sin eventos o con fallo, lo dice', () => {
    servicio.leerEventos.and.returnValue(of([]));
    componente.ionViewWillEnter();
    expect(componente.mensaje).toBe('No hay eventos próximos.');
    servicio.leerEventos.and.returnValue(throwError(() => ({ status: 500 })));
    componente.ionViewWillEnter();
    expect(componente.mensaje).toContain('No se han podido cargar');
  });
});
