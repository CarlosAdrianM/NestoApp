-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.28.1 (13/11/2026): patch durante la feria online.
-- #282 packs con su precio especial y además el N+M (los 45929/45930/45931 con 6+1, autorizado por Dirección comercial).
-- #277 el color del stock al cambiar de almacén (la 1215 es de Nesto: la marca Nesto, aquí va como novedad nueva).
-- #276 nace de la incidencia 1216 y #278 de la 1233: van como UPDATE de su fila, no como novedad nueva.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.28.1', '2026-11-13', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Mejorado', N'Packs de la feria con su precio especial y además el regalo',
     N'Algunos productos tienen autorizado llevar su precio especial y también la oferta de unidades de regalo (por ejemplo, los packs de la feria online con el 6+1). Al poner las unidades de regalo en esos productos, la línea se queda con el precio especial en vez de volver al precio de tarifa, y el pedido se guarda sin problema. En el resto de productos sigue igual: o precio especial, o regalo.'),
    (N'Corregido', N'El color del stock al cambiar de almacén',
     N'Si en la plantilla cambias de almacén, el color de las líneas que ya llevan cantidad se actualiza con el stock del almacén nuevo (y el aviso de productos sin stock suficiente cuenta bien). Antes se quedaba sin color o miraba el stock de otro almacén.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.28.1' AND x.Titulo = n.Titulo
);

-- #276: incidencia 1216 («No me deja actualizar los rapports, arriba no aparece el disquete de guardar»).
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'Ya puedes modificar tus rapports',
    Descripcion = N'A algunos vendedores no les salía el disquete para guardar los cambios de un rapport suyo ya guardado (dependía de cómo habían escrito el usuario al entrar en la app, con mayúsculas o minúsculas). Ahora sale siempre en los rapports que son tuyos.',
    Estado = 'Implementada', [Version] = '2.28.1',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 1216 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- #278: incidencia 1233 («fuera 0 apuntados y dentro 2 apuntados y caducados»).
UPDATE dbo.Novedades SET
    Categoria = N'Corregido',
    Titulo = N'Eventos: las inscripciones caducadas o anuladas ya no cuentan como apuntadas',
    Descripcion = N'En la ficha de un evento, «personas apuntadas» cuenta solo a quienes ocupan plaza, igual que la lista de eventos. Las inscripciones caducadas (no se pagaron a tiempo), las anuladas y las de quien ha dicho que no podrá ir salen aparte en el resumen y al final de la lista, en gris.',
    Estado = 'Implementada', [Version] = '2.28.1',
    Usuario = SUSER_SNAME(), Fecha_Modificación = GETDATE()
WHERE Id = 1233 AND Ambito = 'NestoApp' AND TextoOriginal IS NOT NULL AND [Version] IS NULL;

-- Comprobación: 2 filas nuevas + la 1216 y la 1233.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.28.1' ORDER BY Id;
