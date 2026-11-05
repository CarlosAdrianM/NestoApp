import { cuponesUsables, esLineaCupon, textoPedidoMinimoCupon } from './cupon.model';

describe('Cupones del cliente (#217)', () => {
  const cupon = (extra: any = {}): any => ({ Codigo: 'EV-2610-7K3Q', Producto: 'CUPONEVENTO', Importe: 50, SePuedeUsar: true, Estado: 'Activo', ...extra });

  it('solo se pueden aplicar los activos', () => {
    expect(cuponesUsables([cupon(), cupon({ Codigo: 'EV-X', SePuedeUsar: false, Estado: 'Emitido' })]).map(c => c.Codigo)).toEqual(['EV-2610-7K3Q']);
    expect(cuponesUsables(null)).toEqual([]);
  });

  it('reconoce la línea del cupón por su producto', () => {
    expect(esLineaCupon({ producto: 'cuponevento ' }, [cupon()])).toBeTrue();
    expect(esLineaCupon({ producto: '38000' }, [cupon()])).toBeFalse();
    expect(esLineaCupon({ producto: 'CUPONEVENTO' }, [])).toBeFalse();
  });
});

/** NestoApp#256 (NestoAPI#613): el mínimo lo define el evento; puede ser 0. */
describe('Pedido mínimo del cupón (#256)', () => {
  const euros = (importe: number) => `${importe.toFixed(2).replace('.', ',')} €`;

  it('con mínimo, se dice el de la API (no el doble del importe)', () => {
    expect(textoPedidoMinimoCupon({ Importe: 50, PedidoMinimo: 75 } as any, euros))
      .toBe('El pedido tiene que llevar al menos 75,00 € de productos (IVA incluido, sin contar cursos ni portes). Al guardar lo comprueba el servidor.');
  });

  it('con 0 (o sin dato) no se habla de pedido mínimo', () => {
    expect(textoPedidoMinimoCupon({ Importe: 50, PedidoMinimo: 0 } as any, euros)).toContain('sin pedido mínimo');
    expect(textoPedidoMinimoCupon({ Importe: 50 } as any, euros)).toContain('sin pedido mínimo');
    expect(textoPedidoMinimoCupon(null, euros)).toBe('');
  });
});
