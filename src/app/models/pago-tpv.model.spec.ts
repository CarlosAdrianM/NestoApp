import { textoAvisosEnlacePago } from './pago-tpv.model';

describe('Avisos al generar un enlace de pago (NestoAPI#679)', () => {
  it('junta los textos de los avisos', () => {
    expect(textoAvisosEnlacePago({ Avisos: [
      { Codigo: 'PedidoContraReembolso', Texto: 'El pedido 928521 va contra reembolso.' },
      { Codigo: 'Otro', Texto: ' Otro aviso ' }
    ] } as any)).toBe('El pedido 928521 va contra reembolso.\n\nOtro aviso');
  });

  it('sin avisos (o con una API vieja), nada', () => {
    expect(textoAvisosEnlacePago({ Avisos: [] } as any)).toBe('');
    expect(textoAvisosEnlacePago({} as any)).toBe('');
    expect(textoAvisosEnlacePago(null)).toBe('');
  });
});
