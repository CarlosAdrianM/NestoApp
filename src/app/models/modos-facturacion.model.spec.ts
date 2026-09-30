import {
  MODOS_FACTURACION, LISTA_MODOS_FACTURACION, modoFacturacionDerivado, esModoFacturacionPermitido,
  huellaModoFacturacion, selectorFacturacionBloqueado, nombreModoFacturacion
} from './modos-facturacion.model';

describe('Modos de facturación (#197 / NestoAPI#542)', () => {

  it('los nombres son los del contrato de la API', () => {
    expect(LISTA_MODOS_FACTURACION.map(m => m.nombre)).toEqual([
      'Por entregas', 'Al completar el pedido', 'Todo ahora, lo pendiente se entrega después'
    ]);
    expect(nombreModoFacturacion(3)).toBe('Todo ahora, lo pendiente se entrega después');
  });

  it('sin modo, se deriva de mantenerJunto', () => {
    expect(modoFacturacionDerivado(null, true)).toBe(MODOS_FACTURACION.AL_COMPLETAR);
    expect(modoFacturacionDerivado(undefined, false)).toBe(MODOS_FACTURACION.POR_ENTREGAS);
  });

  it('con modo, manda el modo', () => {
    expect(modoFacturacionDerivado(3, false)).toBe(MODOS_FACTURACION.TODO_AHORA);
    expect(modoFacturacionDerivado(1, false)).toBe(MODOS_FACTURACION.POR_ENTREGAS);
  });

  it('un modo que la sugerencia no permite no se puede elegir; sin sugerencia, todos', () => {
    const modos = [
      { Modo: 1, Nombre: 'Por entregas', Permitido: false, Motivo: 'Los plazos no son los de la ficha' },
      { Modo: 2, Nombre: 'Al completar el pedido', Permitido: true, Motivo: null }
    ];
    expect(esModoFacturacionPermitido(modos, 1)).toBeFalse();
    expect(esModoFacturacionPermitido(modos, 2)).toBeTrue();
    expect(esModoFacturacionPermitido(null, 1)).toBeTrue();
  });

  it('la huella solo mira los campos de los que depende la regla (no las líneas ni el modo)', () => {
    const pedido: any = {
      empresa: '1', numero: 0, cliente: '15191', contacto: '0', contactoCobro: '0',
      plazosPago: 'CONTADO', periodoFacturacion: 'NRM', notaEntrega: false,
      mantenerJunto: false, modoFacturacion: null, Lineas: []
    };
    const base = huellaModoFacturacion(pedido);

    expect(huellaModoFacturacion({ ...pedido, Lineas: [{ producto: '38093' }] })).toBe(base);
    expect(huellaModoFacturacion({ ...pedido, modoFacturacion: 2, mantenerJunto: true })).toBe(base);
    expect(huellaModoFacturacion({ ...pedido, plazosPago: '30D' })).not.toBe(base);
    expect(huellaModoFacturacion({ ...pedido, contacto: '1' })).not.toBe(base);
    expect(huellaModoFacturacion({ ...pedido, periodoFacturacion: 'FDM' })).not.toBe(base);
    expect(huellaModoFacturacion({ ...pedido, numero: 901234 })).not.toBe(base);
  });

  it('una nota de entrega (ModosPermitidos vacío) bloquea el selector entero', () => {
    expect(selectorFacturacionBloqueado({ Modo: 1, Nombre: '', Motivo: '', ModosPermitidos: [], Modos: [] })).toBeTrue();
    expect(selectorFacturacionBloqueado({ Modo: 2, Nombre: '', Motivo: '', ModosPermitidos: [2, 3], Modos: [] })).toBeFalse();
    expect(selectorFacturacionBloqueado(null)).toBeFalse();
  });
});
