-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.23.0 (07/10/2026): minor (botón «Llamar» nuevo en Rapports).
-- #212 clientes para contactar en Rapports (NestoAPI#603), #209 «Sugerir una mejora» y
-- «Algo no funciona» al pie de las novedades, #211 «Aplicar» en las ofertas escalonadas (incidencia 511),
-- #208 hueco bajo la cuenta del recibo (sugerencia 461). #210 (pegar imagen en Android) no va:
-- solo deja de salir un botón que no funcionaba.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.
-- OJO: #211 y #208 (incidencias 511 y 461) no se insertan aquí: las marca como novedades de la
-- 2.23.0 Novedades_2.23.0_correccion.sql (con el aviso de «Avisos» en la campana). Ejecutarlo después.
-- Los textos de aquí ya son los definitivos (los mismos que deja la corrección).

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.23.0', '2026-10-07', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'A quién llamar hoy, en Rapports',
     N'En Rapports, arriba a la derecha, tienes el botón «Llamar» con los clientes que te conviene contactar hoy. Cada uno sale con su prioridad (Máxima, Alta, Media o Baja) y el motivo, y arriba ves tu ritmo: lo que llevas hoy, esta semana y este mes frente a tu objetivo. Toca un cliente para hacer el rapport o el teléfono para llamarle. Los que ya has atendido bajan al final.'),
    (N'Nuevo', N'Sugerir una mejora o avisar de un fallo, sin buscar',
     N'Al final de las novedades de cada versión tienes «Sugerir una mejora» y «Algo no funciona». Ya no hace falta pasar de la última versión para encontrarlos.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.23.0' AND x.Titulo = n.Titulo
);

-- Comprobación (antes de la corrección): 2 filas nuevas.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.23.0' ORDER BY Id;
