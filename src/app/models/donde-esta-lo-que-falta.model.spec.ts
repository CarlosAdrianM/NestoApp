import { DondeEstaLoQueFalta, frasesDondeEstaLoQueFalta } from './donde-esta-lo-que-falta.model';

describe('¿Dónde está lo que falta? (#289)', () => {
  const texto = '43818 MULTIVIT GLOW CREMA RICA (1 ud.): viene en la reposición 81463 de Alcobendas, recogida por Miguel el miércoles 18/11 a las 12:53; pendiente de recibir en Algete.';
  const base: DondeEstaLoQueFalta = { Empresa: '1', Pedido: 930942, TodoEnAlgete: false, Productos: [] };

  it('con todo en Algete basta el mensaje', () => {
    expect(frasesDondeEstaLoQueFalta({ ...base, TodoEnAlgete: true, Mensaje: 'Todo está en Algete (picking 55).',
      Productos: [{ Producto: '1', Nombre: 'x', Unidades: 1, Texto: 'no se pinta' }] })).toEqual(['Todo está en Algete (picking 55).']);
  });

  it('una línea por producto con el texto de la API', () => {
    expect(frasesDondeEstaLoQueFalta({ ...base, Productos: [{ Producto: '43818', Nombre: 'MULTIVIT', Unidades: 1, Texto: texto }] }))
      .toEqual([texto]);
  });

  it('el mensaje va delante de los productos si viene', () => {
    expect(frasesDondeEstaLoQueFalta({ ...base, Mensaje: 'Falta 1 producto.', Productos: [{ Producto: '43818', Nombre: 'M', Unidades: 1, Texto: texto }] }))
      .toEqual(['Falta 1 producto.', texto]);
  });

  it('sin respuesta no pinta nada', () => {
    expect(frasesDondeEstaLoQueFalta(null)).toEqual([]);
  });
});
