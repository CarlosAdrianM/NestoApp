import { ChequeRegaloCliente, baseComputableCheque, faltaParaMinimoCheque, esLineaChequeRegalo } from './cheque-regalo.model';

/** NestoApp#222 (gemela de NestoAPI#593 c5): el cheque regalo del cliente en la plantilla. */
describe('Cheque regalo en el pedido (#222)', () => {
  const cheque: ChequeRegaloCliente = {
    Producto: 'CHEQUE50_OCT26', Importe: 50, MinimoCanje: 250, CanjeHasta: '2026-11-07T00:00:00',
    PrefijosNombreExcluidosMinimo: ['PACK 26'], GruposExcluidosMinimo: ['PEL'],
    Estado: 'Disponible', SePuedeUsar: true, Mensaje: 'Tiene un cheque de 50 €', PedidoCanje: null, TextoLinea: 'Cheque regalo octubre'
  };

  it('para el mínimo cuentan las líneas de producto con su descuento', () => {
    const lineas = [
      { producto: '1', texto: 'CREMA', grupo: 'COS', cantidad: 2, precio: 100, descuento: 0.1 },
      { producto: '2', texto: 'SERUM', grupo: 'COS', cantidad: 1, precio: 50, descuento: 0 }
    ];
    expect(baseComputableCheque(lineas, cheque)).toBe(230);
  });

  it('no cuentan la peluquería ni los «PACK 26»', () => {
    const lineas = [
      { producto: '1', texto: 'CREMA', grupo: 'COS', cantidad: 1, precio: 100, descuento: 0 },
      { producto: '2', texto: 'TINTE', grupo: 'PEL', cantidad: 1, precio: 300, descuento: 0 },
      { producto: '3', texto: 'pack 26 otoño', grupo: 'COS', cantidad: 1, precio: 300, descuento: 0 }
    ];
    expect(baseComputableCheque(lineas, cheque)).toBe(100);
  });

  it('la propia línea del cheque no cuenta', () => {
    const lineas = [
      { producto: '1', texto: 'CREMA', grupo: 'COS', cantidad: 3, precio: 100, descuento: 0 },
      { producto: 'CHEQUE50_OCT26', texto: 'Cheque', grupo: null, cantidad: -1, precio: 50, descuento: 0 }
    ];
    expect(baseComputableCheque(lineas, cheque)).toBe(300);
  });

  it('cuánto falta para el mínimo (0 si ya lo supera)', () => {
    expect(faltaParaMinimoCheque(230, cheque)).toBe(20.01);
    expect(faltaParaMinimoCheque(300, cheque)).toBe(0);
  });

  it('reconoce la línea del cheque por su producto', () => {
    expect(esLineaChequeRegalo({ producto: 'CHEQUE50_OCT26  ' }, cheque)).toBeTrue();
    expect(esLineaChequeRegalo({ producto: '12345' }, cheque)).toBeFalse();
    expect(esLineaChequeRegalo({ producto: 'CHEQUE50_OCT26' }, null)).toBeFalse();
  });
});
