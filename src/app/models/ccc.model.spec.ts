import { CCC, descripcionCCC, elegirCCC, esCCCValido, motivoCCCNoValido } from './ccc.model';

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

  // Nesto#486 / NestoAPI 69102110: la API dice si cada cuenta vale, con la regla de la remesa.
  describe('con la validez que manda la API', () => {
    it('manda la API, aunque la regla local dijese otra cosa', () => {
      expect(esCCCValido(ccc({ validoParaRecibo: false, motivoNoValido: 'IBAN incompleto' }))).toBeFalse();
      expect(esCCCValido(ccc({ estado: -1, validoParaRecibo: true }))).toBeTrue();
    });

    it('el motivo es el de la API; sin él, uno propio', () => {
      expect(motivoCCCNoValido(ccc({ validoParaRecibo: false, motivoNoValido: 'La cuenta está de baja' }))).toBe('La cuenta está de baja');
      expect(motivoCCCNoValido(ccc({ estado: -1 }))).toBe('La cuenta está de baja o rechazada');
      expect(motivoCCCNoValido(ccc({ ibanFormateado: null as any }))).toBe('El IBAN no es correcto');
      expect(motivoCCCNoValido(ccc({}))).toBeNull();
    });

    it('si la de la dirección no vale, antes que la primera válida va la de la ficha', () => {
      const cuentas = [
        ccc({ numero: '1', validoParaRecibo: false }),
        ccc({ numero: '2', validoParaRecibo: true }),
        ccc({ numero: '3', validoParaRecibo: true, esDeLaFicha: true })
      ];
      expect(elegirCCC(cuentas, '1')).toBe('3');
      expect(elegirCCC(cuentas, '2')).toBe('2'); // la de la dirección, si vale, manda
    });

    it('la de la ficha no se propone si no vale', () => {
      const cuentas = [ccc({ numero: '2', validoParaRecibo: true }), ccc({ numero: '3', validoParaRecibo: false, esDeLaFicha: true })];
      expect(elegirCCC(cuentas, null)).toBe('2');
    });
  });
});
