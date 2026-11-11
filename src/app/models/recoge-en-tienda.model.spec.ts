import { almacenObligaARecoger, almacenPermiteRecoger, esRutaDeRecogida, recogeEnTiendaEfectivo, recogeEnTiendaParaGuardar } from './recoge-en-tienda.model';

/** NestoApp#205 (NestoAPI#571): «Recoge en tienda». */
describe('Recoge en tienda (#205)', () => {
  it('en Alcobendas y Reina se recoge siempre; en Algete se elige; en otro almacén no se ofrece', () => {
    expect(almacenObligaARecoger('ALC')).toBeTrue();
    expect(almacenObligaARecoger(' rei ')).toBeTrue();
    expect(almacenObligaARecoger('ALG')).toBeFalse();
    expect(almacenPermiteRecoger('ALG')).toBeTrue();
    expect(almacenPermiteRecoger('ALC')).toBeTrue();
    expect(almacenPermiteRecoger('XXX')).toBeFalse();
    expect(almacenPermiteRecoger(null)).toBeFalse();
  });

  it('lo que se ve: fijo y marcado en ALC/REI, lo elegido en ALG (desmarcado por defecto)', () => {
    expect(recogeEnTiendaEfectivo('ALC', false)).toBeTrue();
    expect(recogeEnTiendaEfectivo('REI', null)).toBeTrue();
    expect(recogeEnTiendaEfectivo('ALG', undefined)).toBeFalse();
    expect(recogeEnTiendaEfectivo('ALG', true)).toBeTrue();
    expect(recogeEnTiendaEfectivo('XXX', true)).toBeFalse();
  });

  it('lo que viaja: true/false donde se puede recoger y null (no tocar) en el resto', () => {
    expect(recogeEnTiendaParaGuardar('ALG', false)).toBeFalse();
    expect(recogeEnTiendaParaGuardar('ALG', true)).toBeTrue();
    expect(recogeEnTiendaParaGuardar('ALC', false)).toBeTrue();
    expect(recogeEnTiendaParaGuardar('XXX', true)).toBeNull();
  });

  it('un pedido se recoge si su ruta es AM, ALC o REI', () => {
    ['AM', 'ALC', 'REI', ' am '].forEach(ruta => expect(esRutaDeRecogida(ruta)).toBeTrue());
    ['FW', 'GLV', '', null].forEach(ruta => expect(esRutaDeRecogida(ruta as any)).toBeFalse());
  });
});
