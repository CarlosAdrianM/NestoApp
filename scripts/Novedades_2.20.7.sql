-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario) VALUES
-- ============================== 2.20.7 (23/09/2026) ==============================
('2.20.7', '2026-09-23', 'Mejorado', 'Las novedades, versión a versión',
 'En tu perfil se ven las novedades de la última versión, cada una en su tarjeta con sus votos y comentarios. Con las flechas de los lados puedes ir a las versiones anteriores.',
 'NestoApp', SUSER_SNAME()),
('2.20.7', '2026-09-23', 'Mejorado', 'Sabes cuándo se están buscando ofertas',
 'En el resumen del pedido sale «Calculando ofertas sin aplicar…» mientras se comprueba si hay alguna. Así no pasas de largo pensando que no hay nada, también cuando vuelves atrás y cambias productos.',
 'NestoApp', SUSER_SNAME());
