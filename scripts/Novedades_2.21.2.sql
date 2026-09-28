-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.21.2 (28/09/2026): patch (la 2.21.1 solo llegó a Master; sus novedades son de esta). #196 días que abre con picking (NestoAPI#541), #199 fecha de cada
-- versión, #195 capturas de la galería, #200 agencia de «Recoger producto» (NestoAPI#494) y, de
-- NestoAPI, buscar el cliente por número de factura (NestoAPI#544 f). #201 (coma en la dirección)
-- no lleva fila: ya lo hacía la API al guardar.
-- 2.21.2 añade: las novedades abren en la versión instalada y #195 sin FileReader (cordova-plugin-file
-- lo sustituye y su onload no llega nunca).
-- Ejecutar al PROMOCIONAR a Production: los vendedores en 2.21.1 o anterior abren siempre la más
-- reciente. A partir de esta, las novedades ya se pueden ejecutar al publicar en Master.
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.21.2', '2026-09-28', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Mejorado', N'Cerrar un día con pedidos en preparación avisa a almacén',
     N'Si en la ficha del cliente quitas un día que abre y ya tiene algún pedido en preparación, ese pedido va a salir igual. Te lo decimos y puedes elegir: «Avisar a almacén» guarda la ficha y les manda el aviso; «Cancelar» deja los días como estaban.'),
    (N'Mejorado', N'Cada versión con su fecha',
     N'En las novedades de tu perfil, junto al número de cada versión sale el día en que se publicó (también en los resultados del buscador). Así sabes si algo se arregló antes o después de un día concreto.'),
    (N'Corregido', N'Capturas en los comentarios y sugerencias',
     N'Ya puedes adjuntar una captura de la galería a un comentario o a una sugerencia, y ves las capturas que han puesto los demás.'),
    (N'Mejorado', N'Las novedades de tu versión',
     N'Al abrir las novedades de tu perfil ves las de la versión que tienes. Con la flecha de la derecha puedes ver las que están a punto de llegarte.'),
    (N'Mejorado', N'«Recoger producto» con la agencia que mejor sale',
     N'Al marcar «Recoger producto» en un pedido, la agencia que lo entrega y se trae lo que hay que recoger se elige comparando precios, en vez de ir siempre por la misma.'),
    (N'Mejorado', N'Buscar un cliente por su número de factura',
     N'En el buscador de clientes puedes escribir un número de factura (por ejemplo NV2615541) y te sale el cliente de esa factura.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.21.2' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 6 filas, sin repetidos.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.21.2' ORDER BY Id;
