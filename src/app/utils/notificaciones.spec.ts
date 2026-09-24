import { rutaDeNotificacion } from './notificaciones';

/** NestoApp#193 / Nesto#477: a dónde lleva tocar una push. */
describe('rutaDeNotificacion (#193)', () => {
  it('si trae ruta, esa', () => {
    expect(rutaDeNotificacion({ ruta: '/lista-pedidos-venta' })).toBe('/lista-pedidos-venta');
  });

  it('«Te han contestado en Novedades» abre el perfil en la novedad y el comentario', () => {
    const ruta = rutaDeNotificacion({ tipo: 'NovedadComentario', novedadId: '360', comentarioId: '1234' }, 99);

    expect(ruta).toBe('/profile?novedad=360&comentario=1234&aviso=99');
  });

  it('una mención al sugerir no trae comentario: abre la sugerencia', () => {
    expect(rutaDeNotificacion({ tipo: 'NovedadComentario', novedadId: '360' }, 99)).toBe('/profile?novedad=360&aviso=99');
  });

  it('sin ruta ni tipo conocido (o sin novedad), a ningún sitio', () => {
    expect(rutaDeNotificacion({ tipo: 'Otro' })).toBeNull();
    expect(rutaDeNotificacion({ tipo: 'NovedadComentario' })).toBeNull();
    expect(rutaDeNotificacion(undefined)).toBeNull();
  });
});
