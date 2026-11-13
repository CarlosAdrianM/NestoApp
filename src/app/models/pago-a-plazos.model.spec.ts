import { EstadoPagoAPlazos, puedeCancelarPagoAPlazos, textoEstadoPagoAPlazos, textoMensajeParaCliente, textoNoDisponible } from './pago-a-plazos.model';

describe('Pago a plazos de un pedido (#281, NestoAPI#864)', () => {
  const estado = (extra: Partial<EstadoPagoAPlazos> = {}): EstadoPagoAPlazos => ({
    HaySolicitud: true, IdSolicitud: 3, Estado: 'Pendiente', Proveedor: 'Aplazame', NombreProveedor: 'Aplázame', Canal: 'Enlace',
    Importe: 1234.5, ImporteCapturado: null, FechaSolicitud: '2026-11-13T10:00:00', FechaAprobacion: null, FechaLimiteCaptura: null,
    DiasParaCapturar: null, FechaCaptura: null, FechaCierre: null, Motivo: null, Usuario: null, UrlPago: 'https://pago', Pruebas: false, ...extra
  });

  describe('textoEstadoPagoAPlazos', () => {
    it('pendiente: el cliente tiene que terminarlo', () => {
      expect(textoEstadoPagoAPlazos(estado())).toBe('Aplázame: pendiente de que el cliente termine la solicitud (1.234,50 €).');
    });
    it('aprobado: con la fecha límite para cobrarlo', () => {
      expect(textoEstadoPagoAPlazos(estado({ Estado: 'Aprobado', FechaLimiteCaptura: '2026-11-27T00:00:00' })))
        .toBe('Aplázame: aprobado (1.234,50 €). Hay que servirlo antes del 27/11/2026 para cobrarlo.');
    });
    it('rechazado, con el motivo', () => {
      expect(textoEstadoPagoAPlazos(estado({ Estado: 'Rechazado', Motivo: 'La financiera no lo ha aprobado.' })))
        .toBe('Aplázame: rechazado (1.234,50 €). La financiera no lo ha aprobado.');
    });
    it('sin solicitud, nada', () => {
      expect(textoEstadoPagoAPlazos(estado({ HaySolicitud: false, Estado: 'SinSolicitud' }))).toBe('');
      expect(textoEstadoPagoAPlazos(null)).toBe('');
    });
  });

  it('solo se cancela la pendiente o la aprobada', () => {
    expect(puedeCancelarPagoAPlazos(estado())).toBeTrue();
    expect(puedeCancelarPagoAPlazos(estado({ Estado: 'Aprobado' }))).toBeTrue();
    expect(puedeCancelarPagoAPlazos(estado({ Estado: 'Capturado' }))).toBeFalse();
    expect(puedeCancelarPagoAPlazos(estado({ Estado: 'Rechazado' }))).toBeFalse();
  });

  it('el mensaje para el cliente: el que trae la API, o el enlace', () => {
    expect(textoMensajeParaCliente({ MensajeCliente: 'Hola, aquí tiene…', UrlPago: 'https://pago' })).toBe('Hola, aquí tiene…');
    expect(textoMensajeParaCliente({ MensajeCliente: null, UrlPago: 'https://pago' })).toBe('https://pago');
    expect(textoMensajeParaCliente({})).toBe('');
  });

  it('no disponible: el motivo de la API', () => {
    expect(textoNoDisponible({ Disponible: false, Motivo: 'El importe es menor que el mínimo (60 €).', NombreProveedor: 'Aplázame' } as any))
      .toBe('Aplázame no disponible: El importe es menor que el mínimo (60 €).');
    expect(textoNoDisponible({ Disponible: true } as any)).toBe('');
  });
});
