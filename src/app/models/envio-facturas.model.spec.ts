import { resultadoDeErrorEnvioFacturas, textoResultadoEnvioFacturas } from './envio-facturas.model';

/** NestoApp#69 (Nesto#259): facturas por correo. */
describe('Envío de facturas por correo (#69)', () => {
  it('enviado: cuántas y a quién; con las omitidas si las hay', () => {
    expect(textoResultadoEnvioFacturas({ Enviado: true, Facturas: ['NV2616199', 'NV2616200'], Omitidas: [], Correos: ['a@b.com'] }))
      .toBe('Se han enviado 2 facturas a a@b.com.');
    expect(textoResultadoEnvioFacturas({ Enviado: true, Facturas: ['NV2616199'], Omitidas: ['NV2616201'], Correos: ['a@b.com', 'c@d.com'] }))
      .toBe('Se ha enviado la factura a a@b.com, c@d.com.\n\nNo se han podido adjuntar: NV2616201.');
  });

  it('el mensaje de la API manda si viene; sin enviar, se dice', () => {
    expect(textoResultadoEnvioFacturas({ Enviado: true, Facturas: [], Omitidas: [], Correos: [], Mensaje: 'Enviadas 2 facturas.' })).toBe('Enviadas 2 facturas.');
    expect(textoResultadoEnvioFacturas({ Enviado: false, Facturas: [], Omitidas: [], Correos: [] })).toContain('no ha aceptado');
    expect(textoResultadoEnvioFacturas(null)).toBe('');
  });
});

/** NestoApp#272: si el correo no sale, la API contesta 502 con el resultado (Enviado = false y el motivo). */
describe('Envío de facturas por correo que no sale (#272)', () => {
  const resultado = { Enviado: false, Facturas: ['NV1'], Omitidas: [], Correos: ['a@b.com'], Mensaje: 'El correo no se ha podido enviar (el servidor de correo no responde). Vuelve a intentarlo en un rato.' };

  it('saca el resultado del cuerpo del error, envuelto por el interceptor o directo', () => {
    expect(resultadoDeErrorEnvioFacturas({ statusCode: 502, originalError: { status: 502, error: resultado } })).toEqual(resultado);
    expect(resultadoDeErrorEnvioFacturas({ status: 502, error: resultado })).toEqual(resultado);
  });

  it('un error que no trae el resultado (HTML de IIS, sin conexión, 403 de texto) no lo es', () => {
    expect(resultadoDeErrorEnvioFacturas({ statusCode: 502, originalError: { status: 502, error: '<html></html>' } })).toBeNull();
    expect(resultadoDeErrorEnvioFacturas({ status: 0, error: null })).toBeNull();
    expect(resultadoDeErrorEnvioFacturas({ status: 400, error: { Message: 'No es un correo válido: x.' } })).toBeNull();
    expect(resultadoDeErrorEnvioFacturas(null)).toBeNull();
  });
});
