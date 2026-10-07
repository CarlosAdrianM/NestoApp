-- Corrección de las novedades de la 2.23.0 (07/10/2026). Ejecutar DESPUÉS de Novedades_2.23.0.sql.
--
-- 1) #211 y #208 venían de incidencias de Novedades (511 de Marta y 461 de David). La primera
--    versión de Novedades_2.23.0.sql las insertó como filas nuevas (537 y 538) y las incidencias
--    seguían «Pendiente». Ahora se hace como PUT api/Novedades/Sugerencias/{id}: la incidencia
--    recibe la versión, pasa a «Implementada» y a «Corregido», y quien la mandó la ve como novedad
--    con su texto y su comentario. Los duplicados se borran (solo tenían un voto de prueba).
-- 2) Textos de «Llamar» y de «Sugerir una mejora / Algo no funciona» según cómo han quedado:
--    «Llamar» es un botón de la barra de Rapports, y los dos accesos van al pie de las novedades
--    (no en el menú). «Avisos» sale del menú: se abren con la campana del perfil.
--
-- Se puede ejecutar más de una vez.

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- 1) Las incidencias corregidas pasan a ser novedades de la 2.23.0 (solo si siguen sin versión).
UPDATE dbo.Novedades SET
    Titulo = N'«Aplicar» en las ofertas por volumen',
    Descripcion = N'En la plantilla, cuando una oferta por volumen te da derecho a un descuento y no lo estás aplicando, al pulsar «Aplicar» se pone el descuento en todas las líneas de esa oferta.',
    Estado = 'Implementada', [Version] = '2.23.0', Categoria = N'Corregido',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 511 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

UPDATE dbo.Novedades SET
    Titulo = N'La cuenta del recibo, sin hueco en blanco',
    Descripcion = N'En el último paso de la plantilla, con recibo bancario, la cuenta se ve debajo de «Cuenta del recibo» y ya no deja un hueco grande antes de los plazos de pago.',
    Estado = 'Implementada', [Version] = '2.23.0', Categoria = N'Corregido',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 461 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Fuera los duplicados (filas de la 2.23.0 sin TextoOriginal, es decir, no son la sugerencia) y sus votos.
-- Si alguien los hubiera comentado no se borran: avisa y se mira a mano.
DELETE v FROM dbo.NovedadesVotos v
JOIN dbo.Novedades n ON n.Id = v.NovedadId
WHERE n.Ambito = 'NestoApp' AND n.[Version] = '2.23.0' AND n.TextoOriginal IS NULL
  AND n.Titulo IN (N'«Aplicar» en las ofertas por volumen', N'La cuenta del recibo, sin hueco en blanco')
  AND NOT EXISTS (SELECT 1 FROM dbo.NovedadesComentarios c WHERE c.NovedadId = n.Id);

DELETE n FROM dbo.Novedades n
WHERE n.Ambito = 'NestoApp' AND n.[Version] = '2.23.0' AND n.TextoOriginal IS NULL
  AND n.Titulo IN (N'«Aplicar» en las ofertas por volumen', N'La cuenta del recibo, sin hueco en blanco')
  AND NOT EXISTS (SELECT 1 FROM dbo.NovedadesComentarios c WHERE c.NovedadId = n.Id);

-- 2) Textos según cómo han quedado las pantallas.
UPDATE dbo.Novedades SET
    Descripcion = N'En Rapports, arriba a la derecha, tienes el botón «Llamar» con los clientes que te conviene contactar hoy. Cada uno sale con su prioridad (Máxima, Alta, Media o Baja) y el motivo, y arriba ves tu ritmo: lo que llevas hoy, esta semana y este mes frente a tu objetivo. Toca un cliente para hacer el rapport o el teléfono para llamarle. Los que ya has atendido bajan al final.',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Ambito = 'NestoApp' AND [Version] = '2.23.0' AND Titulo = N'A quién llamar hoy, en Rapports';

UPDATE dbo.Novedades SET
    Titulo = N'Sugerir una mejora o avisar de un fallo, sin buscar',
    Descripcion = N'Al final de las novedades de cada versión tienes «Sugerir una mejora» y «Algo no funciona». Ya no hace falta pasar de la última versión para encontrarlos.',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Ambito = 'NestoApp' AND [Version] = '2.23.0'
  AND Titulo IN (N'Sugerir una mejora o avisar de un fallo, desde el menú', N'Sugerir una mejora o avisar de un fallo, sin buscar');

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.23.0', '2026-10-07', N'Mejorado', N'Los avisos, en la campana',
       N'«Avisos» ya no está en el menú: los abres con la campana de arriba a la derecha de tu perfil, que además te dice cuántos tienes sin leer.',
       'NestoApp', SUSER_SNAME()
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.23.0' AND x.Titulo = N'Los avisos, en la campana'
);

COMMIT;

-- Comprobación: deben salir 5 filas: 461 y 511 (sugerencia, Implementada, Corregido) y tres
-- novedades (Rapports, sugerir sin buscar, avisos en la campana). Ningún título repetido.
SELECT Id, [Version], Estado, Categoria, Titulo,
       CASE WHEN TextoOriginal IS NULL THEN 'novedad' ELSE 'sugerencia' END AS Origen
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.23.0' ORDER BY Id;
