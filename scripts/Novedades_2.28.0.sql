-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.28.0 (11/11/2026): minor (pantalla nueva: Pedidos en riesgo). Se publica a la vez que NestoAPI.
-- #248 pedidos con la fecha en riesgo (NestoAPI#693, Nesto#546), #273 contestar el envío devuelto desde el pedido
-- (NestoAPI#699), #177 fase 2 aviso de novedades al entrar (NestoAPI#495), #274 los avisos de leads abren el cliente
-- (NestoAPI#623), #205 «Recoge en tienda» (NestoAPI#571), #275 aviso de pago al contado con productos de campaña (feria online), #272 facturas por WhatsApp y
-- por correo a nombre del vendedor y con el motivo real si fallan (sugerencia 1167 de Nesto, NestoAPI#854).
-- #272 nace de la incidencia 1102 (Carlos): va como UPDATE de su fila, no como novedad nueva.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.28.0', '2026-11-11', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Pedidos en riesgo: los que ya no llegan cuando se le dijo al cliente',
     N'En el menú hay una entrada nueva, «Pedidos en riesgo»: tus pedidos (y los de tu equipo) cuya fecha de entrega prometida ya no se cumple, porque se retrasan o se han quedado sin fecha, con el motivo y la fecha nueva. Al tocar uno se abre el pedido, para cambiar cómo se sirve o avisar al cliente. Puedes ver también los que se han resuelto en el último mes y elegir qué avisos quieres recibir.'),
    (N'Nuevo', N'Envío devuelto: contéstalo desde el propio pedido',
     N'Cuando la agencia devuelve un envío o lo deja en incidencia, en el pedido sale junto al envío el botón «Contestar» para decir si se vuelve a enviar (con la dirección corregida si hace falta) o se abona. Y en la lista de pedidos te avisamos arriba de cuántos envíos devueltos tienes sin contestar.'),
    (N'Nuevo', N'Te avisamos de lo nuevo al entrar',
     N'Cuando haya novedades que todavía no has visto, al abrir la app te salen sus títulos y, si quieres, vas directamente a leerlas. También te contamos los cambios que se notan en la app aunque no se haya publicado una versión nueva.'),
    (N'Nuevo', N'Recoge en tienda',
     N'En la plantilla, junto a «Entrega», hay un interruptor «Recoge en tienda» para los pedidos de Algete que el cliente viene a buscar: el pedido va sin portes ni comisión de reembolso. En Alcobendas y Reina sale marcado siempre, porque allí se recoge siempre. También se puede cambiar en un pedido ya hecho mientras no tenga picking ni etiqueta.'),
    (N'Mejorado', N'Facturas por WhatsApp y por correo: las mandas tú, no administración',
     N'El mensaje de WhatsApp con las facturas o el pedido va firmado con tu nombre, y el correo de las facturas sale a tu nombre: si el cliente contesta, te llega a ti, y recibes una copia.'),
    (N'Mejorado', N'Los avisos de leads abren la ficha del cliente',
     N'Al tocar el aviso de un lead nuevo de campaña, o el de un lead que sigue sin llamar, se abre directamente la ficha de ese cliente.'),
    (N'Mejorado', N'Aviso de pago al contado con las ofertas de la feria online',
     N'Si al crear un pedido o un presupuesto llevas productos de una campaña que exige pago al contado (como la feria online) y el pedido no va al contado, te avisamos y te ofrecemos cambiar los plazos. Si dices que no, el pedido se crea como estaba.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.28.0' AND x.Titulo = n.Titulo
);

-- #272: incidencia 1102 de Carlos («Tanto al enviar factura por WhatsApp como por correo, da error»). Se marca
-- corregida en esta versión (no se inserta otra).
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'Enviar facturas por WhatsApp o por correo ya no da error',
    Descripcion = N'Al mandar una factura por WhatsApp o por correo desde el extracto del cliente salía «Ha ocurrido un error inesperado». Ya se pueden mandar las de tus clientes y, si alguna vez no se puede (por ejemplo, el correo no sale), te decimos el motivo para que lo vuelvas a intentar.',
    Estado = 'Implementada', [Version] = '2.28.0',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 1102 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 7 filas nuevas + la 1102.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.28.0' ORDER BY Id;
