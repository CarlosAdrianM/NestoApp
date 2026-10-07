-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.23.0 (07/10/2026): minor (opciones nuevas en el menú y pestaña nueva en Rapports).
-- #212 clientes para contactar en Rapports (NestoAPI#603), #209 «Sugerir una mejora» y
-- «Algo no funciona» en el menú, #211 «Aplicar» en las ofertas escalonadas (incidencia 511),
-- #208 hueco bajo la cuenta del recibo (sugerencia 461). #210 (pegar imagen en Android) no va:
-- solo deja de salir un botón que no funcionaba.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.23.0', '2026-10-07', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'A quién llamar hoy, en Rapports',
     N'En Rapports hay una pestaña nueva, «Llamar», con los clientes que te conviene contactar hoy. Cada uno sale con su prioridad (Máxima, Alta, Media o Baja) y el motivo, y arriba ves tu ritmo: lo que llevas hoy, esta semana y este mes frente a tu objetivo. Toca un cliente para hacer el rapport o el teléfono para llamarle. Los que ya has atendido bajan al final.'),
    (N'Nuevo', N'Sugerir una mejora o avisar de un fallo, desde el menú',
     N'En el menú tienes «Sugerir una mejora» y «Algo no funciona». También están encima de las novedades. Ya no hace falta pasar de la última versión para encontrarlos.'),
    (N'Corregido', N'«Aplicar» en las ofertas por volumen',
     N'En la plantilla, cuando una oferta por volumen te da derecho a un descuento y no lo estás aplicando, al pulsar «Aplicar» se pone el descuento en todas las líneas de esa oferta.'),
    (N'Corregido', N'La cuenta del recibo, sin hueco en blanco',
     N'En el último paso de la plantilla, con recibo bancario, la cuenta se ve debajo de «Cuenta del recibo» y ya no deja un hueco grande antes de los plazos de pago.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.23.0' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 4 filas, sin repetidos.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.23.0' ORDER BY Id;
