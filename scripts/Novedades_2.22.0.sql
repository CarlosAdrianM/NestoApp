-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.22.0 (30/09/2026): minor. #197 modo de facturación (NestoAPI#542), #198 cambiar el cliente
-- de un pedido (NestoAPI#519), #203 «Algo no funciona» (NestoAPI#558), #206 saldo a favor al
-- mandar el cobro por tarjeta (Nesto#505), #202 los avisos de un pedido lo abren (NestoAPI#555,
-- #557, #565) y #204 ofertas autorizadas (NestoAPI#233). De NestoAPI, el cliente recién creado
-- sale en el buscador al momento (NestoAPI#566).
-- Desde la 2.21.2 se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada
-- como «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.22.0', '2026-09-30', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Cuándo se factura el pedido',
     N'Donde antes estaba «Mantener junto» ahora eliges la facturación: «Por entregas», «Al completar el pedido» o «Todo ahora, lo pendiente se entrega después». Las opciones que no valen para ese cliente salen desactivadas y te decimos por qué. En las líneas verás «Ya facturada» y lo que queda «A recoger».'),
    (N'Nuevo', N'Pasar un pedido a otro cliente',
     N'Si el cliente se ha dado de alta en una ficha nueva y el pedido estaba en la vieja, en la cabecera del pedido tienes «Cambiar cliente». Eliges el cliente nuevo y se recalculan solas las condiciones de pago, los precios y los portes; al terminar te decimos qué ha cambiado. Solo se puede mientras el pedido no haya empezado a prepararse.'),
    (N'Nuevo', N'«Algo no funciona» en las novedades',
     N'Junto a «Sugerir una mejora» tienes «Algo no funciona». Cuéntanos qué estabas haciendo y qué ha pasado (puedes añadir una captura) y lo revisaremos. Cuando esté arreglado te diremos en qué versión.'),
    (N'Mejorado', N'Saldo a favor al mandar el cobro por tarjeta',
     N'Al marcar «¿Mandar cobro por tarjeta?», si el cliente tiene algo a su favor te lo enseñamos con su detalle. Si quieres descontarlo del enlace, marca la casilla; si no, el enlace sale por el total, como siempre. Después acuérdate de aplicarlo al pedido en el extracto.'),
    (N'Mejorado', N'Los avisos de un pedido te llevan a él',
     N'Al tocar un aviso que habla de un pedido (por ejemplo, cuando coge picking uno que tenía «Avisar con importe», o cuando un pedido se ha creado con un NIF incorrecto), se abre ese pedido. También desde la lista de avisos.'),
    (N'Mejorado', N'Ofertas autorizadas al día',
     N'Cuando se autorice una oferta nueva te puede llegar un aviso: al tocarlo se abre la oferta, aunque ya estuvieras mirando las ofertas.'),
    (N'Mejorado', N'Clientes nuevos en el buscador al momento',
     N'Un cliente que se acaba de dar de alta ya sale en el buscador de clientes, sin esperar al día siguiente.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.22.0' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 7 filas, sin repetidos.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.22.0' ORDER BY Id;
