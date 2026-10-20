-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.25.0 (20/10/2026): minor («Puede ofrecer», hoja nueva con su ayuda en la plantilla).
-- #235 «Puede ofrecer», #238 sugerencias privadas, #229 ofertas combinadas, #232/#233 muestras sin stock,
-- #236 aviso de incidencia de agencia (NestoAPI#666), #239 enlace de pago contra reembolso (NestoAPI#679),
-- #237 «Cerrado a mano», clientes para contactar de peluquería (NestoAPI#620),
-- #231 (incidencia 605 de Marta: va como UPDATE de su fila, no como novedad nueva).
-- #217 (cupones) va aparte, al final: solo cuando esté publicada NestoAPI#613.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.25.0', '2026-10-20', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'«Puede ofrecer»: ideas para vender más en cada pedido',
     N'En la plantilla, arriba, el botón 💡 con un número abre hasta tres productos que a ese cliente le pueden encajar (porque ya le toca, porque va con lo que lleva, porque lo compran clientes parecidos o porque conviene moverlo), con una frase que le puedes decir tal cual. «✓ Añadir» lo mete en el pedido; «✗ No le interesa» si se lo has ofrecido y no lo quiere; «🚫 Quitar» si ni se lo vas a ofrecer. Cada toque hace que las siguientes acierten más. No es obligatorio; en «¿Cómo funciona?» tienes la explicación.'),
    (N'Mejorado', N'Sugerencias privadas',
     N'Al sugerir una mejora puedes marcar «Privada»: solo la veremos tú, Dirección e Informática. Te recomendamos dejarla pública, para que los compañeros puedan apoyarla con «Me gusta» y aprender de las respuestas. Las privadas llevan un candado y no se votan.'),
    (N'Mejorado', N'«Aplicar» también en las ofertas combinadas',
     N'Si el pedido ya cumple una oferta combinada (por ejemplo, 6+1 con el regalo de otra referencia) y falta el regalo, en las ofertas sin aplicar te lo proponemos y con «Aplicar» se añade. Si puedes elegir entre varias referencias, te preguntamos cuál. También te avisamos si con unas unidades más llegas a la oferta.'),
    (N'Mejorado', N'Muestras sin stock: te ofrecemos quitarlas',
     N'Si al pasar el pedido de «Todo junto» a otro modo de entrega lo impiden unas muestras sin stock, te ofrecemos quitarlas y seguir; si no, te decimos que el pedido se queda en «Todo junto». Y en los pedidos que salen por ruta desde Algete, antes de grabar te ofrecemos dejar las muestras en lo que hay allí.'),
    (N'Nuevo', N'Aviso cuando la agencia pone una incidencia',
     N'Si la agencia pone una incidencia en el envío de un pedido tuyo, te llega un aviso al móvil con el cliente y el motivo. Al tocarlo se abre el pedido.'),
    (N'Mejorado', N'Enlace de pago de un pedido contra reembolso',
     N'Si mandas un enlace de pago de un pedido que va contra reembolso (o que ya va en camino con reembolso), te avisamos para que lo pases a tarjeta y la agencia no intente cobrárselo otra vez.'),
    (N'Mejorado', N'Envíos «Cerrado a mano»',
     N'En el seguimiento del pedido, los envíos con incidencia que la agencia nunca cerró y se han dado por cerrados salen como «Cerrado a mano».'),
    (N'Mejorado', N'Clientes para contactar también en peluquería',
     N'Los vendedores de peluquería también tienen su lista de clientes para contactar en «Llamar», con sus propias compras.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.25.0' AND x.Titulo = n.Titulo
);

-- #231: incidencia 605 de Marta. Se marca corregida en esta versión (no se inserta otra).
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'Mensajes claros cuando el servidor no contesta',
    Descripcion = N'Si al guardar algo el servidor no responde (sin cobertura, porque tarda demasiado o porque se está actualizando), ya no sale «Ha ocurrido un error inesperado»: te decimos qué pasa y que lo intentes de nuevo en un momento.',
    Estado = 'Implementada', [Version] = '2.25.0',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 605 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 8 filas nuevas + la 605.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.25.0' ORDER BY Id;

-- ===== #217 (corte 2): SOLO cuando esté publicada NestoAPI#613 (cupones). Hasta entonces la app
-- ===== no enseña nada (la API vieja da 404). Descomentar y ejecutar entonces.
-- INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
-- SELECT '2.25.0', '2026-10-20', N'Nuevo', N'Cupones del cliente en el pedido',
--     N'Si el cliente tiene un cupón (por ejemplo, de un curso), al llegar al total del pedido lo ves con su importe y hasta cuándo vale. Márcalo para aplicarlo: se descuenta del pedido. Solo uno por pedido, y el pedido tiene que llevar al menos el doble del cupón en productos; al guardar se comprueba.',
--     'NestoApp', SUSER_SNAME()
-- WHERE NOT EXISTS (SELECT 1 FROM dbo.Novedades x WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.25.0'
--                   AND x.Titulo = N'Cupones del cliente en el pedido');
