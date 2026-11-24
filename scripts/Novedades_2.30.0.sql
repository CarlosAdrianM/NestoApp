-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.30.0 (24/11/2026): minor (pantallas nuevas: «Mi almacén» y «Autorizaciones de pedidos»).
-- #292 mi almacén (NestoAPI#894), #280 y #290.5 pedir autorización de un pedido (Novedades 1258), #289 dónde está lo que
-- falta, #283 próxima entrada (NestoAPI#869), #286 #288 #290.1 alta y modificación de cliente (NestoAPI#874 y #879),
-- #293 campaña «solo en stock» (NestoAPI#889), #287 pedido en preparación y modo 6 (sugerencia 1340), #290.4 formación
-- (incidencia 1398), #291 cupón adelantado (NestoAPI#885), #285 versión del pedido (NestoAPI#873), #290.3 devueltos,
-- #284 cliente sin compras (incidencia 1300).
-- La 1300 es la única que nace de una incidencia de ámbito NestoApp: va por UPDATE. Las 1258, 1340 y 1398 son de ámbito
-- Nesto (las lleva su script): aquí van como INSERT.
-- Requisitos en la API (si faltan, la app no enseña nada o enseña el mensaje de la API, nunca falla): que esté publicada
-- con #869, #873, #874, #879, #885, #889 y #894 y sus scripts (Issue874_ClientesDireccion2, PedidosAutorizacionesSolicitadas,
-- Sugerencia1340_ModoJuntoConLoPendiente, AmpliacionesPedidoEnPreparacion, BlackFriday2026_CampanasCondicionStock,
-- Issue894_AlmacenesFicticios).
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.30.0', '2026-11-24', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Black Friday: el descuento es solo para lo que hay en stock',
     N'Al guardar un pedido con productos de la campaña de los que no hay bastante stock, la app te dice cuántos hay y te pregunta si quitas el descuento de la campaña a lo que falta. Si dices que sí (lo normal), lo que hay en stock va con descuento y el resto se separa en otra línea sin él. Si dices que no, va todo con descuento aunque no haya stock: es la excepción y la decides tú.'),
    (N'Nuevo', N'Mi almacén: lo que tienes tú',
     N'En el menú hay una pantalla nueva, «Mi almacén», con los productos que tienes en tu almacén y cuántas unidades de cada uno, agrupados por familia y con buscador. Tocando un producto abres su ficha. Es solo para consultar: meter y sacar lo siguen haciendo el almacén y las tiendas. Los jefes de equipo pueden ver también los de su equipo.'),
    (N'Nuevo', N'Pide autorización cuando un pedido no pasa por una oferta',
     N'Si al crear un pedido la app lo rechaza por una oferta o un descuento que no está autorizado, ya no tienes que llamar: pulsa «Pedir autorización», añade un comentario si quieres y le llega a quien puede darla. Si la autoriza, el pedido se crea solo y te avisamos; si no, te dice por qué. En el menú, «Autorizaciones de pedidos» te enseña cómo van las que has pedido y te deja anularlas.'),
    (N'Nuevo', N'En el pedido: «¿Dónde está lo que falta?»',
     N'En un pedido que todavía no ha salido entero, debajo de la fecha de entrega, tienes «¿Dónde está lo que falta?». Te dice, producto a producto, dónde está lo que no está listo en Algete: si viene de camino desde una tienda (y si el repartidor ya lo ha recogido), si lo trae el proveedor y cuándo, o si aún no tiene fecha.'),
    (N'Nuevo', N'Ficha del producto: cuándo vuelve a entrar',
     N'En la ficha del producto hay una línea nueva, «Próxima entrada», con la fecha en la que se espera que vuelva a entrar en Algete. Sale aunque todavía no esté pedido al proveedor (en ese caso es orientativa y lo dice).'),
    (N'Nuevo', N'Alta de cliente: «¿Qué es?» y el número de la calle',
     N'Al dar de alta un cliente o un contacto se pregunta qué es la dirección: piso (con su piso y puerta), local (con lo que pone en el rótulo), casa, nave u otra cosa. Es lo que necesita el repartidor para encontrarlo, y sustituye al campo libre de «resto de la dirección». Si Google no sabe el número de la calle, se escribe aparte y se comprueba. El código postal ya no se teclea: sale de la dirección que eliges. Al modificar un cliente también lo puedes ver y cambiar, y si cambias la calle te pide revisarlo.'),
    (N'Nuevo', N'Alta de cliente: la entrega en otra dirección, en la misma alta',
     N'Si al cliente se le entrega en un sitio distinto de su dirección fiscal, marca «La entrega es en otra dirección» y rellena la segunda dirección ahí mismo. Se crean las dos fichas de una vez y la de entrega queda como la dirección por defecto del cliente.'),
    (N'Nuevo', N'Modo de entrega «Junto con lo pendiente del cliente»',
     N'Cuando el cliente ya tiene algo pendiente de servir (un pedido o una nota de entrega), al hacerle otro pedido puedes elegir que salga todo junto con eso. Solo aparece cuando hay algo con lo que juntarlo, y debajo te dice con qué saldrá.'),
    (N'Nuevo', N'Añadir productos a un pedido que ya se está preparando',
     N'Si añades productos a un pedido que el almacén ya está preparando para hoy, la app te lo dice y eliges: hacer un pedido nuevo con lo añadido o pedir al almacén que lo meta en el mismo envío. Si el almacén dice que no entra (o no contesta en una hora), lo añadido pasa solo a un pedido nuevo, y te avisamos de cómo ha quedado.'),
    (N'Nuevo', N'La formación ya se puede vender desde la plantilla',
     N'La formación que no es un evento (prácticas, módulos…) sale ya en el buscador de la plantilla y se mete como un producto más. Si la mezclas con productos, se guarda sola en un pedido aparte y la app te dice los dos números.'),
    (N'Nuevo', N'Cupones de evento: usarlos antes por excepción',
     N'Un cupón de un evento vale desde el día del evento. Los jefes de equipo pueden ahora, en los clientes de su equipo, adelantarlo con «Usar ya (excepción)», indicando el motivo. Sale en la plantilla y en el extracto del cliente, junto al aviso del cupón.'),
    (N'Mejorado', N'Si otra persona cambia el pedido mientras lo tienes abierto, te avisamos',
     N'Antes, si alguien modificaba un pedido mientras tú lo tenías abierto, al guardar se perdían sus cambios. Ahora la app te dice quién lo ha cambiado y a qué hora, y puedes «Recargar conservando mis cambios»: se lee el pedido tal como lo dejó la otra persona y encima se ponen los tuyos (las líneas que has añadido, las cantidades, los comentarios…), sin tener que teclearlos otra vez. Solo te pregunta si los dos habéis cambiado lo mismo, para que elijas con cuál te quedas. Luego lo revisas y guardas.'),
    (N'Mejorado', N'La dirección completa del cliente, a la vista',
     N'Al elegir cliente, al elegir la dirección de entrega y en la lista de pedidos se ve la dirección entera, con el piso, el local o el rótulo.'),
    (N'Mejorado', N'Envíos devueltos: fuera los que ya están resueltos',
     N'En «Envíos devueltos» ya no salen los que están resueltos (puedes verlos con un interruptor). Y si no te corresponde a ti decidir qué se hace con un envío, la app te dice por qué.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.30.0' AND x.Titulo = n.Titulo
);

-- Incidencia 1300 (María José, 16/11/26, cliente 42004): la plantilla de un cliente sin compras decía «Error».
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'La plantilla de un cliente nuevo ya no dice «Error»',
    Descripcion = N'Al abrir la plantilla de un cliente que todavía no ha comprado nada salía un aviso de «Error». No lo era: la plantilla se rellena con lo que el cliente ya ha comprado y, si no hay nada, sale vacía. Ahora te lo dice así y te indica que busques los productos en el buscador de arriba.',
    Estado = 'Implementada', [Version] = '2.30.0',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 1300 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 15 filas (14 nuevas + la 1300).
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' ORDER BY Id;
