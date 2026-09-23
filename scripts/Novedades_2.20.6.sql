-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario) VALUES
-- ============================== 2.20.6 (23/09/2026) ==============================
('2.20.6', '2026-09-23', 'Nuevo', 'Dinos qué te parece cada novedad',
 'Debajo de cada novedad puedes votar 👍 o 👎 y dejar un comentario, con una captura de pantalla si quieres (de la galería o pegada). Lo leemos todos los días, así que no hace falta mandar un correo.',
 'NestoApp', SUSER_SNAME()),
('2.20.6', '2026-09-23', 'Nuevo', 'Con recibo bancario ves la cuenta que se va a cargar',
 'Al elegir recibo bancario, en la plantilla y en el pedido sale la cuenta del cliente que se va a usar, y puedes cambiarla si tiene varias. Si no tiene ninguna válida, te avisamos de que el recibo no se podrá mandar al banco: pide la cuenta o elige otra forma de pago.',
 'NestoApp', SUSER_SNAME()),
('2.20.6', '2026-09-23', 'Mejorado', 'Solo puedes elegir los modos de entrega que tienen sentido',
 'En el modo de entrega salen desactivados los que no encajan con el stock del pedido, con el motivo debajo. Si al cambiar los productos el modo que elegiste deja de tener sentido, se cambia solo y te lo explica. Y si el stock cambia justo mientras guardas, te decimos qué modo elegir.',
 'NestoApp', SUSER_SNAME()),
('2.20.6', '2026-09-23', 'Corregido', 'El modo de entrega se recalcula al cambiar el pedido',
 'Si volvías atrás, cambiabas productos o cantidades y avanzabas otra vez, el modo de entrega se quedaba con lo que salió la primera vez. Ahora se recalcula cada vez que llegas al resumen.',
 'NestoApp', SUSER_SNAME()),
('2.20.6', '2026-09-23', 'Corregido', 'El aviso de ofertas sin aplicar se puede plegar',
 'En el resumen del pedido, al tocar el aviso de ofertas la lista se abre y se cierra de verdad; antes solo cambiaba la flecha y ocupaba sitio todo el rato.',
 'NestoApp', SUSER_SNAME()),
('2.20.6', '2026-09-23', 'Corregido', 'Vuelven a verse las novedades',
 'Desde el 17 de septiembre no salía ninguna novedad en tu perfil.',
 'NestoApp', SUSER_SNAME());
