import { hayQueAvisarCondicionesCampana, peticionAvisoCondicionesCampana } from './aviso-condiciones-campana.model';

/** NestoApp#275: aviso de pago al contado con productos de una campaña (feria online). */
describe('Aviso de condiciones de campaña (#275)', () => {
  it('la petición lleva los productos sin repetir, la forma de pago, los plazos y el prepago', () => {
    const pedido = { empresa: '1 ', formaPago: 'RCB', plazosPago: '1/30', Lineas: [{ producto: '45383 ' }, { producto: '45670' }, { producto: '45383' }, { texto: 'sin producto' }] };
    expect(peticionAvisoCondicionesCampana(pedido, false)).toEqual({ Empresa: '1', Productos: ['45383', '45670'], FormaPago: 'RCB', PlazosPago: '1/30', TienePrepago: false, DescuentoPP: 0 });
    expect(peticionAvisoCondicionesCampana(pedido, true).TienePrepago).toBeTrue();
  });

  it('sin pedido o sin productos no hay nada que preguntar', () => {
    expect(peticionAvisoCondicionesCampana(null)).toBeNull();
    expect(peticionAvisoCondicionesCampana({ empresa: '1', Lineas: [] })).toBeNull();
  });

  it('solo se avisa si la API lo dice y trae el texto y los plazos propuestos', () => {
    expect(hayQueAvisarCondicionesCampana({ Avisar: true, Mensaje: '¿Cambiar a contado?', PlazosPagoPropuestos: 'CONTADO' })).toBeTrue();
    expect(hayQueAvisarCondicionesCampana({ Avisar: false, Mensaje: null, PlazosPagoPropuestos: null, Productos: [] })).toBeFalse();
    expect(hayQueAvisarCondicionesCampana({ Avisar: true, Mensaje: '¿Cambiar?', PlazosPagoPropuestos: '' })).toBeFalse();
    expect(hayQueAvisarCondicionesCampana(null)).toBeFalse();
  });
});
