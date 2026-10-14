import { nombreFicheroSeguro } from './visor-ficheros.service';

/** NestoApp#218: los adjuntos los nombra quien los sube; en disco tiene que ser un nombre válido. */
describe('nombreFicheroSeguro (#218)', () => {
  it('quita tildes, barras y espacios', () => {
    expect(nombreFicheroSeguro('Normas cupones (octubre).pdf')).toBe('Normas_cupones_octubre_.pdf');
    expect(nombreFicheroSeguro('../ñandú/foto.jpg')).toBe('.._nandu_foto.jpg');
  });

  it('sin nombre, uno por defecto', () => {
    expect(nombreFicheroSeguro('')).toBe('fichero');
  });
});
