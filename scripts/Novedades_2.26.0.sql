-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.26.0 (27/10/2026): minor (retener pedidos, cursos en la plantilla y ficha de evento).
-- #254 retener pedidos (NestoAPI#698), #244 cursos en la plantilla (NestoAPI#691), #247 ficha del evento
-- (NestoAPI#692), #253 resultado del rapport y próximo contacto (NestoAPI#716), #246 «Puede ofrecer» en el
-- rapport, #251 vídeo en las novedades (NestoAPI#711), #252 aviso de fecha de entrega lejana (NestoAPI#712),
-- #242 «Servir lo pendiente en cuanto haya stock» (NestoAPI#688), #241 forma de pago y facturación
-- (NestoAPI#686), #243 cheque regalo y Ganavisiones (NestoAPI#593), #245 «Recomendado» bajo Entrega,
-- #249 aviso en contacto en estado 7 (sugerencia 736 de Nesto).
-- #240 (incidencia 715 de Marta: va como UPDATE de su fila, no como novedad nueva).
-- #159 (geocoder) y #250 (origen del modo) no se notan: no van.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.26.0', '2026-10-27', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Retener un pedido hasta nuevo aviso',
     N'Si un pedido no tiene que salir todavía, ya no hace falta ponerle la fecha de entrega al año que viene. En el pedido, el botón «Retener…» pide el motivo y, si quieres, hasta qué día; el pedido pasa a «Retenido» y no sale en el picking. Con «Liberar» vuelve a su modo de entrega de antes y entra en el picking. Si pusiste fecha, se libera solo ese día y te avisamos; si no, te lo recordamos una vez a la semana. En la lista de pedidos los retenidos llevan la etiqueta «Retenido».'),
    (N'Nuevo', N'Vender cursos desde la plantilla',
     N'Al buscar en todos los productos salen los cursos con eventos próximos (etiqueta «Curso»). Al tocar uno eliges el evento (si hay varios) y la modalidad («Con cupón de productos» o «Sin cupón»), y la línea entra con el importe de la modalidad, sin descuentos. Al guardar, el curso va en un pedido aparte con prepago (te decimos los dos números) y no cuenta para portes, Ganavisiones ni ofertas del pedido de productos.'),
    (N'Nuevo', N'Aviso de los eventos nuevos',
     N'Cuando se anuncia un evento te llega un aviso al móvil. Al tocarlo se abre la ficha del evento: fecha, hora, tienda u online, ponente, plazas libres y modalidades con su importe, para que puedas ofrecérselo al cliente.'),
    (N'Nuevo', N'Resultado del rapport y próximo contacto',
     N'En el rapport puedes marcar el resultado de la llamada o visita (Pedido, Pedirá más tarde, No necesita, Precio, Competencia…) y cuándo toca volver a contactar. Se ven después en la lista de rapports. Y si quitas un cliente de tu listado, puedes decir por qué (ha cerrado, traspaso, compra a la competencia…).'),
    (N'Nuevo', N'«Puede ofrecer» también en el rapport',
     N'Al crear un rapport, debajo del formulario salen hasta tres productos que a ese cliente le pueden encajar, con la frase que le puedes decir. «✗ No le interesa» si se lo has ofrecido y no lo quiere; «🚫 Quitar» si ni se lo vas a ofrecer.'),
    (N'Nuevo', N'Vídeos en las novedades',
     N'Algunas novedades llevan un vídeo corto (sin sonido) que enseña cómo funciona lo nuevo. Pulsa «▶ Ver vídeo»; no se descarga nada hasta que lo pides.'),
    (N'Mejorado', N'Aviso si la fecha de entrega está muy lejos',
     N'Si al guardar un pedido alguna línea tiene fecha de entrega a más de 60 días (es fácil equivocarse de año en el selector del móvil), te preguntamos si es correcta antes de grabarlo. Si lo que quieres es que no salga todavía, usa «Retener pedido».'),
    (N'Mejorado', N'Facturación y «Servir lo pendiente en cuanto haya stock»',
     N'Con «Todo junto» el selector de facturación ya no sale (el pedido sale entero de una vez). Con la facturación «Todo ahora, lo pendiente se entrega después» aparece la casilla «Servir lo pendiente en cuanto haya stock», marcada por defecto. Y si cambias la forma de pago o la cuenta del recibo, se vuelve a comprobar qué facturación vale: un pedido al contado no puede ir «Al completar el pedido».'),
    (N'Corregido', N'El cheque regalo descuenta Ganavisiones',
     N'Al marcar el cheque regalo, los Ganavisiones del pedido se calculan ya sin el importe del cheque (antes la plantilla enseñaba más de los que luego admitía el servidor y rechazaba el pedido). Si habías elegido regalos que ya no caben, te avisamos y se quitan.'),
    (N'Mejorado', N'Bajo «Entrega» se ve claro qué es la recomendación',
     N'La frase gris bajo el modo de entrega es la recomendación del sistema, no lo que has elegido. Si eliges otro modo, ahora dice «Recomendado: «…»» para que no se confunda con tu elección.'),
    (N'Mejorado', N'Aviso al registrar un rapport en un contacto en estado 7',
     N'Muchos rapports acababan por error en un contacto equivocado del cliente, y el bueno seguía saliendo como no contactado. Si registras un rapport en un contacto en estado 7 que has elegido a mano, te preguntamos antes si es ahí.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.26.0' AND x.Titulo = n.Titulo
);

-- #240: incidencia 715 de Marta («¿qué es esa fecha de 31/12/99?»). Se marca corregida en esta versión (no se inserta otra).
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'Pedidos sin fecha de entrega: «Sin fecha» en vez de 31/12/99',
    Descripcion = N'Cuando se sirve parte de un pedido, lo que queda pendiente se guarda en una nota de entrega sin fecha (para que no entre en el picking hasta que alguien ponga la de verdad); por dentro lleva el 31/12/2099 y se veía como «31/12/99». Ahora en la lista de pedidos y en el pedido sale «Sin fecha» con un aviso para que pongas la fecha de entrega cuando se sepa, y las demás fechas llevan el año con cuatro cifras.',
    Estado = 'Implementada', [Version] = '2.26.0',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 715 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 11 filas nuevas + la 715.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.26.0' ORDER BY Id;
