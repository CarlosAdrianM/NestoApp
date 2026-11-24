import { EMPTY, of, throwError } from 'rxjs';
import { AdelantarCuponComponent } from './adelantar-cupon.component';
import { errorMotivoAdelantarCupon, sePuedeAdelantarCupon, textoCuponAdelantado } from 'src/app/models/cupon.model';

/** NestoApp#291 (NestoAPI#885): «Usar ya (excepción)» en un cupón de evento que todavía no vale. */
describe('AdelantarCuponComponent (#291)', () => {
  let componente: AdelantarCuponComponent;
  let servicio: any;
  let alertas: any[];

  const cupon = (cambios: any = {}): any => ({
    Id: 1, Codigo: 'EV-2610-7K3Q', Empresa: '1', Cliente: '15191', Importe: 50, PedidoMinimo: 0, Origen: 'Evento', Estado: 'Emitido',
    SePuedeUsar: false, SePuedeAdelantar: true, Mensaje: 'Tiene un cupón de 50,00 € que vale desde el 12/12/2026.', ...cambios
  });
  const alertCtrl = { create: (o: any) => { alertas.push(o); return Promise.resolve(Object.assign(o, { present: () => Promise.resolve() })); } };
  const loadingCtrl = { create: () => Promise.resolve({ present: () => Promise.resolve(), dismiss: () => Promise.resolve() }) };
  const esperar = () => new Promise(r => setTimeout(r, 0));

  beforeEach(() => {
    alertas = [];
    servicio = {
      adelantar: jasmine.createSpy('adelantar').and.returnValue(of(cupon({
        Estado: 'Activo', SePuedeUsar: true, SePuedeAdelantar: false, Mensaje: 'Tiene un cupón de 50,00 € que puede usar ya.'
      })))
    };
    componente = new AdelantarCuponComponent(servicio, alertCtrl as any, loadingCtrl as any,
      { extractErrorMessage: (e: any) => e?.message || 'error' } as any, { logEvent: () => { } } as any);
    componente.cupon = cupon();
  });

  it('solo se ofrece si la API dice que este usuario puede adelantarlo', () => {
    expect(componente.sePuedeAdelantar).toBeTrue();
    componente.cupon = cupon({ SePuedeAdelantar: false });
    expect(componente.sePuedeAdelantar).toBeFalse();
    componente.cupon = cupon({ SePuedeAdelantar: undefined }); // API anterior
    expect(componente.sePuedeAdelantar).toBeFalse();
    expect(sePuedeAdelantarCupon(null)).toBeFalse();
  });

  it('el motivo es obligatorio y de 500 caracteres como mucho', () => {
    expect(errorMotivoAdelantarCupon('   ')).toContain('obligatorio');
    expect(errorMotivoAdelantarCupon('x'.repeat(501))).toContain('500');
    expect(errorMotivoAdelantarCupon('Viene de Canarias y no puede esperar')).toBe('');
  });

  it('sin motivo el diálogo no se cierra ni se llama a la API', async () => {
    await componente.pedirMotivo();
    const usarYa = alertas[0].buttons.find((b: any) => b.text === 'Usar ya');

    expect(usarYa.handler({ motivo: '  ' })).toBeFalse();
    expect(alertas[0].message).toContain('obligatorio');
    expect(servicio.adelantar).not.toHaveBeenCalled();
  });

  it('con motivo lo adelanta: el cupón pasa a valer ya (el mismo objeto) y lo avisa', async () => {
    const original = componente.cupon;
    const emitidos: any[] = [];
    componente.adelantado.subscribe(c => emitidos.push(c));
    await componente.pedirMotivo();
    const usarYa = alertas[0].buttons.find((b: any) => b.text === 'Usar ya');

    expect(usarYa.handler({ motivo: 'Viene de lejos' })).toBeTrue();
    await esperar();

    expect(servicio.adelantar).toHaveBeenCalledWith('EV-2610-7K3Q', 'Viene de lejos');
    expect(original.Estado).toBe('Activo');
    expect(original.SePuedeUsar).toBeTrue();
    expect(componente.sePuedeAdelantar).toBeFalse();
    expect(emitidos).toEqual([original]);
    expect(alertas[1].header).toBe('Cupón adelantado');
    expect(alertas[1].message).toContain('puede usar ya');
    expect(componente.enviando).toBeFalse();
  });

  it('un 403 o un 409 enseñan el mensaje de la API y dejan de ofrecerlo', async () => {
    servicio.adelantar.and.returnValue(throwError(() => ({ status: 409, message: 'El cupón EV-2610-7K3Q ya está usado.' })));
    await componente.adelantar('Motivo');
    expect(alertas[0].header).toBe('Este cupón no se puede adelantar');
    expect(alertas[0].message).toBe('El cupón EV-2610-7K3Q ya está usado.');
    expect(componente.sePuedeAdelantar).toBeFalse();

    componente.cupon = cupon();
    servicio.adelantar.and.returnValue(throwError(() => ({ status: 403, message: 'Solo puede adelantar cupones de los clientes de su equipo.' })));
    await componente.adelantar('Motivo');
    expect(alertas[1].header).toBe('No tiene permiso para adelantar este cupón');
    expect(alertas[1].message).toContain('su equipo');
  });

  it('otro error no quita el botón (se puede reintentar)', async () => {
    servicio.adelantar.and.returnValue(throwError(() => ({ status: 500, message: 'error' })));
    await componente.adelantar('Motivo');
    expect(alertas[0].header).toBe('No se ha podido adelantar el cupón');
    expect(componente.sePuedeAdelantar).toBeTrue();
  });

  it('mientras se envía no se manda dos veces', async () => {
    servicio.adelantar.and.returnValue(EMPTY.pipe());
    componente.enviando = true;
    await componente.adelantar('Motivo');
    expect(servicio.adelantar).not.toHaveBeenCalled();
  });

  it('dice si el cupón se adelantó, por quién y cuándo', () => {
    expect(textoCuponAdelantado(cupon())).toBe('');
    expect(textoCuponAdelantado(cupon({ Adelantado: true, AdelantadoPor: 'NUEVAVISION\\Alberto', AdelantadoEl: '2026-11-23T10:15:00' })))
      .toBe('Adelantado por excepción por Alberto el 23/11/2026.');
    expect(textoCuponAdelantado(cupon({ Adelantado: true }))).toBe('Adelantado por excepción.');
  });
});
