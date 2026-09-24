-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.21.0 (24/09/2026): minor por la opción nueva «Avisos» del menú (#176). Además, la cuenta del
-- recibo (#189) con el criterio de la API (NestoAPI 69102110).
-- Idempotente: compara por Ámbito + Versión + Título.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.21.0', '2026-09-24', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
-- ============================== 2.21.0 (24/09/2026) ==============================
    (N'Nuevo', N'Avisos: todas tus notificaciones en un sitio',
     N'En el menú hay una opción nueva, «Avisos», con el número de los que no has leído (también sale en la campana de arriba en tu perfil). Ahí se guardan todas las notificaciones que te llegan al móvil, aunque las hayas descartado o el móvil estuviera en silencio. Al tocar un aviso te lleva a su sitio (por ejemplo, a la respuesta en las novedades). Desliza a la izquierda para borrarlo, o márcalos todos como leídos con el botón de arriba.'),
    (N'Mejorado', N'Sabes por qué no vale una cuenta del recibo',
     N'Con recibo bancario, si la cuenta de la dirección no se puede usar, te decimos por qué (de baja, IBAN incompleto…) y qué cuenta se usará en su lugar: primero la de la ficha del cliente. Y si no tiene ninguna válida, sale el motivo de cada una.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.21.0' AND x.Titulo = n.Titulo
);

-- Comprobación: deben salir 2 filas, sin repetidos.
SELECT Id, [Version], Categoria, Titulo, Ambito
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.21.0' ORDER BY Id;
