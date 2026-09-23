-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.20.7 recoge también lo de 2.20.6, que solo llegó al canal Master: para los vendedores todo es
-- de esta versión. Se puede ejecutar aunque ya se ejecutase el script de 2.20.6 (y más de una vez):
-- las filas de 2.20.6 se pasan a 2.20.7 (sin borrarlas, por si ya tienen votos o comentarios) y
-- solo se insertan las que falten.

UPDATE dbo.Novedades SET [Version] = '2.20.7', Fecha = '2026-09-23'
WHERE Ambito = 'NestoApp' AND [Version] = '2.20.6';

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.20.7', '2026-09-23', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
-- ============================== 2.20.7 (23/09/2026) ==============================
    (N'Nuevo', N'Dinos qué te parece cada novedad',
     N'Debajo de cada novedad puedes votar 👍 o 👎 y dejar un comentario, con una captura de pantalla si quieres (de la galería o pegada). Lo leemos todos los días, así que no hace falta mandar un correo.'),
    (N'Nuevo', N'Con recibo bancario ves la cuenta que se va a cargar',
     N'Al elegir recibo bancario, en la plantilla y en el pedido sale la cuenta del cliente que se va a usar, y puedes cambiarla si tiene varias. Si no tiene ninguna válida, te avisamos de que el recibo no se podrá mandar al banco: pide la cuenta o elige otra forma de pago.'),
    (N'Mejorado', N'Solo puedes elegir los modos de entrega que tienen sentido',
     N'En el modo de entrega salen desactivados los que no encajan con el stock del pedido, con el motivo debajo. Si al cambiar los productos el modo que elegiste deja de tener sentido, se cambia solo y te lo explica. Y si el stock cambia justo mientras guardas, te decimos qué modo elegir.'),
    (N'Mejorado', N'Las novedades, versión a versión',
     N'En tu perfil se ven las novedades de la última versión, cada una en su tarjeta con sus votos y comentarios. Con las flechas de los lados puedes ir a las versiones anteriores.'),
    (N'Mejorado', N'Sabes cuándo se están buscando ofertas',
     N'En el resumen del pedido sale «Calculando ofertas sin aplicar…» mientras se comprueba si hay alguna. Así no pasas de largo pensando que no hay nada, también cuando vuelves atrás y cambias productos.'),
    (N'Corregido', N'El modo de entrega se recalcula al cambiar el pedido',
     N'Si volvías atrás, cambiabas productos o cantidades y avanzabas otra vez, el modo de entrega se quedaba con lo que salió la primera vez. Ahora se recalcula cada vez que llegas al resumen.'),
    (N'Corregido', N'El aviso de ofertas sin aplicar se puede plegar',
     N'En el resumen del pedido, al tocar el aviso de ofertas la lista se abre y se cierra de verdad; antes solo cambiaba la flecha y ocupaba sitio todo el rato.'),
    (N'Corregido', N'Vuelven a verse las novedades',
     N'Desde el 17 de septiembre no salía ninguna novedad en tu perfil.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.20.7' AND x.Titulo = n.Titulo
);
