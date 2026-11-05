import { AVISO_HORARIO_PREFERIBLE, avisoHorarioPreferible, textoHorarioPreferible } from './horario-preferible.model';

/** NestoApp#260 (NestoAPI#763): horario preferible de entrega. */
describe('Horario preferible (#260)', () => {
  it('el texto de la API o «Sin horario preferible»', () => {
    expect(textoHorarioPreferible({ Texto: 'L-V 10:00-14:00; S 10:00-13:00' })).toBe('L-V 10:00-14:00; S 10:00-13:00');
    expect(textoHorarioPreferible({ Texto: '' })).toBe('Sin horario preferible');
    expect(textoHorarioPreferible(null)).toBe('Sin horario preferible');
  });

  it('el aviso siempre dice que no hay compromiso (el de la API o el nuestro)', () => {
    expect(avisoHorarioPreferible({ Aviso: 'Lo intentaremos.' })).toBe('Lo intentaremos.');
    expect(avisoHorarioPreferible(null)).toBe(AVISO_HORARIO_PREFERIBLE);
    expect(AVISO_HORARIO_PREFERIBLE).toContain('no hay compromiso');
    expect(AVISO_HORARIO_PREFERIBLE.toLowerCase()).not.toContain('horario de entrega');
  });
});
