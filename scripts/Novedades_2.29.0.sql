-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.29.0 (13/11/2026): minor (pantalla nueva: Recogidas).
-- #259 solicitar una recogida (NestoAPI#855, Nesto#635), #279 pedido «todo junto» retenido por una falta (NestoAPI#858),
-- #281 pagar a plazos un pedido (NestoAPI#864, Nesto#640).
-- Ninguna nace de una sugerencia de Novedades: todas son INSERT.
-- Requisitos en la API (si faltan, la app no enseña nada o dice «todavía no disponible», nunca falla):
--   Scripts/Issue855_RecogidasSolicitadas.sql, Scripts/Issue858_PedidosRetenidosPorFalta.sql, Scripts/Issue864_PagoAPlazos*.sql.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.29.0', '2026-11-13', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Pide una recogida desde la app',
     N'En la ficha del cliente y en su extracto hay un botón nuevo, «Recogidas», para pedir al almacén que recojan algo del cliente (un aparato para reparar, una devolución…). Elige si la recoge el reparto (clientes de nuestra ruta) o la recoges tú. El almacén la confirma o te dice por qué no, y te avisamos. Si la recoges tú, cuando esté confirmada tendrás ahí un código de barras para que te lo lean al entregarla en Algete.'),
    (N'Nuevo', N'Pedidos «todo junto» retenidos por una falta: decides tú',
     N'Si al preparar un pedido «todo junto» falta un producto, el pedido se queda parado en el almacén y te avisamos. En el pedido verás qué falta y hasta qué hora puedes decidir: «Servir lo que hay» (sale ya, y lo que falta se manda cuando llegue) o «Esperar» a tenerlo completo. Si no decides a tiempo, se espera. En la lista de pedidos te avisamos arriba de los que tienes pendientes.'),
    (N'Nuevo', N'Pagar un pedido a plazos (Aplázame)',
     N'En el pedido, y al terminar de pasarlo, puedes ofrecer al cliente pagarlo a plazos con Aplázame cuando el pedido lo permite. Si el cliente tiene nuestra app, le llega un aviso para terminar el pago allí; si no, te damos el enlace para mandárselo por WhatsApp. En el pedido ves cómo va la solicitud (pendiente, aprobada, rechazada…) y la puedes cancelar.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.29.0' AND x.Titulo = n.Titulo
);

-- Comprobación: 3 filas.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.29.0' ORDER BY Id;
