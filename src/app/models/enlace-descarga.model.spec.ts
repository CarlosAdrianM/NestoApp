import { saludoSegunHora, textoMovil, textoWhatsAppVarios, urlWhatsApp } from './enlace-descarga.model';

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

/** NestoApp#69: varias facturas en un solo mensaje de WhatsApp. */
describe('Mensaje de WhatsApp con varios documentos (#69)', () => {
  const enlace = (numero: string, importe: number, caduca: string) => ({
    Url: 'https://api.nuevavision.es/d/' + numero, Caduca: caduca, Tipo: 'Factura', Numero: numero, Nombre: 'Peluquería Ana', Importe: importe, Moviles: [], Texto: 'TEXTO ' + numero
  });

  it('con uno solo, el texto de la API tal cual', () => {
    expect(textoWhatsAppVarios([enlace('NV1', 10, '2026-12-05T00:00:00')])).toBe('TEXTO NV1');
  });

  it('con varios: saludo, un enlace por factura con su importe y hasta cuándo valen (la caducidad más próxima)', () => {
    const texto = textoWhatsAppVarios([enlace('NV1', 1234.5, '2026-12-05T00:00:00'), enlace('NV2', 0, '2026-12-04T00:00:00')], new Date(2026, 10, 5, 10));
    expect(texto).toBe('Buenos días, Peluquería Ana:\n\n' +
      'Le enviamos sus facturas. Puede descargarlas en PDF desde estos enlaces:\n' +
      '- Factura NV1 (1234,50 €): https://api.nuevavision.es/d/NV1\n' +
      '- Factura NV2: https://api.nuevavision.es/d/NV2\n\n' +
      'Los enlaces estarán disponibles hasta el 04/12/2026.\n\n' +
      'Un saludo,\nNueva Visión');
  });

  it('el saludo según la hora, como la API', () => {
    expect(saludoSegunHora(new Date(2026, 10, 5, 9))).toBe('Buenos días');
    expect(saludoSegunHora(new Date(2026, 10, 5, 17))).toBe('Buenas tardes');
    expect(saludoSegunHora(new Date(2026, 10, 5, 22))).toBe('Buenas noches');
    expect(textoWhatsAppVarios([])).toBe('');
  });
});
