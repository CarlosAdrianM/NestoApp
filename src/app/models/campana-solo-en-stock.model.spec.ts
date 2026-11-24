import {
  cambioQueImportaAlStockDeCampana, hayQuePreguntarCampanaSoloEnStock, hayQueRecargarPorCampana,
  mensajesCampanaSoloEnStock, PREGUNTA_CAMPANA_SOLO_EN_STOCK, textoPreguntaCampanaSoloEnStock
} from './campana-solo-en-stock.model';

describe('campana-solo-en-stock.model (NestoApp#293)', () => {
  describe('hayQuePreguntarCampanaSoloEnStock', () => {
    it('pregunta si la API dice que hay aviso y trae el mensaje', () => {
      expect(hayQuePreguntarCampanaSoloEnStock({ HayAviso: true, Mensaje: 'Del 45929 hay 2 de 5.' })).toBeTrue();
    });

    it('no pregunta sin aviso, sin mensaje o sin respuesta', () => {
      expect(hayQuePreguntarCampanaSoloEnStock({ HayAviso: false, Mensaje: 'x' })).toBeFalse();
      expect(hayQuePreguntarCampanaSoloEnStock({ HayAviso: true, Mensaje: '  ' })).toBeFalse();
      expect(hayQuePreguntarCampanaSoloEnStock(null)).toBeFalse();
      expect(hayQuePreguntarCampanaSoloEnStock(undefined)).toBeFalse();
    });
  });

  it('el texto del diálogo es el mensaje, una línea en blanco y la pregunta', () => {
    expect(textoPreguntaCampanaSoloEnStock({ HayAviso: true, Mensaje: 'Del 45929 hay 2 de 5. ' }))
      .toBe(`Del 45929 hay 2 de 5.\n\n${PREGUNTA_CAMPANA_SOLO_EN_STOCK}`);
  });

  describe('mensajesCampanaSoloEnStock', () => {
    it('saca solo los avisos de la campaña e ignora los tipos que no conoce', () => {
      const avisos = [
        { Tipo: 'CampanaSoloEnStock', Mensaje: 'Solo hay 2 de 5.' },
        { Tipo: 'PrepagoConservado', Mensaje: 'Se conserva el prepago.' },
        { Tipo: 'CampanaSoloEnStockAplicado', Mensaje: 'Se ha partido la línea.' },
        { Tipo: 'OtroQueNoExiste', Mensaje: 'x' }
      ];
      expect(mensajesCampanaSoloEnStock(avisos)).toEqual(['Solo hay 2 de 5.', 'Se ha partido la línea.']);
    });

    it('acepta las claves en camelCase y aguanta listas vacías o nulas', () => {
      expect(mensajesCampanaSoloEnStock([{ tipo: 'CampanaSoloEnStock', mensaje: 'Hay 1 de 3.' }])).toEqual(['Hay 1 de 3.']);
      expect(mensajesCampanaSoloEnStock(null)).toEqual([]);
      expect(mensajesCampanaSoloEnStock([{ Tipo: 'CampanaSoloEnStock' }])).toEqual([]);
    });
  });

  it('solo hay que recargar cuando la API ha partido líneas (aviso «Aplicado»)', () => {
    expect(hayQueRecargarPorCampana([{ Tipo: 'CampanaSoloEnStockAplicado', Mensaje: 'x' }])).toBeTrue();
    expect(hayQueRecargarPorCampana([{ Tipo: 'CampanaSoloEnStock', Mensaje: 'x' }])).toBeFalse();
    expect(hayQueRecargarPorCampana(undefined)).toBeFalse();
  });

  describe('cambioQueImportaAlStockDeCampana', () => {
    const alCargar = [
      { id: 10, tipoLinea: 1, Producto: '45929', Cantidad: 2 },
      { id: 11, tipoLinea: 1, Producto: '43818', Cantidad: 1 },
      { id: 12, tipoLinea: 0, Producto: null, Cantidad: 0 }
    ];

    it('no importa si no cambia nada', () => {
      expect(cambioQueImportaAlStockDeCampana(alCargar.map(l => ({ ...l })), alCargar)).toBeFalse();
    });

    it('importa si se añade una línea de producto nueva', () => {
      const ahora = [...alCargar, { id: 0, tipoLinea: 1, Producto: '12345', Cantidad: 1 }];
      expect(cambioQueImportaAlStockDeCampana(ahora, alCargar)).toBeTrue();
    });

    it('importa si sube la cantidad de una línea que ya estaba', () => {
      const ahora = alCargar.map(l => l.id === 10 ? { ...l, Cantidad: 5 } : { ...l });
      expect(cambioQueImportaAlStockDeCampana(ahora, alCargar)).toBeTrue();
    });

    it('no importa si baja la cantidad, se quita una línea o se añade una de texto', () => {
      const baja = alCargar.map(l => l.id === 10 ? { ...l, Cantidad: 1 } : { ...l });
      expect(cambioQueImportaAlStockDeCampana(baja, alCargar)).toBeFalse();
      expect(cambioQueImportaAlStockDeCampana(alCargar.slice(1), alCargar)).toBeFalse();
      const conTexto = [...alCargar, { id: 0, tipoLinea: 0, Producto: null, Cantidad: 0 }];
      expect(cambioQueImportaAlStockDeCampana(conTexto, alCargar)).toBeFalse();
    });
  });
});
