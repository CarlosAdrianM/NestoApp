import { OpcionesModosPedido, casillaServirPendienteVisible, facturacionVisible, servirPendienteParaGuardar } from './opciones-modos.model';

/** NestoApp#242 / NestoAPI#688: opciones de servicio y facturación y la casilla «Servir lo pendiente…». */
describe('Opciones de modos del pedido (#242)', () => {
  const opciones = (facturacionVisible: boolean, casillaVisible: boolean, valor = true): OpcionesModosPedido => ({
    Servicio: { Modo: 3, Nombre: 'Tras reponer de tiendas', LineasVerdes: 0, LineasRosas: 1, LineasRojas: 0, Motivo: 'x' },
    Facturacion: { Modo: 1, Nombre: 'Por entregas', Motivo: '', ModosPermitidos: [1, 2, 3], Modos: [], Visible: facturacionVisible, MotivoOculta: facturacionVisible ? null : 'Con «Todo junto»…' },
    ServirPendienteAlHaberStock: { Visible: casillaVisible, Valor: valor, Motivo: casillaVisible ? null : 'Solo con «Todo ahora»' }
  });

  it('con «Todo junto» la API oculta el selector de facturación', () => {
    expect(facturacionVisible(opciones(false, false))).toBeFalse();
    expect(facturacionVisible(opciones(true, false))).toBeTrue();
  });

  it('con una API anterior (sin respuesta) todo se enseña como siempre y la casilla no', () => {
    expect(facturacionVisible(null)).toBeTrue();
    expect(casillaServirPendienteVisible(null)).toBeFalse();
  });

  it('la casilla solo con «Todo ahora»', () => {
    expect(casillaServirPendienteVisible(opciones(true, true))).toBeTrue();
    expect(casillaServirPendienteVisible(opciones(true, false))).toBeFalse();
  });

  it('al guardar solo viaja si el vendedor tocó la casilla o cambió la facturación', () => {
    expect(servirPendienteParaGuardar(opciones(true, true), true, false, false)).toBeNull();
    expect(servirPendienteParaGuardar(opciones(true, true), false, true, false)).toBeFalse();
    expect(servirPendienteParaGuardar(opciones(true, true), true, false, true)).toBeTrue();
  });

  it('con la casilla oculta nunca viaja (la API daría 400)', () => {
    expect(servirPendienteParaGuardar(opciones(true, false), true, true, true)).toBeNull();
    expect(servirPendienteParaGuardar(null, true, true, true)).toBeNull();
  });
});
