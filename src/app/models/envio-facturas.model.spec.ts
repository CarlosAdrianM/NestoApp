import { textoResultadoEnvioFacturas } from './envio-facturas.model';

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
