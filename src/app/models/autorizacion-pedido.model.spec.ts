import {
  AutorizacionPedido, MENSAJE_MOTIVO_VACIO, MENSAJE_TEXTO_LARGO_AUTORIZACION, colorEstadoAutorizacion, esDelUsuario, esYaSolicitada, estaPendiente,
  falloTextoAutorizacion, lineasDesdeBorrador, mensajeErrorAutorizacion, resumenAutorizaciones, textoAutorizacionPedida, textoClienteAutorizacion,
  textoOfrecerAutorizacion, textoResolucion, textoSolicitante
} from './autorizacion-pedido.model';

describe('Autorizaciones de pedidos: modelo (#280, #290; Novedades 1258)', () => {
  const solicitud = (extra: Partial<AutorizacionPedido> = {}): AutorizacionPedido => ({
    Id: 12, Estado: 'Pendiente', Empresa: '1', Cliente: '15191 ', Contacto: '0', NombreCliente: 'Peluquería Prueba',
    Solicitante: 'NUEVAVISION\\Ana', NombreSolicitante: 'Ana López', FechaSolicitud: '2026-11-19T09:00:00', Importe: 123.45, NumeroLineas: 2,
    Motivos: ['La oferta 3+1 está caducada', ' '], Errores: [], ...extra
  });

  it('dice a quién se ha pedido', () => {
    expect(textoAutorizacionPedida(['Ana', 'Luis'])).toBe('Se ha pedido autorización a Ana y Luis. Le avisaremos cuando contesten.');
    expect(textoAutorizacionPedida(['Ana', ' Luis ', 'Eva'])).toBe('Se ha pedido autorización a Ana, Luis y Eva. Le avisaremos cuando contesten.');
    expect(textoAutorizacionPedida(['Ana'])).toBe('Se ha pedido autorización a Ana. Le avisaremos cuando contesten.');
    expect(textoAutorizacionPedida(null)).toBe('Se ha pedido autorización. Le avisaremos cuando contesten.');
  });

  it('el aviso de validación lleva la explicación de que puede pedir autorización', () => {
    const texto = textoOfrecerAutorizacion('La oferta está caducada. ');
    expect(texto.startsWith('La oferta está caducada.\n\nUsted no puede crearlo sin pasar la validación.')).toBeTrue();
    expect(textoOfrecerAutorizacion(null).startsWith('Usted no puede crearlo')).toBeTrue();
  });

  it('cliente, solicitante y si es suya', () => {
    expect(textoClienteAutorizacion(solicitud())).toBe('15191/0 · Peluquería Prueba');
    expect(textoClienteAutorizacion(solicitud({ NombreCliente: null, Contacto: null }))).toBe('15191');
    expect(textoSolicitante(solicitud())).toBe('Ana López');
    expect(textoSolicitante(solicitud({ NombreSolicitante: ' ' }))).toBe('Ana');
    expect(esDelUsuario(solicitud(), 'ana')).toBeTrue();
    expect(esDelUsuario(solicitud(), 'NUEVAVISION\\ANA')).toBeTrue();
    expect(esDelUsuario(solicitud(), 'Luis')).toBeFalse();
    expect(esDelUsuario(solicitud({ Solicitante: null }), '')).toBeFalse();
  });

  it('la resolución, como la dice Nesto', () => {
    expect(textoResolucion(solicitud())).toBe('');
    expect(estaPendiente(solicitud())).toBeTrue();
    expect(textoResolucion(solicitud({
      Estado: 'Denegada', UsuarioResolucion: 'NUEVAVISION\\Carlos', FechaResolucion: '2026-11-19T10:15:00', MotivoResolucion: 'no es cliente de la promoción.'
    }))).toBe('Denegada por Carlos el 19/11/2026 10:15: no es cliente de la promoción.');
    expect(textoResolucion(solicitud({ Estado: 'Autorizada', UsuarioResolucion: 'Carlos', FechaResolucion: '2026-11-19T10:15:00', PedidoCreado: 931500 })))
      .toBe('Autorizada por Carlos el 19/11/2026 10:15 (pedido 931500).');
    expect(textoResolucion(solicitud({ Estado: 'Anulada' }))).toBe('Anulada.');
  });

  it('colores y resumen', () => {
    expect(colorEstadoAutorizacion('Pendiente')).toBe('warning');
    expect(colorEstadoAutorizacion('Autorizada')).toBe('success');
    expect(colorEstadoAutorizacion('Denegada')).toBe('danger');
    expect(colorEstadoAutorizacion('Anulada')).toBe('medium');
    const lista = [solicitud(), solicitud({ Id: 13 }), solicitud({ Id: 14, Estado: 'Denegada' })];
    expect(resumenAutorizaciones(lista, false)).toBe('2 pendientes');
    expect(resumenAutorizaciones(lista, true)).toBe('2 pendientes y 1 resuelta');
    expect(resumenAutorizaciones([], false)).toBe('Ninguna pendiente');
    expect(resumenAutorizaciones([solicitud()], true)).toBe('1 pendiente y 0 resueltas');
  });

  it('las líneas del pedido, marcadas con los errores de su producto', () => {
    const pedido = { Lineas: [
      { Producto: '45929 ', texto: 'CREMA', Cantidad: 5, PrecioUnitario: 10, DescuentoLinea: 0.3 },
      { producto: '38093', texto: 'CERA', Cantidad: 1, PrecioUnitario: 4 },
      null
    ] };
    const lineas = lineasDesdeBorrador(pedido, [
      { Producto: '45929', Motivo: 'Descuento no autorizado' }, { Producto: ' 45929', Motivo: 'Oferta caducada' },
      { Producto: '45929', Motivo: 'Oferta caducada' }, { Producto: '', Motivo: 'general' }
    ]);
    expect(lineas.length).toBe(2);
    expect(lineas[0]).toEqual({ Producto: '45929', Descripcion: 'CREMA', Cantidad: 5, Precio: 10, Descuento: 0.3, MotivoError: 'Descuento no autorizado · Oferta caducada' });
    expect(lineas[1].MotivoError).toBeNull();
    expect(lineasDesdeBorrador(null, null)).toEqual([]);
  });

  it('el motivo de denegar es obligatorio y ningún texto pasa de 500', () => {
    expect(falloTextoAutorizacion('  ', true)).toBe(MENSAJE_MOTIVO_VACIO);
    expect(falloTextoAutorizacion('', false)).toBe('');
    expect(falloTextoAutorizacion('x'.repeat(501), false)).toBe(MENSAJE_TEXTO_LARGO_AUTORIZACION);
    expect(falloTextoAutorizacion('x'.repeat(500), true)).toBe('');
  });

  it('el 409 de «ya solicitada» se reconoce con el error del interceptor y con el de HttpClient', () => {
    const cuerpo = { Message: 'Ya pidió la autorización de este mismo pedido y sigue pendiente.', Codigo: 'YA_SOLICITADA', Id: 12 };
    expect(esYaSolicitada({ statusCode: 409, originalError: { status: 409, error: cuerpo } })).toBeTrue();
    expect(esYaSolicitada({ status: 409, error: cuerpo })).toBeTrue();
    expect(esYaSolicitada({ statusCode: 409, originalError: { error: { Message: 'Ya no está pendiente' } } })).toBeFalse();
    expect(esYaSolicitada({ statusCode: 400, originalError: { error: cuerpo } })).toBeFalse();
  });

  it('los errores: el mensaje de la API, o que aún no está disponible', () => {
    expect(mensajeErrorAutorizacion({ statusCode: 400, originalError: { error: { Message: 'Este pedido no necesita autorización: puede guardarlo.' } } }))
      .toBe('Este pedido no necesita autorización: puede guardarlo.');
    expect(mensajeErrorAutorizacion({ statusCode: 503, originalError: { error: { Message: 'falta la tabla' } } }))
      .toBe('Las autorizaciones de pedidos todavía no están disponibles en el servidor.');
    expect(mensajeErrorAutorizacion({ statusCode: 404, originalError: { error: { Message: 'No HTTP resource was found' } } }))
      .toBe('Las autorizaciones de pedidos todavía no están disponibles en el servidor.');
    expect(mensajeErrorAutorizacion({ statusCode: 404, originalError: { error: { Message: 'No existe esa solicitud de autorización.' } } }))
      .toBe('No existe esa solicitud de autorización.');
    expect(mensajeErrorAutorizacion({ statusCode: 400, apiError: { error: { message: 'Descuento no autorizado' } }, originalError: { error: {} } }))
      .toBe('Descuento no autorizado');
    expect(mensajeErrorAutorizacion({ statusCode: 0 })).toContain('No hay conexión');
    expect(mensajeErrorAutorizacion({})).toContain('No se ha podido completar');
  });
});
