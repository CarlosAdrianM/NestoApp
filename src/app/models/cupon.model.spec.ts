import { cuponesUsables, esLineaCupon } from './cupon.model';

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
