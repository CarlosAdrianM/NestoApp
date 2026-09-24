-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.20.8 (24/09/2026): lo de la app (#190 #191 #192 #193 #194) y lo que cambió en NestoAPI y se nota
-- desde la app aunque no se tocase su código (API#529, #528, #535 y #11). Las de Nesto 1.10.31.0 no
-- valen tal cual: hablan de la campana, el ratón o Win+Mayús+S.
-- Idempotente: compara por Ámbito + Versión + Título.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.20.8', '2026-09-24', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
-- ============================== 2.20.8 (24/09/2026) ==============================
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
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.20.8' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 8 filas, sin repetidos.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.20.8' ORDER BY Id;
