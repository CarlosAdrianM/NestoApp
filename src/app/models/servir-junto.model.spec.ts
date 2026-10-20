import { conAvisoTodoJunto, lineasQueImpidenSalirDeTodoJunto, textoOfrecerQuitarLineas } from './servir-junto.model';

describe('Quitar las líneas que impiden salir de «Todo junto» (#232)', () => {
  const lineas = [{ producto: '17404 ' }, { producto: '20000' }, { producto: 'muestra1' }];
  const producto = (l: any) => l.producto;

  it('devuelve las líneas de los productos problemáticos (sin espacios ni mayúsculas)', () => {
    const problematicos = [{ ProductoId: '17404', ProductoNombre: 'Muestra', AlmacenConStock: null },
      { ProductoId: 'MUESTRA1', ProductoNombre: 'Otra', AlmacenConStock: null }];
    expect(lineasQueImpidenSalirDeTodoJunto(problematicos, lineas, producto)).toEqual([lineas[0], lineas[2]]);
  });

  it('si algún problemático no está en las líneas, no se ofrece', () => {
    const problematicos = [{ ProductoId: '17404', ProductoNombre: '', AlmacenConStock: null },
      { ProductoId: '99999', ProductoNombre: 'Regalo Ganavisiones', AlmacenConStock: null }];
    expect(lineasQueImpidenSalirDeTodoJunto(problematicos, lineas, producto)).toBeNull();
  });

  it('sin problemáticos, no se ofrece', () => {
    expect(lineasQueImpidenSalirDeTodoJunto([], lineas, producto)).toBeNull();
    expect(lineasQueImpidenSalirDeTodoJunto(null, lineas, producto)).toBeNull();
  });

  it('la pregunta nombra el modo y las líneas', () => {
    const texto = textoOfrecerQuitarLineas('Según vaya entrando', ['17404 Muestra crema']);
    expect(texto).toContain('«Según vaya entrando»');
    expect(texto).toContain(' · 17404 Muestra crema');
    expect(texto).toContain('¿Quiere quitarlas del pedido');
  });

  it('el mensaje de la API acaba diciendo que se queda en «Todo junto»', () => {
    expect(conAvisoTodoJunto('No hay stock')).toBe('No hay stock. El pedido se queda en «Todo junto».');
    expect(conAvisoTodoJunto('No hay stock.')).toBe('No hay stock. El pedido se queda en «Todo junto».');
  });
});
