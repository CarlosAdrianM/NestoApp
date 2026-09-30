import { puedeCambiarClientePedido, mensajeCambiosCliente } from './cambio-cliente-pedido.model';

/** NestoApp#198 / NestoAPI#519: pasar a otro cliente un pedido que todavía no ha salido. */
describe('Cambiar el cliente de un pedido (#198)', () => {
  const linea = (datos: any = {}) => ({ picking: 0, estado: 1, yaFacturado: false, ...datos });
  const pedido = (lineas: any[], numero = 922500) => ({ numero, Lineas: lineas });

  it('se puede con un pedido guardado sin picking, albarán ni factura', () => {
    expect(puedeCambiarClientePedido(pedido([linea(), linea({ estado: -1 })]))).toBeTrue();
  });

  it('no se puede si alguna línea tiene picking, está en albarán o factura, o ya está facturada', () => {
    expect(puedeCambiarClientePedido(pedido([linea(), linea({ picking: 5 })]))).toBeFalse();
    expect(puedeCambiarClientePedido(pedido([linea({ estado: 2 })]))).toBeFalse();
    expect(puedeCambiarClientePedido(pedido([linea({ estado: 4 })]))).toBeFalse();
    expect(puedeCambiarClientePedido(pedido([linea({ yaFacturado: true })]))).toBeFalse();
  });

  it('no se puede sin pedido guardado', () => {
    expect(puedeCambiarClientePedido(pedido([linea()], 0))).toBeFalse();
    expect(puedeCambiarClientePedido(null)).toBeFalse();
  });

  it('enseña los cambios uno por línea y sin dejar colar HTML', () => {
    const mensaje = mensajeCambiosCliente({
      Empresa: '1', Numero: 922500, ClienteAnterior: '15191', ContactoAnterior: '0', Cliente: '20000', Contacto: '0',
      Cambios: ['Forma de pago: EFC → RCB', 'Precio de 38093: 10,00 € → 9,50 €', '<b>x</b>']
    });
    expect(mensaje).toContain('Pedido 922500: del cliente 15191/0 al 20000/0.');
    expect(mensaje).toContain('Forma de pago: EFC → RCB<br>');
    expect(mensaje).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('sin cambios, lo dice', () => {
    const mensaje = mensajeCambiosCliente({
      Empresa: '1', Numero: 922500, ClienteAnterior: '15191', ContactoAnterior: '0', Cliente: '20000', Contacto: '1', Cambios: []
    });
    expect(mensaje).toContain('No ha cambiado nada más del pedido.');
  });
});
