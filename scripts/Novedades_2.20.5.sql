-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades y filtra Ambito = 'NestoApp').
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario) VALUES
-- ============================== 2.20.5 (22/09/2026) ==============================
('2.20.5', '2026-09-22', 'Nuevo', 'Pedidos con una sola mano',
 'El botón atrás del móvil vuelve a funcionar en toda la app, así que ya puedes salir del detalle de cada producto sin llegar a la flecha de arriba a la izquierda. Si sales de un pedido a medias, se te sigue preguntando si quieres guardarlo.',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Corregido', 'La pantalla de pago ya no se queda colgada',
 'Si el cliente no tenía dirección de entrega o no habían llegado las condiciones de pago, la plantilla de venta se quedaba inutilizable hasta reiniciar la app.',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Mejorado', 'Te avisamos si no hay direcciones de entrega',
 'Cuando no se pueden cargar las direcciones de un cliente, la app te lo dice y no te deja seguir hasta elegir una, en vez de fallar más adelante.',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Mejorado', 'La dirección se elige de la lista de Google',
 'Al dar de alta o modificar un cliente, la dirección (calle y número) se selecciona de las sugerencias y ya no se puede retocar a mano. El portal, el local o cualquier referencia van en «Dirección (resto de información)». Para cambiarla, bórrala con el botón de al lado y vuelve a buscar.',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Corregido', 'Los errores explican qué ha pasado',
 'Al abrir o guardar una ficha de cliente, cuando algo falla se ve el motivo en vez de un «undefined».',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Nuevo', 'Te avisamos de las ofertas que no estás aplicando',
 'En el resumen del pedido sale un aviso con las ofertas que podrías aplicar y no estás aplicando («con 1 unidad más tienes el 6+1», «este producto tiene un 2+1 sin poner», «añadiendo 12 € entra el regalo»). Las que dicen producto y cantidad se aplican con un toque.',
 'NestoApp', SUSER_SNAME()),
('2.20.5', '2026-09-22', 'Mejorado', 'El modo de entrega se propone según el stock',
 'Al llegar al resumen, el pedido se pone solo en el modo de entrega que le corresponde según el stock que haya de sus productos, y te explica por qué. Si lo cambias tú, se respeta tu elección.',
 'NestoApp', SUSER_SNAME());
