-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.24.0 (14/10/2026): minor (pestaña «Cheques regalo» en «Llamar» y ventana «Eventos» en el extracto).
-- #222 cheque regalo en el pedido, #226 cheques regalo por vendedor, #215 fecha de entrega a la agencia,
-- #223 fotos de los bultos, #220 sustituciones de Compras, #216 corrección del concepto del enlace,
-- #218/#221 novedades con adjuntos y por perfil, #219 «Llamar» del equipo, #230 modo de entrega,
-- #225 comisiones (sugerencia 566 de Marta: va como UPDATE de su fila, no como novedad nueva).
-- #228 (fallo al quitar un filtro) no va: es un arreglo interno.
-- #217 (eventos) va aparte, al final: solo cuando esté publicada NestoAPI#611 (corte 1).
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.24.0', '2026-10-14', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'El cheque regalo del cliente, en el pedido',
     N'Si el cliente tiene un cheque regalo de la campaña, al llegar al total del pedido lo ves con lo que dice el cheque. Marca «Usar el cheque regalo» y se descuenta del pedido. Te decimos más o menos cuánto le falta para llegar al mínimo (no cuentan peluquería, «PACK 26» ni portes); al guardar se comprueba.'),
    (N'Nuevo', N'Cheques regalo de tus clientes, en «Llamar»',
     N'En Rapports, dentro de «Llamar», mientras dure la campaña tienes la pestaña «Cheques regalo»: cuántos cheques se han generado, usado y quedan pendientes, y la lista de clientes que aún no lo han usado, con los días que les quedan, la factura que lo generó y cuándo hablasteis por última vez. Desde cada uno puedes ver la factura, llamar o escribir por WhatsApp. En la lista de clientes para contactar, los que tienen cheque llevan la etiqueta «Cheque».'),
    (N'Nuevo', N'Qué día entregamos el pedido a la agencia',
     N'En la plantilla, junto al modo de entrega, ves qué día se entrega el pedido a la agencia y por qué; cambia al instante si cambias el modo de entrega o de facturación. En el detalle del pedido sale la fecha de ahora y, si ha cambiado, la que se prometió al crearlo.'),
    (N'Nuevo', N'Fotos de los bultos del pedido',
     N'En el detalle del pedido ves los bultos con la foto que hizo almacén al prepararlos. Tócala para verla en grande, compártela con el cliente (WhatsApp o enlace) si hay una reclamación, o ábrela en el navegador para guardarla.'),
    (N'Mejorado', N'Aviso cuando Compras pide otra referencia',
     N'Al pasar al resumen del pedido, si Compras pide servir otra referencia en lugar de una que has metido (por ejemplo, mientras no haya stock), te lo decimos y te ofrecemos cambiarla. Si dices que no, no te lo volvemos a preguntar en ese pedido.'),
    (N'Mejorado', N'«¿Quisiste decir…?» en los enlaces de pago',
     N'Antes de mandar un enlace de pago desde el extracto, si el concepto tiene alguna falta te proponemos cómo corregirlo. Puedes usar la corrección o dejar el tuyo.'),
    (N'Mejorado', N'Novedades con documentos y para ti',
     N'Algunas novedades traen documentos (por ejemplo, unas normas en PDF): tócalos para abrirlos. Además, cada uno ve las novedades que le afectan; si quieres verlas todas, activa «Ver todas las novedades».'),
    (N'Mejorado', N'Los jefes de ventas ven a quién llama su equipo',
     N'En «Llamar», quien lleva un equipo puede elegir arriba el vendedor y ver su lista de clientes para contactar, tal y como la ve él.'),
    (N'Corregido', N'El modo de entrega que eliges es el que se queda',
     N'En la plantilla, el modo de entrega que eliges (aunque sea el que ya salía) se respeta al tocar líneas o volver atrás. Si por algún motivo tiene que cambiar, te avisamos.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.24.0' AND x.Titulo = n.Titulo
);

-- #225: sugerencia 566 de Marta. Se marca implementada en esta versión (no se inserta otra).
UPDATE dbo.Novedades SET
    Titulo = N'Comisiones: «Servido, pendiente de facturar» en vez de la fecha vacía',
    Descripcion = N'En el detalle de comisiones, los pedidos que ya se han servido pero aún no tienen factura (por ejemplo, de clientes que facturan a fin de mes) dicen «Servido el …, pendiente de facturar» en lugar de dejar la fecha en blanco.',
    Estado = 'Implementada', [Version] = '2.24.0',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 566 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 9 filas nuevas + la 566.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.24.0' ORDER BY Id;

-- ===== #217: SOLO cuando esté publicada NestoAPI#611 (corte 1 de eventos). Hasta entonces, la
-- ===== ventana dice que las inscripciones aún no están disponibles. Descomentar y ejecutar entonces.
-- INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
-- SELECT '2.24.0', '2026-10-14', N'Nuevo', N'Inscribir clientes en cursos y eventos',
--     N'En el extracto del cliente, arriba a la derecha, el calendario abre los próximos eventos con plazas libres. Elige uno, la forma de pago y, con tarjeta, se genera el enlace de pago para mandárselo (también por WhatsApp). La plaza queda reservada 7 días mientras no se pague. Ahí mismo ves sus inscripciones.',
--     'NestoApp', SUSER_SNAME()
-- WHERE NOT EXISTS (SELECT 1 FROM dbo.Novedades x WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.24.0'
--                   AND x.Titulo = N'Inscribir clientes en cursos y eventos');
