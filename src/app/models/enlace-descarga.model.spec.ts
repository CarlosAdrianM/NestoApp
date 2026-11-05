import { textoMovil, urlWhatsApp } from './enlace-descarga.model';

/** NestoApp#261 (NestoAPI#737): enlace de WhatsApp con el texto ya escrito. */
describe('Enlace de WhatsApp (#261)', () => {
  it('con móvil, wa.me/<móvil>?text=<texto codificado>', () => {
    expect(urlWhatsApp('34600111222', 'Hola, le enviamos su pedido 929498: https://api.nuevavision.es/d/abc'))
      .toBe('https://wa.me/34600111222?text=Hola%2C%20le%20enviamos%20su%20pedido%20929498%3A%20https%3A%2F%2Fapi.nuevavision.es%2Fd%2Fabc');
  });

  it('sin móvil, se abre WhatsApp sin número', () => {
    expect(urlWhatsApp(null, 'Hola')).toBe('https://wa.me/?text=Hola');
    expect(urlWhatsApp('+34 600 111 222', 'Hola')).toBe('https://wa.me/34600111222?text=Hola');
  });

  it('los móviles españoles se enseñan en grupos de tres', () => {
    expect(textoMovil('34600111222')).toBe('600 111 222');
    expect(textoMovil('351912345678')).toBe('+351912345678');
  });
});
