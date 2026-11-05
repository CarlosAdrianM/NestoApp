import { of, throwError } from 'rxjs';
import { EnviosDevueltosComponent } from './envios-devueltos.component';

/** NestoApp#267: la lista de envíos devueltos del vendedor. */
describe('EnviosDevueltosComponent (#267)', () => {
  let componente: EnviosDevueltosComponent;
  let servicio: any;
  let nav: any;
  const envio = (cambios: any = {}) => ({ Numero: 1, Empresa: '1', Cliente: '15191', Contacto: '0', Estado: 4, Fecha: '2026-11-03', Nombre: 'X', Vendedor: 'JM', Decision: 'SinDecidir', ...cambios });

  beforeEach(() => {
    nav = { navigateForward: jasmine.createSpy('navigateForward') };
    servicio = { leerDevueltos: jasmine.createSpy('leerDevueltos').and.returnValue(of([envio(), envio({ Numero: 2, Vendedor: 'OTRO' }), envio({ Numero: 3, Decision: 'Abonar' })])) };
  });

  it('el vendedor ve los suyos (sin decidir primero) y puede ver todos', () => {
    componente = new EnviosDevueltosComponent(servicio, { vendedor: 'JM' } as any, nav, { logEvent: () => { } } as any);
    componente.ionViewWillEnter();

    expect(componente.soloMios).toBeTrue();
    expect(componente.visibles.map(e => e.Numero)).toEqual([1, 3]);
    componente.soloMios = false;
    expect(componente.visibles.map(e => e.Numero)).toEqual([1, 2, 3]);
  });

  it('sin vendedor (administración) se ven todos y no hay filtro', () => {
    componente = new EnviosDevueltosComponent(servicio, { vendedor: 'Sin Vendedor' } as any, nav, { logEvent: () => { } } as any);
    componente.ionViewWillEnter();
    expect(componente.tieneVendedor).toBeFalse();
    expect(componente.visibles.length).toBe(3);
  });

  it('al tocar uno se abre su pantalla de decisión', () => {
    componente = new EnviosDevueltosComponent(servicio, { vendedor: 'JM' } as any, nav, { logEvent: () => { } } as any);
    componente.abrir(envio({ Numero: 7 }));
    expect(nav.navigateForward).toHaveBeenCalledWith('envio-devuelto', { queryParams: { empresa: '1', envio: 7 } });
  });

  it('con una API anterior (404) lo dice', () => {
    servicio.leerDevueltos.and.returnValue(throwError(() => ({ status: 404 })));
    componente = new EnviosDevueltosComponent(servicio, { vendedor: 'JM' } as any, nav, { logEvent: () => { } } as any);
    componente.ionViewWillEnter();
    expect(componente.mensaje).toContain('todavía no están disponibles');
  });
});
