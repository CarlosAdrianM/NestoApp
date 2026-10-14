import { RespuestaRevisarConcepto, hayQuePreguntarConcepto, textoPreguntaConcepto } from './revision-concepto.model';

/** NestoApp#216 (NestoAPI#609): proponer la corrección del concepto del enlace de pago. */
describe('Revisión del concepto del enlace de pago (#216)', () => {
  const respuesta = (cambios: Partial<RespuestaRevisarConcepto> = {}): RespuestaRevisarConcepto => ({
    Original: 'Señal curso quiromasage', Propuesto: 'Señal curso quiromasaje', HayCambios: true,
    Cambios: [{ De: 'quiromasage', A: 'quiromasaje' }], ...cambios
  });

  it('se pregunta solo si hay cambios', () => {
    expect(hayQuePreguntarConcepto(respuesta())).toBeTrue();
    expect(hayQuePreguntarConcepto(respuesta({ HayCambios: false }))).toBeFalse();
    expect(hayQuePreguntarConcepto(respuesta({ Propuesto: '  ' }))).toBeFalse();
    expect(hayQuePreguntarConcepto(null)).toBeFalse();
  });

  it('la pregunta enseña la propuesta y cada cambio', () => {
    expect(textoPreguntaConcepto(respuesta())).toBe('«Señal curso quiromasaje»\n\n• quiromasage → quiromasaje');
  });
});
