import { textoAvisosPedido } from './avisos-pedido.model';

/** NestoApp#264 (NestoAPI#764): avisos no bloqueantes al grabar el pedido. */
describe('Avisos de grabación del pedido (#264)', () => {
  it('un párrafo por aviso, sin los vacíos', () => {
    expect(textoAvisosPedido([
      { Tipo: 'ClienteCierraDiaReparto', Mensaje: 'El cliente cierra el martes, que es su día de reparto por nuestra ruta: envíelo por agencia o cambie el día.' },
      { Tipo: 'Otro', Mensaje: '  ' },
      { Tipo: 'Otro', Mensaje: 'Segundo aviso.' }
    ])).toBe('El cliente cierra el martes, que es su día de reparto por nuestra ruta: envíelo por agencia o cambie el día.\n\nSegundo aviso.');
  });

  it('sin avisos (o con una API anterior que no manda la lista), nada', () => {
    expect(textoAvisosPedido([])).toBe('');
    expect(textoAvisosPedido(null)).toBe('');
    expect(textoAvisosPedido(undefined)).toBe('');
  });
});
