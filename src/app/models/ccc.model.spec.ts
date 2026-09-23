import { CCC, descripcionCCC, elegirCCC, esCCCValido } from './ccc.model';

/**
 * NestoApp#189 (réplica de Nesto#486): con recibo bancario hay que saber qué cuenta se va a cargar
 * y avisar si el cliente no tiene ninguna válida, porque entonces el recibo no va al banco.
 * Válida = la que usa la remesa: ficha activa (Estado >= 0, NestoAPI#502) y con IBAN correcto.
 */
describe('Cuentas bancarias del recibo (#189)', () => {
  const ccc = (extra: Partial<CCC>): CCC => ({
    numero: '1', pais: 'ES', entidad: '2100', oficina: '0001', bic: 'CAIXESBBXXX', estado: 0,
    ibanFormateado: 'ES12 2100 0001 1234 5678 4321', nombreEntidad: 'CAIXABANK', descripcion: undefined,
    ...extra
  });

  it('una cuenta activa con IBAN correcto es válida', () => {
    expect(esCCCValido(ccc({}))).toBeTrue();
  });

  it('una cuenta de baja o rechazada no es válida', () => {
    expect(esCCCValido(ccc({ estado: -1 }))).toBeFalse();
  });

  it('una cuenta cuyo IBAN no pasa la validación no es válida', () => {
    expect(esCCCValido(ccc({ ibanFormateado: null as any }))).toBeFalse();
  });

  it('se describe con el principio y el final del IBAN y el banco', () => {
    expect(descripcionCCC(ccc({}))).toBe('ES12 …… 4321 — CAIXABANK');
    expect(descripcionCCC(ccc({ nombreEntidad: null as any }))).toBe('ES12 …… 4321');
  });

  it('se queda con la cuenta que ya tenía la dirección si es válida', () => {
    const cuentas = [ccc({ numero: '1' }), ccc({ numero: '2' })];
    expect(elegirCCC(cuentas, '2 ')).toBe('2');
  });

  it('si la que tenía no vale, propone la primera válida', () => {
    const cuentas = [ccc({ numero: '1', estado: -1 }), ccc({ numero: '2' })];
    expect(elegirCCC(cuentas, '1')).toBe('2');
    expect(elegirCCC(cuentas, null)).toBe('2');
  });

  it('sin ninguna válida no propone nada', () => {
    expect(elegirCCC([ccc({ estado: -1 })], '1')).toBeNull();
    expect(elegirCCC([], null)).toBeNull();
  });
});
