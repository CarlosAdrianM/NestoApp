import { of, throwError } from 'rxjs';
import { ModalInscribirEventoComponent } from './modal-inscribir-evento.component';

/** NestoApp#217 (NestoAPI#611, corte 1): inscribir al cliente en un evento desde la app. */
describe('ModalInscribirEventoComponent (#217)', () => {
  let modal: ModalInscribirEventoComponent;
  let servicio: any;
  let alertas: any[];

  const futuro = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().substring(0, 10) + 'T10:00:00';
  };

  beforeEach(() => {
    alertas = [];
    servicio = {
      leerEventos: jasmine.createSpy('leerEventos').and.returnValue(of([
        { Id: 1, Empresa: '1', Titulo: 'Curso PDRN', Fecha: futuro(10), ImporteSenal: 50, Activo: true, Plazas: 10, PlazasOcupadas: 2 },
        { Id: 2, Empresa: '1', Titulo: 'Pasado', Fecha: futuro(-3), ImporteSenal: 50, Activo: true }
      ])),
      leerInscripcionesCliente: jasmine.createSpy('leerInscripcionesCliente').and.returnValue(of([])),
      inscribir: jasmine.createSpy('inscribir').and.returnValue(of({ Id: 9, Evento: 'Curso PDRN', EstadoTexto: 'Reservada', UrlPago: 'https://pago/9' }))
    };
    const alertCtrl: any = { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } };
    const errorHandler: any = { extractErrorMessage: () => 'Error de la API' };
    modal = new ModalInscribirEventoComponent(null, servicio, alertCtrl, null, errorHandler, { logEvent: () => { } } as any);
    modal.cliente = { empresa: '1 ', cliente: '15191 ', contacto: '0' };
  });

  it('ofrece solo los eventos futuros con plaza', async () => {
    await modal.ngOnInit();
    expect(modal.eventos.map(e => e.Id)).toEqual([1]);
  });

  it('inscribe con origen NestoApp y, con tarjeta, pide el enlace de pago', async () => {
    await modal.ngOnInit();
    modal.elegir(modal.eventos[0]);
    modal.correo = 'cliente@ejemplo.com';

    await modal.inscribir();

    expect(servicio.inscribir).toHaveBeenCalledWith(1, jasmine.objectContaining({
      Empresa: '1', Cliente: '15191', Contacto: '0', Origen: 'NestoApp', FormaPago: 'Tarjeta', GenerarEnlacePago: true, Correo: 'cliente@ejemplo.com'
    }));
    expect(modal.resultado.UrlPago).toBe('https://pago/9');
  });

  it('con transferencia no se genera enlace', async () => {
    await modal.ngOnInit();
    modal.elegir(modal.eventos[0]);
    modal.formaPago = 'Transferencia';

    await modal.inscribir();

    expect(servicio.inscribir).toHaveBeenCalledWith(1, jasmine.objectContaining({ FormaPago: 'Transferencia', GenerarEnlacePago: false, Correo: undefined }));
  });

  it('con una API sin inscripciones (404) lo dice claro', async () => {
    servicio.inscribir.and.returnValue(throwError(() => ({ status: 404 })));
    await modal.ngOnInit();
    modal.elegir(modal.eventos[0]);

    await modal.inscribir();

    expect(alertas[0].message).toBe('Las inscripciones a eventos todavía no están disponibles.');
    expect(modal.resultado).toBeNull();
  });
});
