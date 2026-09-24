import { filtrarMencionables, insertarMencion, mencionEnCurso, trocearMenciones } from './menciones';

/** NestoApp#194 / NestoAPI#537: @menciones en los comentarios y sugerencias de Novedades. */
describe('menciones (#194)', () => {
  const personas = [
    { Nombre: 'Carlos', Clave: 'Carlos', Aplicacion: 'NestoApp' },
    { Nombre: 'María', Clave: 'María', Aplicacion: 'NestoApp' },
    { Nombre: 'Manuel', Clave: 'Manuel', Aplicacion: 'NestoApp' },
    { Nombre: 'Alfredo', Clave: 'Alfredo', Aplicacion: 'NestoApp' }
  ];

  describe('mencionEnCurso', () => {
    it('detecta la @ que se está escribiendo y lo tecleado tras ella', () => {
      expect(mencionEnCurso('Hola @Car', 9)).toEqual({ inicio: 5, filtro: 'Car' });
      expect(mencionEnCurso('@', 1)).toEqual({ inicio: 0, filtro: '' });
    });

    it('mira hasta el cursor, no hasta el final', () => {
      expect(mencionEnCurso('Hola @Ma y más texto', 8)).toEqual({ inicio: 5, filtro: 'Ma' });
    });

    it('un correo no es una mención, ni una mención ya terminada con espacio', () => {
      expect(mencionEnCurso('escribe a pepe@nueva', 20)).toBeNull();
      expect(mencionEnCurso('Hola @Carlos ', 13)).toBeNull();
      expect(mencionEnCurso('sin arroba', 10)).toBeNull();
    });
  });

  describe('filtrarMencionables', () => {
    it('sin tildes ni mayúsculas, y primero los que empiezan por lo escrito', () => {
      expect(filtrarMencionables(personas, 'mar').map(p => p.Nombre)).toEqual(['María']);
      expect(filtrarMencionables(personas, 'MA').map(p => p.Nombre)).toEqual(['María', 'Manuel']);
      expect(filtrarMencionables(personas, 'los').map(p => p.Nombre)).toEqual(['Carlos']);
    });

    it('sin nada escrito, todos (hasta el máximo)', () => {
      expect(filtrarMencionables(personas, '').length).toBe(4);
      expect(filtrarMencionables(personas, '', 2).length).toBe(2);
    });
  });

  describe('insertarMencion', () => {
    it('sustituye lo tecleado por @Nombre y un espacio, y deja el cursor detrás', () => {
      expect(insertarMencion('Hola @Car, mira', 5, 9, 'Carlos')).toEqual({ texto: 'Hola @Carlos , mira', cursor: 13 });
    });
  });

  describe('trocearMenciones', () => {
    it('separa las menciones para pintarlas resaltadas, pero no los correos', () => {
      expect(trocearMenciones('Gracias @María, escribe a pepe@nueva.es')).toEqual([
        { texto: 'Gracias ', mencion: false },
        { texto: '@María', mencion: true },
        { texto: ', escribe a pepe@nueva.es', mencion: false }
      ]);
    });

    it('sin menciones, un solo trozo; sin texto, ninguno', () => {
      expect(trocearMenciones('Nada')).toEqual([{ texto: 'Nada', mencion: false }]);
      expect(trocearMenciones('')).toEqual([]);
    });
  });
});
