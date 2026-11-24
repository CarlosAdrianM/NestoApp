import { LineaVenta } from '../components/linea-venta/linea-venta';
import { fotoDelPedido, fusionarCambiosPedido, resolverConflicto } from './fusion-cambios-pedido.model';

/** Mismos casos que FusionCambiosPedidoTests.cs de Nesto (Nesto#642), menos los de prepagos (la app no los toca). */
describe('fusion-cambios-pedido.model — «Recargar conservando mis cambios» (NestoApp#285)', () => {
  const linea = (id: number, producto: string, cantidad: number, extra: any = {}) => ({
    id, tipoLinea: 1, Producto: producto, texto: `Producto ${producto}`, Cantidad: cantidad, PrecioUnitario: 10,
    DescuentoLinea: 0, DescuentoProducto: 0, AplicarDescuento: true, iva: 'G21', PorcentajeIva: 0.21,
    PorcentajeRecargoEquivalencia: 0, fechaEntrega: '2026-11-25T00:00:00', almacen: 'ALG', formaVenta: 'VAR',
    delegacion: 'ALG', oferta: null, vistoBueno: false, estado: 1, picking: 0, ...extra
  });
  const pedido = (lineas: any[], extra: any = {}) => ({
    empresa: '1', numero: 929555, cliente: '15191', contacto: '0', formaPago: 'EFC', plazosPago: 'CONTADO',
    comentarios: null, comentarioPicking: null, vendedor: 'NV', ruta: 'AT', iva: 'G21', modoServicio: 1, servirJunto: true,
    Lineas: lineas, ...extra
  });
  const copia = (p: any) => JSON.parse(JSON.stringify(p));
  /** El pedido al cargarlo, lo que tiene el usuario en pantalla y lo que hay ahora en el servidor, a partir de uno. */
  const escenario = (base: any, cambioMio: (p: any) => void, cambioDelOtro: (p: any) => void) => {
    const mio = copia(base), servidor = copia(base);
    cambioMio(mio);
    cambioDelOtro(servidor);
    return fusionarCambiosPedido(fotoDelPedido(base), mio, servidor);
  };
  const base = () => pedido([linea(101, '38093', 5), linea(102, '45929', 2), linea(103, '43818', 1)]);

  it('las líneas nuevas se añaden sin Nº de orden y nunca chocan', () => {
    const r = escenario(base(),
      mio => mio.Lineas.push(linea(0, '12345', 3)),
      otro => otro.Lineas.push(linea(104, '99999', 1)));

    expect(r.conflictos.length).toBe(0);
    expect(r.cambiosAplicados).toBe(1);
    expect(r.pedido.Lineas.map((l: any) => l.Producto)).toEqual(['38093', '45929', '43818', '99999', '12345']);
    expect(r.pedido.Lineas[4].id).toBe(0);
  });

  it('una línea en blanco no se añade', () => {
    const r = escenario(base(), mio => mio.Lineas.push(linea(0, '', 1)), () => { });
    expect(r.pedido.Lineas.length).toBe(3);
    expect(r.cambiosAplicados).toBe(0);
  });

  it('un cambio en una línea sin conflicto se aplica', () => {
    const r = escenario(base(),
      mio => mio.Lineas[0].Cantidad = 8,
      otro => otro.formaPago = 'TRN');

    expect(r.conflictos.length).toBe(0);
    expect(r.pedido.Lineas[0].Cantidad).toBe(8);
    expect(r.pedido.formaPago).toBe('TRN');
  });

  it('la misma línea con campos distintos: se quedan los dos', () => {
    const r = escenario(base(),
      mio => mio.Lineas[0].Cantidad = 8,
      otro => otro.Lineas[0].PrecioUnitario = 12);

    expect(r.conflictos.length).toBe(0);
    expect(r.pedido.Lineas[0].Cantidad).toBe(8);
    expect(r.pedido.Lineas[0].PrecioUnitario).toBe(12);
  });

  it('el mismo campo de la misma línea: conflicto, con la pregunta de usted y los dos valores', () => {
    const r = escenario(base(),
      mio => mio.Lineas[0].Cantidad = 8,
      otro => otro.Lineas[0].Cantidad = 5.5);

    expect(r.conflictos.length).toBe(1);
    const conflicto = r.conflictos[0];
    expect(conflicto.tipo).toBe('CampoLinea');
    expect(conflicto.pregunta('Alfredo'))
      .toBe('Alfredo cambió la cantidad de la línea 101 (38093) a 5,5 y usted a 8: ¿con cuál se queda?');
    expect(conflicto.textoOpcionUsted).toBe('Con 8 (el mío)');
    expect(conflicto.textoOpcionOtro).toBe('Con 5,5');
    expect(r.pedido.Lineas[0].Cantidad).toBe(5.5); // mientras no se decida, lo guardado

    resolverConflicto(conflicto, true);
    expect(r.pedido.Lineas[0].Cantidad).toBe(8);
  });

  it('el mismo campo, con la respuesta del otro: se queda lo guardado', () => {
    const r = escenario(base(),
      mio => mio.Lineas[0].Cantidad = 8,
      otro => otro.Lineas[0].Cantidad = 6);

    resolverConflicto(r.conflictos[0], false);
    expect(r.pedido.Lineas[0].Cantidad).toBe(6);
  });

  it('si los dos pusieron lo mismo, no choca', () => {
    const r = escenario(base(),
      mio => mio.Lineas[0].Cantidad = 8,
      otro => otro.Lineas[0].Cantidad = 8);

    expect(r.conflictos.length).toBe(0);
    expect(r.pedido.Lineas[0].Cantidad).toBe(8);
  });

  it('cambiar el producto es una sola pregunta (el IVA y su descuento van con él)', () => {
    const r = escenario(base(),
      mio => Object.assign(mio.Lineas[0], { Producto: '11111', iva: 'R10', PorcentajeIva: 0.1, DescuentoProducto: 0.2 }),
      otro => Object.assign(otro.Lineas[0], { Producto: '22222', iva: 'SR4', PorcentajeIva: 0.04 }));

    expect(r.conflictos.length).toBe(1);
    expect(r.conflictos[0].etiqueta).toBe('el producto');
    resolverConflicto(r.conflictos[0], true);
    expect(r.pedido.Lineas[0]).toEqual(jasmine.objectContaining({ Producto: '11111', iva: 'R10', PorcentajeIva: 0.1, DescuentoProducto: 0.2 }));
  });

  it('línea borrada por el otro y cambiada por usted: pregunta si se vuelve a añadir', () => {
    const r = escenario(base(),
      mio => mio.Lineas[1].Cantidad = 4,
      otro => otro.Lineas.splice(1, 1));

    expect(r.conflictos.length).toBe(1);
    const conflicto = r.conflictos[0];
    expect(conflicto.tipo).toBe('LineaBorradaPorElOtro');
    expect(conflicto.pregunta(null))
      .toBe('Otra persona borró la línea 102 (45929) y usted la cambió: ¿la vuelve a añadir con sus cambios?');
    expect(conflicto.textoOpcionUsted).toBe('Volver a añadirla');
    expect(conflicto.textoOpcionOtro).toBe('Dejarla borrada');
    expect(r.pedido.Lineas.length).toBe(2);

    resolverConflicto(conflicto, true);
    expect(r.pedido.Lineas.length).toBe(3);
    expect(r.pedido.Lineas[2]).toEqual(jasmine.objectContaining({ id: 0, Producto: '45929', Cantidad: 4 }));
  });

  it('línea borrada por el otro sin tocarla usted: nada que preguntar', () => {
    const r = escenario(base(), () => { }, otro => otro.Lineas.splice(1, 1));
    expect(r.conflictos.length).toBe(0);
    expect(r.cambiosAplicados).toBe(0);
    expect(r.pedido.Lineas.length).toBe(2);
  });

  it('línea borrada por usted sin que el otro la toque: se borra', () => {
    const r = escenario(base(), mio => mio.Lineas.splice(1, 1), () => { });
    expect(r.conflictos.length).toBe(0);
    expect(r.cambiosAplicados).toBe(1);
    expect(r.pedido.Lineas.map((l: any) => l.id)).toEqual([101, 103]);
  });

  it('línea borrada por usted que el otro cambió: pregunta', () => {
    const r = escenario(base(),
      mio => mio.Lineas.splice(1, 1),
      otro => otro.Lineas[1].Cantidad = 9);

    expect(r.conflictos.length).toBe(1);
    const conflicto = r.conflictos[0];
    expect(conflicto.tipo).toBe('LineaBorradaPorUsted');
    expect(conflicto.pregunta('Aida')).toBe('Aida cambió la línea 102 (45929) y usted la borró: ¿la borra igualmente?');
    expect(conflicto.textoOpcionUsted).toBe('Borrarla');
    expect(conflicto.textoOpcionOtro).toBe('Dejarla');
    expect(r.pedido.Lineas.length).toBe(3);

    resolverConflicto(conflicto, true);
    expect(r.pedido.Lineas.map((l: any) => l.id)).toEqual([101, 103]);
  });

  it('cabecera, campos distintos: se quedan los dos', () => {
    const r = escenario(base(),
      mio => mio.comentarios = 'Llamar antes',
      otro => otro.formaPago = 'TRN');

    expect(r.conflictos.length).toBe(0);
    expect(r.pedido.comentarios).toBe('Llamar antes');
    expect(r.pedido.formaPago).toBe('TRN');
  });

  it('cabecera, mismo campo: conflicto', () => {
    const r = escenario(base(),
      mio => mio.formaPago = 'RCB',
      otro => otro.formaPago = 'TRN');

    expect(r.conflictos.length).toBe(1);
    const conflicto = r.conflictos[0];
    expect(conflicto.tipo).toBe('CampoCabecera');
    expect(conflicto.pregunta('Aida')).toBe('Aida cambió la forma de pago a TRN y usted a RCB: ¿con cuál se queda?');
    expect(r.pedido.formaPago).toBe('TRN');
    resolverConflicto(conflicto, true);
    expect(r.pedido.formaPago).toBe('RCB');
  });

  it('el relleno de la BD (espacios, null frente a vacío) no es un cambio', () => {
    const r = escenario(base(),
      mio => { mio.plazosPago = 'CONTADO   '; mio.comentarios = ''; },
      otro => { otro.plazosPago = '1/30'; otro.comentarios = 'Del otro'; });

    expect(r.conflictos.length).toBe(0);
    expect(r.cambiosAplicados).toBe(0);
    expect(r.pedido.plazosPago).toBe('1/30');
    expect(r.pedido.comentarios).toBe('Del otro');
  });

  it('cien líneas y el otro cambia la forma de pago: cero preguntas', () => {
    const lineas = Array.from({ length: 100 }, (_, i) => linea(1000 + i, `${30000 + i}`, 1));
    const r = escenario(pedido(lineas),
      mio => { mio.Lineas[10].Cantidad = 3; mio.Lineas.push(linea(0, '77777', 2)); },
      otro => otro.formaPago = 'TRN');

    expect(r.conflictos.length).toBe(0);
    expect(r.cambiosAplicados).toBe(2);
    expect(r.pedido.Lineas.length).toBe(101);
    expect(r.pedido.formaPago).toBe('TRN');
  });

  it('los valores se enseñan como en Nesto: porcentaje, sí/no, fecha y (vacío)', () => {
    const r = escenario(base(),
      mio => { mio.Lineas[0].DescuentoLinea = 0.15; mio.Lineas[0].fechaEntrega = '2026-12-01T00:00:00'; mio.servirJunto = false; mio.comentarios = 'Mío'; },
      otro => { otro.Lineas[0].DescuentoLinea = 0.1; otro.Lineas[0].fechaEntrega = '2026-11-30T00:00:00'; otro.servirJunto = null; otro.comentarios = 'Suyo'; });

    const porEtiqueta = (etiqueta: string) => r.conflictos.find(c => c.etiqueta === etiqueta)!;
    expect(porEtiqueta('el descuento').valorUsted).toBe('15 %');
    expect(porEtiqueta('el descuento').valorOtro).toBe('10 %');
    expect(porEtiqueta('la fecha de entrega').valorUsted).toBe('01/12/2026');
    expect(porEtiqueta('«servir junto»').valorUsted).toBe('no');
    expect(porEtiqueta('«servir junto»').valorOtro).toBe('(vacío)');
  });

  describe('con las líneas de la pantalla (LineaVenta)', () => {
    it('la foto lee el IVA de la línea aunque sea una propiedad calculada', () => {
      const p = pedido([new LineaVenta(linea(101, '38093', 5))]);
      expect(fotoDelPedido(p).Lineas[0]).toEqual(jasmine.objectContaining({ id: 101, Producto: '38093', iva: 'G21', Cantidad: 5 }));
    });

    it('la foto es una copia suelta: no cambia al tocar el pedido', () => {
      const p = pedido([new LineaVenta(linea(101, '38093', 5))]);
      const foto = fotoDelPedido(p);
      p.Lineas[0].Cantidad = 9;
      p.formaPago = 'TRN';
      expect(foto.Lineas[0].Cantidad).toBe(5);
      expect(foto.formaPago).toBe('EFC');
    });

    it('una línea nueva de la pantalla llega al pedido recargado como línea plana, con su IVA y sin la tabla de IVA', () => {
      const cargado = base();
      const mio: any = pedido(cargado.Lineas.map((l: any) => new LineaVenta(l)));
      const nueva = new LineaVenta(linea(0, '12345', 3));
      mio.Lineas.push(nueva);

      const r = fusionarCambiosPedido(fotoDelPedido(cargado), mio, copia(cargado));

      const anadida = r.pedido.Lineas[3];
      expect(anadida).not.toBe(nueva);
      expect(anadida.Producto).toBe('12345');
      expect(anadida.iva).toBe('G21');
      expect(anadida._iva).toBeUndefined();
      expect(anadida.parametrosIva).toBeUndefined();
      expect(new LineaVenta(anadida).iva).toBe('G21');
    });

    it('sin cambios del usuario no se aplica nada (lo de la pantalla es igual que la foto)', () => {
      const cargado = base();
      const mio: any = pedido(cargado.Lineas.map((l: any) => new LineaVenta(l)));
      const r = fusionarCambiosPedido(fotoDelPedido(mio), mio, copia(cargado));
      expect(r.cambiosAplicados).toBe(0);
      expect(r.conflictos.length).toBe(0);
    });
  });

  it('sin foto, sin pantalla o sin servidor no se fusiona', () => {
    expect(() => fusionarCambiosPedido(null, base(), base())).toThrow();
    expect(() => fusionarCambiosPedido(base(), null, base())).toThrow();
    expect(() => fusionarCambiosPedido(base(), base(), null)).toThrow();
  });
});
