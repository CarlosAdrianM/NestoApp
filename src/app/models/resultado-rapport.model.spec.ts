import {
  RESULTADOS_RAPPORT, MOTIVOS_CAMBIO_ESTADO, nombreResultadoRapport, nombreMotivoCambioEstado,
  alternarResultadoRapport, proximoContactoParaApi, comentarioCambioEstadoParaApi
} from './resultado-rapport.model';

/** NestoApp#253 / NestoAPI#716: catálogos cerrados del rapport y del cambio de estado. */
describe('Resultado del rapport y motivo del cambio de estado (#253)', () => {
  it('los códigos son los del catálogo de la API, en su orden', () => {
    expect(RESULTADOS_RAPPORT.map(r => r.codigo)).toEqual([
      'Pedido', 'PediraMasTarde', 'NoNecesita', 'Precio', 'Competencia', 'CerradoTraspaso', 'SinStock', 'NoDecide', 'SoloInformacion', 'Otro'
    ]);
    expect(MOTIVOS_CAMBIO_ESTADO.map(m => m.codigo)).toEqual([
      'Cierre', 'Traspaso', 'Competencia', 'Impago', 'SinActividad', 'Duplicado', 'CambioTitular', 'PeticionCliente',
      'Distribuidor', 'PublicoFinal', 'Reactivacion', 'Otro'
    ]);
  });

  it('el nombre para pintar lleva tildes; un código desconocido se enseña tal cual', () => {
    expect(nombreResultadoRapport('PediraMasTarde')).toBe('Pedirá más tarde');
    expect(nombreResultadoRapport('CerradoTraspaso')).toBe('Cerrado / traspaso');
    expect(nombreResultadoRapport('Raro')).toBe('Raro');
    expect(nombreResultadoRapport(null)).toBe('');
    expect(nombreMotivoCambioEstado('Reactivacion')).toBe('Reactivación');
  });

  it('un chip solo: tocar el marcado lo desmarca', () => {
    expect(alternarResultadoRapport(null, 'Precio')).toBe('Precio');
    expect(alternarResultadoRapport('Precio', 'Precio')).toBeNull();
    expect(alternarResultadoRapport('Precio', 'Otro')).toBe('Otro');
  });

  it('el próximo contacto va solo con la fecha', () => {
    expect(proximoContactoParaApi('2026-11-09T00:00:00+01:00')).toBe('2026-11-09');
    expect(proximoContactoParaApi(new Date(2026, 10, 9))).toBe('2026-11-09');
    expect(proximoContactoParaApi('')).toBeNull();
    expect(proximoContactoParaApi(null)).toBeNull();
  });

  it('el comentario del cambio de estado se recorta a 200 y vacío es null', () => {
    expect(comentarioCambioEstadoParaApi('  ')).toBeNull();
    expect(comentarioCambioEstadoParaApi('x'.repeat(250)).length).toBe(200);
    expect(comentarioCambioEstadoParaApi(' Cierra en diciembre ')).toBe('Cierra en diciembre');
  });
});
