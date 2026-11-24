import {
  MOTIVO_DIRECCION_A_MANO, MOTIVO_FORMATO_NUMERO, MOTIVO_LOCAL, MOTIVO_NAVE, MOTIVO_OTRO, MOTIVO_PISO, MOTIVO_SIN_CODIGO_POSTAL,
  MOTIVO_SIN_DIRECCION, MOTIVO_SIN_NUMERO, MOTIVO_SIN_TIPO, PREFIJO_ENTREGA, aplicarDetalleGoogle, calleCambiada, clienteParaCrear,
  clienteParaModificar, codigoPostalEditable, componerDireccion2, hayQueRevisarDireccion2, mensajeClienteCreado,
  motivoNoSePuedeModificar, motivoNoSePuedeSeguir, normalizarNumeroPortal, nuevaRevisionDireccion2, numeroPortalValido, olvidarGoogle,
  paraDireccionEntrega, puedeQuitarDireccion2, queEsTocado, quitarDireccion2, textoRevisarDireccion2
} from './direccion-alta.model';

// NestoApp#286 / #288 / #290 (NestoAPI#874 y #879): las reglas son gemelas de Direccion2Cliente y NumeroPropioDireccion.
describe('direccion-alta.model', () => {
  describe('componerDireccion2 («¿Qué es?»)', () => {
    it('sin tipo no vale', () => {
      expect(componerDireccion2({}).motivo).toBe(MOTIVO_SIN_TIPO);
      expect(componerDireccion2(null).valida).toBeFalse();
    });

    it('un piso lleva piso y puerta; el piso numérico gana el «º»', () => {
      expect(componerDireccion2({ tipoLugar: 'Piso', piso: '1', puerta: 'd' }).direccion2).toBe('1º D');
      expect(componerDireccion2({ tipoLugar: 'Piso', piso: '3º', puerta: 'izq' }).direccion2).toBe('3º IZQ');
      expect(componerDireccion2({ tipoLugar: 'Piso', piso: 'bajo', puerta: 'A' }).direccion2).toBe('BAJO A');
      expect(componerDireccion2({ tipoLugar: 'Piso', piso: '1' }).motivo).toBe(MOTIVO_PISO);
    });

    it('un local exige el rótulo; el número es opcional', () => {
      expect(componerDireccion2({ tipoLugar: 'Local', numeroLocal: '6', rotulo: 'El Edén' }).direccion2).toBe('LOCAL 6 · RÓTULO: EL EDÉN');
      expect(componerDireccion2({ tipoLugar: 'Local', rotulo: 'el edén' }).direccion2).toBe('LOCAL · RÓTULO: EL EDÉN');
      expect(componerDireccion2({ tipoLugar: 'Local', numeroLocal: '6', rotulo: '  ' }).motivo).toBe(MOTIVO_LOCAL);
    });

    it('casa, nave y otro', () => {
      expect(componerDireccion2({ tipoLugar: 'Casa' }).direccion2).toBe('CASA');
      expect(componerDireccion2({ tipoLugar: 'Nave', numeroNave: '4' }).direccion2).toBe('NAVE 4');
      expect(componerDireccion2({ tipoLugar: 'Nave' }).motivo).toBe(MOTIVO_NAVE);
      expect(componerDireccion2({ tipoLugar: 'Otro', otroTexto: 'centro  comercial, planta 2' }).direccion2).toBe('CENTRO COMERCIAL, PLANTA 2');
      expect(componerDireccion2({ tipoLugar: 'Otro' }).motivo).toBe(MOTIVO_OTRO);
    });

    it('no admite más de 100 caracteres', () => {
      const r = componerDireccion2({ tipoLugar: 'Otro', otroTexto: 'x'.repeat(101) });
      expect(r.valida).toBeFalse();
      expect(r.motivo).toContain('100 caracteres');
    });
  });

  describe('número del portal', () => {
    it('normaliza', () => {
      expect(normalizarNumeroPortal(' 13 b ')).toBe('13B');
      expect(normalizarNumeroPortal('13 bis')).toBe('13BIS');
      expect(normalizarNumeroPortal('s/n')).toBe('S/N');
      expect(normalizarNumeroPortal('sin número')).toBe('S/N');
      expect(normalizarNumeroPortal('  ')).toBeNull();
    });

    it('solo vale el portal o S/N', () => {
      expect(numeroPortalValido('99')).toBeTrue();
      expect(numeroPortalValido('13 B')).toBeTrue();
      expect(numeroPortalValido('13 bis')).toBeTrue();
      expect(numeroPortalValido('SN')).toBeTrue();
      expect(numeroPortalValido('Nº 99')).toBeFalse();
      expect(numeroPortalValido('99 local 6')).toBeFalse();
      expect(numeroPortalValido('Edificio Rojo')).toBeFalse();
      expect(numeroPortalValido('')).toBeFalse();
    });
  });

  describe('aplicarDetalleGoogle', () => {
    it('con código postal y número: verificada y nada que teclear', () => {
      const b: any = {};
      expect(aplicarDetalleGoogle(b, { calle: 'CALLE MAYOR', numero: '5', codigoPostal: '28013', poblacion: 'madrid', provincia: 'madrid', paisIso: 'es' })).toBeTrue();
      expect(b.direccionCalleNumero).toBe('CALLE MAYOR, 5');
      expect(b.codigoPostal).toBe('28013');
      expect(b.poblacion).toBe('MADRID');
      expect(b.pais).toBe('ES');
      expect(b.codigoPostalSinDarPorGoogle).toBeFalse();
      expect(b.numeroSinDarPorGoogle).toBeFalse();
    });

    it('sin número: se pide aparte', () => {
      const b: any = { numero: '7', numeroConfirmadoSinGoogle: true };
      aplicarDetalleGoogle(b, { calle: 'Calle Sor Livia Alcorta', codigoPostal: '28100', poblacion: 'Alcobendas' });
      expect(b.numeroSinDarPorGoogle).toBeTrue();
      expect(b.numero).toBeNull();
      expect(b.numeroConfirmadoSinGoogle).toBeFalse();
    });

    it('sin código postal pero con calle y población: verificada y el CP se teclea', () => {
      const b: any = { codigoPostal: '28001' };
      expect(aplicarDetalleGoogle(b, { calle: 'Calle Nueva', numero: '3', poblacion: 'Algete' })).toBeTrue();
      expect(b.codigoPostal).toBe('');
      expect(b.codigoPostalSinDarPorGoogle).toBeTrue();
    });

    it('sin código postal ni población no queda verificada', () => {
      const b: any = {};
      expect(aplicarDetalleGoogle(b, { calle: 'Calle Nueva' })).toBeFalse();
      expect(b.numeroSinDarPorGoogle).toBeFalse();
    });

    it('olvidarGoogle lo deja todo como antes de buscar', () => {
      const b: any = { direccionCalleNumero: 'X', direccionVerificada: true, codigoPostalSinDarPorGoogle: true, numeroSinDarPorGoogle: true, numero: '3', numeroConfirmadoSinGoogle: true };
      olvidarGoogle(b);
      expect(b).toEqual({ direccionCalleNumero: '', direccionVerificada: false, codigoPostalSinDarPorGoogle: false, numeroSinDarPorGoogle: false, numero: null, numeroConfirmadoSinGoogle: false });
    });
  });

  describe('código postal (#288)', () => {
    it('al crear no se teclea, salvo que Google elija la dirección sin dar el CP', () => {
      expect(codigoPostalEditable({}, true)).toBeFalse();
      expect(codigoPostalEditable({ direccionVerificada: true }, true)).toBeFalse();
      expect(codigoPostalEditable({ direccionVerificada: true, codigoPostalSinDarPorGoogle: true }, true)).toBeTrue();
    });

    it('al modificar sigue como estaba', () => {
      expect(codigoPostalEditable({}, false)).toBeTrue();
      expect(codigoPostalEditable({ direccionVerificada: true }, false)).toBeFalse();
      expect(codigoPostalEditable({ direccionVerificada: true, codigoPostalSinDarPorGoogle: true }, false)).toBeTrue();
    });
  });

  describe('motivoNoSePuedeSeguir (alta)', () => {
    const buena = { direccionCalleNumero: 'CALLE MAYOR, 5', direccionVerificada: true, codigoPostal: '28013', tipoLugar: 'Casa' };

    it('una dirección completa sigue', () => {
      expect(motivoNoSePuedeSeguir(buena)).toBeNull();
    });

    it('sin dirección solo se queja si es obligatoria (la de entrega)', () => {
      expect(motivoNoSePuedeSeguir({})).toBeNull();
      expect(motivoNoSePuedeSeguir({}, true, PREFIJO_ENTREGA)).toBe(PREFIJO_ENTREGA + MOTIVO_SIN_DIRECCION);
    });

    it('en orden: a mano, sin CP, sin número, número mal y «¿Qué es?»', () => {
      expect(motivoNoSePuedeSeguir({ ...buena, direccionVerificada: false })).toBe(MOTIVO_DIRECCION_A_MANO);
      expect(motivoNoSePuedeSeguir({ ...buena, codigoPostal: '', codigoPostalSinDarPorGoogle: true })).toBe(MOTIVO_SIN_CODIGO_POSTAL);
      expect(motivoNoSePuedeSeguir({ ...buena, numeroSinDarPorGoogle: true })).toBe(MOTIVO_SIN_NUMERO);
      expect(motivoNoSePuedeSeguir({ ...buena, numeroSinDarPorGoogle: true, numero: '99 local 6' })).toBe(MOTIVO_FORMATO_NUMERO);
      expect(motivoNoSePuedeSeguir({ ...buena, tipoLugar: null })).toBe(MOTIVO_SIN_TIPO);
      expect(motivoNoSePuedeSeguir({ ...buena, tipoLugar: 'Local' }, true, PREFIJO_ENTREGA)).toBe(PREFIJO_ENTREGA + MOTIVO_LOCAL);
    });

    it('una dirección ya validada solo mira «¿Qué es?»', () => {
      expect(motivoNoSePuedeSeguir({ direccion: 'C/ MAYOR, 5', direccionCalleNumero: '', tipoLugar: 'Casa' })).toBeNull();
      expect(motivoNoSePuedeSeguir({ direccion: 'C/ MAYOR, 5', direccionCalleNumero: '' })).toBe(MOTIVO_SIN_TIPO);
    });
  });

  describe('lo que viaja en el alta', () => {
    it('solo los campos del tipo elegido, y el número solo si Google no lo dio', () => {
      const dto = clienteParaCrear({ nombre: 'X', tipoLugar: 'Local', rotulo: 'EL EDÉN', piso: '1', puerta: 'D', numero: '9' }, null);
      expect(dto.tipoLugar).toBe('Local');
      expect(dto.rotulo).toBe('EL EDÉN');
      expect(dto.piso).toBeNull();
      expect(dto.numero).toBeNull();
      expect(dto.numeroConfirmadoSinGoogle).toBeFalse();
      expect(dto.direccionEntrega).toBeUndefined();
    });

    it('el número confirmado sin Google viaja con su marca', () => {
      const dto = clienteParaCrear({ tipoLugar: 'Casa', numeroSinDarPorGoogle: true, numero: ' 99 ', numeroConfirmadoSinGoogle: true }, null);
      expect(dto.numero).toBe('99');
      expect(dto.numeroConfirmadoSinGoogle).toBeTrue();
    });

    it('con «La entrega es en otra dirección» va DireccionEntrega con sus campos', () => {
      const entrega = { direccion: 'C/ LA GRANJA, 99', direccionVerificada: true, codigoPostal: '28108', poblacion: 'ALCOBENDAS', provincia: 'MADRID',
        ruta: 'AT', telefono: '916281914', comentariosRuta: 'TARDES', comentariosPicking: 'FRÁGIL', tipoLugar: 'Nave', numeroNave: '4',
        direccionCalleNumero: 'Calle la Granja, 99', direccionValidada: true };
      const dto = clienteParaCrear({ nombre: 'X', tipoLugar: 'Casa' }, entrega);
      expect(dto.direccionEntrega).toEqual({
        direccion: 'C/ LA GRANJA, 99', direccionVerificada: true, numero: null, numeroConfirmadoSinGoogle: false,
        tipoLugar: 'Nave', piso: null, puerta: null, numeroLocal: null, rotulo: null, numeroNave: '4', otroTexto: null,
        codigoPostal: '28108', poblacion: 'ALCOBENDAS', provincia: 'MADRID', ruta: 'AT', telefono: '916281914',
        comentariosRuta: 'TARDES', comentariosPicking: 'FRÁGIL'
      });
      expect(paraDireccionEntrega(entrega).direccionCalleNumero).toBeUndefined();
    });

    it('no toca el objeto de la pantalla', () => {
      const cliente: any = { tipoLugar: 'Casa', piso: '1' };
      clienteParaCrear(cliente, null);
      expect(cliente.piso).toBe('1');
    });
  });

  describe('al modificar (#290)', () => {
    const ficha = () => ({ direccion: 'C/ MAYOR, 5', direccion2: '1º D', tipoLugar: 'Piso', piso: '1º', puerta: 'D', nombre: 'X' } as any);

    it('sin tocar nada no viaja ningún campo de «¿Qué es?» (la API conserva lo guardado)', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      const dto = clienteParaModificar(c, r);
      expect('tipoLugar' in dto).toBeFalse();
      expect('piso' in dto).toBeFalse();
      expect('quitarDireccion2' in dto).toBeFalse();
      expect('direccion2' in dto).toBeFalse();
      expect(dto.nombre).toBe('X');
      expect(motivoNoSePuedeModificar(c, r)).toBeNull();
    });

    it('al tocarlo viajan el tipo y sus campos', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      c.tipoLugar = 'Local'; c.rotulo = 'EL EDÉN';
      queEsTocado(c, r);
      const dto = clienteParaModificar(c, r);
      expect(dto.tipoLugar).toBe('Local');
      expect(dto.rotulo).toBe('EL EDÉN');
      expect(dto.piso).toBeNull();
    });

    it('lo tocado y mal puesto no se guarda', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      c.tipoLugar = 'Local'; c.rotulo = '';
      queEsTocado(c, r);
      expect(motivoNoSePuedeModificar(c, r)).toBe(MOTIVO_LOCAL);
    });

    it('si cambia la calle y tenía Dirección 2, hay que revisarla', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      expect(hayQueRevisarDireccion2(c, r)).toBeFalse();
      c.direccion = 'C/ LA GRANJA, 99';
      expect(calleCambiada(c, r)).toBeTrue();
      expect(hayQueRevisarDireccion2(c, r)).toBeTrue();
      expect(motivoNoSePuedeModificar(c, r)).toBe(textoRevisarDireccion2('1º D'));
    });

    it('«Sigue siendo así» la da por revisada y viaja con la dirección nueva', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      c.direccion = 'C/ LA GRANJA, 99';
      r.revisada = true;
      expect(hayQueRevisarDireccion2(c, r)).toBeFalse();
      expect(clienteParaModificar(c, r).tipoLugar).toBe('Piso');
    });

    it('«Quitar» vacía los campos y manda QuitarDireccion2', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      c.direccion = 'C/ LA GRANJA, 99';
      expect(puedeQuitarDireccion2(c, r)).toBeTrue();
      quitarDireccion2(c, r);
      expect(c.tipoLugar).toBeNull();
      expect(hayQueRevisarDireccion2(c, r)).toBeFalse();
      expect(puedeQuitarDireccion2(c, r)).toBeFalse();
      const dto = clienteParaModificar(c, r);
      expect(dto.quitarDireccion2).toBeTrue();
      expect('tipoLugar' in dto).toBeFalse();
    });

    it('elegir un tipo después de «Quitar» lo deja sin efecto', () => {
      const c = ficha(), r = nuevaRevisionDireccion2(c);
      quitarDireccion2(c, r);
      c.tipoLugar = 'Casa';
      queEsTocado(c, r);
      const dto = clienteParaModificar(c, r);
      expect(dto.quitarDireccion2).toBeUndefined();
      expect(dto.tipoLugar).toBe('Casa');
    });

    it('un cliente sin Dirección 2 al que se le cambia la calle no pide revisar nada', () => {
      const c: any = { direccion: 'C/ MAYOR, 5' }, r = nuevaRevisionDireccion2(c);
      c.direccion = 'C/ LA GRANJA, 99';
      expect(hayQueRevisarDireccion2(c, r)).toBeFalse();
      expect(puedeQuitarDireccion2(c, r)).toBeFalse();
      expect(motivoNoSePuedeModificar(c, r)).toBeNull();
    });

    it('sin revisión (un alta) no hay nada que revisar', () => {
      expect(hayQueRevisarDireccion2({ direccion: 'X' }, null)).toBeFalse();
      expect(motivoNoSePuedeModificar({ direccion: 'X' }, null)).toBeNull();
    });
  });

  describe('mensajeClienteCreado', () => {
    it('sin dirección de entrega, el de siempre', () => {
      expect(mensajeClienteCreado({ 'Nº_Cliente': '12345 ', Contacto: '0 ' })).toBe('Se ha creado correctamente el cliente: 12345/0');
    });

    it('con dirección de entrega dice el contacto creado y que queda por defecto', () => {
      const texto = mensajeClienteCreado({ 'Nº_Cliente': '12345', Contacto: '0', ContactoEntrega: '1 ' });
      expect(texto).toContain('12345/0 (dirección fiscal)');
      expect(texto).toContain('el contacto 12345/1');
      expect(texto).toContain('entrega por defecto');
    });
  });
});
