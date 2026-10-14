import { ChequeRegaloPendiente, enlaceWhatsApp, movilParaWhatsApp, textoDiasRestantesCheque, textoFacturaCheque, textoUltimoContactoCheque } from './cheques-regalo-vendedor.model';

/** NestoApp#226 (NestoAPI#593): pendientes de cheque regalo para la barrida telefónica. */
describe('Cheques regalo por vendedor (#226)', () => {
  const cheque = (cambios: Partial<ChequeRegaloPendiente> = {}): ChequeRegaloPendiente => ({
    Id: 3, Campana: 'CHEQUE50_OCT_2026', Empresa: '1', Cliente: '37320', Contacto: '0', Nombre: 'X', PersonaContacto: 'Y',
    Direccion: 'Z', CodigoPostal: '28039', Poblacion: 'MADRID', Provincia: 'MADRID', Telefono: '666004939', Vendedor: 'JGP',
    NombreVendedor: 'J', Estado: 'Disponible', Importe: 50, FechaActivacion: null, CanjeHasta: '2026-11-07T00:00:00', DiasRestantes: 25,
    EmpresaFactura: '1', FacturaOrigen: 'NV2616575 ', FechaFactura: '2026-10-13T00:00:00', BaseImponibleFactura: 108.95, TotalFactura: 131.83,
    PedidoCanje: null, FechaUltimoContacto: null, DiasDesdeUltimoContacto: 15, FechaUltimoIntento: null, ...cambios
  });

  it('días que quedan, con «Último día» en el 0', () => {
    expect(textoDiasRestantesCheque(25)).toBe('Quedan 25 días');
    expect(textoDiasRestantesCheque(1)).toBe('Queda 1 día');
    expect(textoDiasRestantesCheque(0)).toBe('Último día');
  });

  it('la factura que lo generó', () => {
    expect(textoFacturaCheque(cheque())).toBe('Factura NV2616575 del 13/10: 131,83 €');
  });

  it('cuándo hablasteis por última vez', () => {
    expect(textoUltimoContactoCheque(cheque())).toBe('Hablasteis hace 15 días');
    expect(textoUltimoContactoCheque(cheque({ DiasDesdeUltimoContacto: null }))).toBe('No consta ninguna conversación');
  });

  it('WhatsApp solo con un móvil (6 o 7), aunque vaya detrás de un fijo', () => {
    expect(movilParaWhatsApp('915550000 / 666 004 939')).toBe('666004939');
    expect(enlaceWhatsApp('+34 712345678')).toBe('https://wa.me/34712345678');
    expect(enlaceWhatsApp('915550000')).toBeNull();
    expect(enlaceWhatsApp('')).toBeNull();
  });
});
