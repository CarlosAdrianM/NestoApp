import { ModalElegirCursoComponent } from './modal-elegir-curso.component';

/** NestoApp#244 / NestoAPI#691: elegir evento y modalidad al meter un curso en la plantilla. */
describe('ModalElegirCursoComponent (#244)', () => {
  let modal: ModalElegirCursoComponent;
  let cerrado: { data: any; role: string } | null;

  const evento = (id: number, modalidades = 2) => ({
    Id: id, Titulo: 'Masterclass PDRN', Fecha: '2026-11-15T00:00:00', HoraInicio: '10:00', Almacen: 'REI', Formato: 'Presencial', PlazasLibres: 5,
    Modalidades: [
      { Modalidad: 'Reembolsable', Nombre: 'Con cupón de productos', Importe: 100 },
      { Modalidad: 'NoReembolsable', Nombre: 'Sin cupón', Importe: 60 }
    ].slice(0, modalidades)
  });

  beforeEach(() => {
    cerrado = null;
    const modalCtrl: any = { dismiss: (data: any, role: string) => { cerrado = { data, role }; return Promise.resolve(true); } };
    modal = new ModalElegirCursoComponent(modalCtrl);
    modal.titulo = 'Masterclass PDRN';
  });

  it('con un solo evento futuro sale ya elegido; la modalidad siempre se elige', () => {
    modal.eventos = [evento(1)];
    modal.ngOnInit();
    expect(modal.eventoElegido.Id).toBe(1);
    expect(modal.modalidadElegida).toBeNull();
    expect(modal.sePuedeAceptar).toBeFalse();
  });

  it('con varios eventos hay que elegir uno', () => {
    modal.eventos = [evento(1), evento(2)];
    modal.ngOnInit();
    expect(modal.eventoElegido).toBeNull();
    modal.elegirEvento(modal.eventos[1]);
    expect(modal.eventoElegido.Id).toBe(2);
  });

  it('al aceptar devuelve el evento, la modalidad y el texto para la línea', () => {
    modal.eventos = [evento(1)];
    modal.ngOnInit();
    modal.elegirModalidad(modal.eventoElegido.Modalidades[0]);

    modal.aceptar();

    expect(cerrado.role).toBe('elegido');
    expect(cerrado.data.evento.Id).toBe(1);
    expect(cerrado.data.modalidad.Modalidad).toBe('Reembolsable');
    expect(cerrado.data.texto).toBe('Masterclass PDRN · 15/11/2026 10:00 · Presencial en REI · Con cupón de productos: 100 €');
  });

  it('vuelve con lo que ya tenía la línea', () => {
    modal.eventos = [evento(1), evento(2)];
    modal.eventoId = 2;
    modal.modalidad = 'NoReembolsable';
    modal.ngOnInit();
    expect(modal.eventoElegido.Id).toBe(2);
    expect(modal.modalidadElegida.Modalidad).toBe('NoReembolsable');
    expect(modal.sePuedeAceptar).toBeTrue();
  });

  it('con una sola modalidad sale elegida', () => {
    modal.eventos = [evento(1, 1)];
    modal.ngOnInit();
    expect(modal.modalidadElegida.Modalidad).toBe('Reembolsable');
  });

  it('cancelar y quitar cierran con su papel', () => {
    modal.cancelar();
    expect(cerrado.role).toBe('cancelar');
    modal.quitar();
    expect(cerrado.role).toBe('quitar');
  });
});
