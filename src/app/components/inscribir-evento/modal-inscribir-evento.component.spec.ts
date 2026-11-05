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

/** NestoApp#268 / #217: desde la ficha del evento, asistentes y eventos gratuitos. */
describe('ModalInscribirEventoComponent: desde la ficha del evento, asistentes y gratuitos (#268, #217)', () => {
  let modal: ModalInscribirEventoComponent;
  let servicio: any;
  let alertas: any[];
  const futuro = (dias: number) => { const d = new Date(); d.setDate(d.getDate() + dias); return d.toISOString().substring(0, 10) + 'T10:00:00'; };

  beforeEach(() => {
    alertas = [];
    servicio = {
      leerEventos: jasmine.createSpy('leerEventos').and.returnValue(of([
        { Id: 1, Empresa: '1', Titulo: 'Curso de pago', Fecha: futuro(10), ImporteSenal: 100, ImporteSenalNoReembolsable: 60, Activo: true, Plazas: 10, PlazasOcupadas: 2, Modalidades: ['Reembolsable', 'NoReembolsable'] },
        { Id: 2, Empresa: '1', Titulo: 'Charla gratuita', Fecha: futuro(3), ImporteSenal: 0, Activo: true, Gratuito: true, Modalidades: ['Gratuita'] },
        { Id: 3, Empresa: '1', Titulo: 'Lleno', Fecha: futuro(4), ImporteSenal: 50, Activo: true, Plazas: 5, PlazasOcupadas: 5 }
      ])),
      leerInscripcionesCliente: jasmine.createSpy('leerInscripcionesCliente').and.returnValue(of([])),
      inscribir: jasmine.createSpy('inscribir').and.returnValue(of({ Id: 9, Evento: 'X', EstadoTexto: 'Reservada', UrlPago: null, Avisos: ['A la ficha le falta el teléfono.'] }))
    };
    const alertCtrl: any = { create: (o: any) => { alertas.push(o); return Promise.resolve({ present: () => Promise.resolve() }); } };
    modal = new ModalInscribirEventoComponent(null, servicio, alertCtrl, null, { extractErrorMessage: (e: any) => e?.message || 'Error' } as any, { logEvent: () => { } } as any);
    modal.cliente = { empresa: '1', cliente: '15191', contacto: '0' };
  });

  it('con eventoId el evento ya está elegido y es el único de la lista', async () => {
    modal.eventoId = 1;
    await modal.ngOnInit();
    expect(modal.eventos.map(e => e.Id)).toEqual([1]);
    expect(modal.eventoElegido.Id).toBe(1);
    expect(modal.modalidades.map(m => m.Modalidad)).toEqual(['Reembolsable', 'NoReembolsable']);
    expect(modal.modalidad).toBe('Reembolsable');
    expect(modal.esGratuita).toBeFalse();
  });

  it('si el evento de la ficha ya no admite inscripciones (lleno), lo dice', async () => {
    modal.eventoId = 3;
    await modal.ngOnInit();
    expect(modal.eventos).toEqual([]);
    expect(modal.mensaje).toContain('ya no admite');
  });

  it('un evento gratuito: plaza sin coste, sin forma de pago ni enlace', async () => {
    modal.eventoId = 2;
    await modal.ngOnInit();
    expect(modal.esGratuita).toBeTrue();
    expect(modal.seGeneraEnlace).toBeFalse();

    await modal.inscribir();

    expect(servicio.inscribir).toHaveBeenCalledWith(2, jasmine.objectContaining({ Modalidad: 'Gratuita', GenerarEnlacePago: false, FormaPago: undefined, Asistentes: 1 }));
  });

  it('los asistentes viajan (mínimo 1) y la modalidad elegida también', async () => {
    modal.eventoId = 1;
    await modal.ngOnInit();
    modal.modalidad = 'NoReembolsable';
    modal.asistentes = 3;

    await modal.inscribir();

    expect(servicio.inscribir).toHaveBeenCalledWith(1, jasmine.objectContaining({ Modalidad: 'NoReembolsable', Asistentes: 3, FormaPago: 'Tarjeta' }));
  });

  it('los avisos de la API al inscribir (ficha sin teléfono…) se enseñan', async () => {
    modal.eventoId = 1;
    await modal.ngOnInit();
    await modal.inscribir();
    expect(alertas.some(a => a.header === 'Inscrito, pero ojo' && a.message.includes('teléfono'))).toBeTrue();
  });

  it('el 403 de la API (no es su cliente) se enseña tal cual', async () => {
    servicio.inscribir.and.returnValue(throwError(() => ({ status: 403, message: 'El cliente 15191 no es de sus clientes: pídaselo a su vendedor.' })));
    modal.eventoId = 1;
    await modal.ngOnInit();
    await modal.inscribir();
    expect(alertas[0].header).toBe('No se ha podido inscribir');
    expect(alertas[0].message).toContain('no es de sus clientes');
  });
});
