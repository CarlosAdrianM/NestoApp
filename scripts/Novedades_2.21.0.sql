-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.21.0 (24/09/2026): minor por la opción nueva «Avisos» del menú (#176). Además, la cuenta del
-- recibo (#189) con el criterio de la API (NestoAPI 69102110).
--
-- 2.21.0 recoge también lo de 2.20.8, que solo llegó al canal Master: para los vendedores todo es de
-- esta versión. Se puede ejecutar aunque ya se ejecutase el script de 2.20.8 (y más de una vez): las
-- filas de 2.20.8 se pasan a 2.21.0 (sin borrarlas, por si ya tienen votos o comentarios) y solo se
-- insertan las que falten.

UPDATE dbo.Novedades SET [Version] = '2.21.0', Fecha = '2026-09-24'
WHERE Ambito = 'NestoApp' AND [Version] = '2.20.8';

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.21.0', '2026-09-24', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
-- ============================== 2.21.0 (24/09/2026) ==============================
    (N'Nuevo', N'Avisos: todas tus notificaciones en un sitio',
     N'En el menú hay una opción nueva, «Avisos», con el número de los que no has leído (también sale en la campana de arriba en tu perfil). Ahí se guardan todas las notificaciones que te llegan al móvil, aunque las hayas descartado o el móvil estuviera en silencio. Al tocar un aviso te lleva a su sitio (por ejemplo, a la respuesta en las novedades). Desliza a la izquierda para borrarlo, o márcalos todos como leídos con el botón de arriba.'),
    (N'Mejorado', N'Sabes por qué no vale una cuenta del recibo',
     N'Con recibo bancario, si la cuenta de la dirección no se puede usar, te decimos por qué (de baja, IBAN incompleto…) y qué cuenta se usará en su lugar: primero la de la ficha del cliente. Y si no tiene ninguna válida, sale el motivo de cada una.'),
-- ---- las de 2.20.8 (solo llegó a Master) ----
    (N'Nuevo', N'Sugiere lo que te vendría bien',
     N'En las novedades de tu perfil, con la flecha de la derecha desde la última versión, llegas a «Sugerencias pendientes». Pulsa «Sugerir nueva característica», cuéntalo como te salga y, si quieres, añade una captura. Ahí salen las de todos: puedes votarlas y comentarlas. Las revisamos a diario, y las que se hagan pasan a su versión con sus votos y comentarios.'),
    (N'Nuevo', N'Buscador en las novedades',
     N'Encima de las novedades hay un buscador. Escribe una o varias palabras (con o sin tildes) y, al tocar un resultado, te lleva a su versión y te la marca, para que puedas comentarla.'),
    (N'Nuevo', N'Menciona a un compañero con @',
     N'Al escribir un comentario o una sugerencia, pon @ y sale la lista de compañeros, que se va filtrando según escribes. A quien menciones le llega un aviso en el móvil. Si el asistente no entiende lo que pides, menciona a @Carlos.'),
    (N'Nuevo', N'Te avisamos cuando te contestan',
     N'Cuando alguien contesta a tu comentario en las novedades o te menciona, te llega un aviso al móvil. Al tocarlo se abre la novedad justo en esa respuesta. Si tienes la app abierta, sale arriba con un botón «Ver».'),
    (N'Mejorado', N'Con picking, el cambio de modo de entrega se pide a almacén',
     N'Si el pedido ya está en preparación (tiene picking) o ha salido parte hoy, ya no se puede cambiar el modo de entrega: te explicamos por qué y puedes pedírselo a almacén, con un comentario si quieres. Lo intentarán, pero puede que ya no llegue a tiempo.'),
    (N'Mejorado', N'Los regalos, solo si hay stock',
     N'Un regalo (Ganavisión, regalo por importe, material promocional) ya no entra en el pedido si no hay stock para darlo: al guardar te decimos cuál es para que elijas otro. Tampoco te proponemos «añadiendo X € te llevas el regalo» con un regalo que no hay. Y si un pedido se sirve por partes y solo quedaría pendiente el regalo, espera a salir entero: nada de envíos de 0 €.'),
    (N'Mejorado', N'Novedades al día y lo que más gusta arriba',
     N'Al arrastrar hacia abajo en tu perfil se actualizan también las novedades, con sus votos y comentarios, y al volver a la pantalla se ponen al día solas. Dentro de cada versión salen primero las más votadas.'),
    (N'Corregido', N'La etiqueta «Picking» solo en los pedidos que aún no han salido',
     N'En la lista de pedidos y en el extracto del cliente salía «Picking» en pedidos servidos o facturados hace tiempo. Ahora solo sale en los que están de verdad en preparación.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.21.0' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 10 filas (2 nuevas + las 8 de 2.20.8), sin repetidos, y ninguna 2.20.8.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.21.0' ORDER BY Id;

SELECT COUNT(*) AS QuedanEn2208 FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.20.8';
