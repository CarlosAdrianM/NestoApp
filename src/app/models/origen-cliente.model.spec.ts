import { esLeadDeCampana, textoOrigenCliente } from './origen-cliente.model';

/** NestoApp#227 (NestoAPI#623): origen del cliente y leads de campaña. */
describe('Origen del cliente (#227)', () => {
  const origenes = [{ Codigo: 'META-HARMONIA-0926', Descripcion: 'Lead de Meta · campaña Harmonia', Activo: true }];

  it('la descripción del origen, o el código si la lista no lo trae', () => {
    expect(textoOrigenCliente('META-HARMONIA-0926', origenes)).toBe('Lead de Meta · campaña Harmonia');
    expect(textoOrigenCliente('meta-harmonia-0926', origenes)).toBe('Lead de Meta · campaña Harmonia');
    expect(textoOrigenCliente('OTRO', origenes)).toBe('OTRO');
    expect(textoOrigenCliente(null, origenes)).toBe('');
  });

  it('un lead de campaña en clientes para contactar', () => {
    expect(esLeadDeCampana({ Origen: 'LeadCampana' })).toBeTrue();
    expect(esLeadDeCampana({ Origen: 'Probabilidad' })).toBeFalse();
    expect(esLeadDeCampana({})).toBeFalse();
  });
});
