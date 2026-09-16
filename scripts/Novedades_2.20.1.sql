-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades y filtra Ambito = 'NestoApp').
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
-- Incluye también las de 2.20.0 (canal Master del 09/09/26) porque los vendedores
-- saltan de 2.18.6 y verán las dos versiones juntas.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario) VALUES
-- ============================== 2.20.1 (16/09/2026) ==============================
('2.20.1', '2026-09-16', 'Nuevo', 'Selector de modo de entrega',
 'La casilla «Servir junto» es ahora un selector con cuatro modos: todo junto, según vaya entrando, tras reponer de tiendas o ahora lo que hay y el resto de una vez. Está en la plantilla de venta y en el detalle del pedido.',
 'NestoApp', SUSER_SNAME()),
('2.20.1', '2026-09-16', 'Nuevo', 'Los pedidos nacen en «Tras reponer de tiendas»',
 'Si no eliges otro modo, el pedido se sirve en cuanto la reposición habitual trae de las tiendas el stock que le corresponde.',
 'NestoApp', SUSER_SNAME()),
('2.20.1', '2026-09-16', 'Nuevo', 'Días que abre el centro, en la ficha del cliente',
 'Marca los días de la semana que el centro abre o cierra: no le sacaremos pedidos los días que cierra.',
 'NestoApp', SUSER_SNAME()),
('2.20.1', '2026-09-16', 'Mejorado', 'Los borradores ya no se acumulan',
 'Al crear un pedido que parte de un borrador, la app te ofrece borrar ese borrador.',
 'NestoApp', SUSER_SNAME()),
('2.20.1', '2026-09-16', 'Mejorado', 'Aviso si no rellenas los empleados del centro',
 'Si guardas un rapport sin indicar los empleados, la app te pide confirmar que es porque no lo sabes.',
 'NestoApp', SUSER_SNAME()),
('2.20.1', '2026-09-16', 'Mejorado', 'Novedades siempre al día',
 'Esta lista de novedades ahora se actualiza sola, sin esperar a una versión nueva de la app.',
 'NestoApp', SUSER_SNAME()),
-- ============================== 2.20.0 (09/09/2026) ==============================
('2.20.0', '2026-09-09', 'Nuevo', 'Pantalla «Ofertas autorizadas»',
 'En el menú lateral: consulta las ofertas vigentes combinadas, por familia y escalonadas, con su detalle. Las notificaciones de ofertas te llevan directamente a ella.',
 'NestoApp', SUSER_SNAME()),
('2.20.0', '2026-09-09', 'Nuevo', 'Copiar los datos del contacto principal',
 'Al crear un contacto de un cliente que ya existe, la app te ofrece copiarle las personas de contacto y las cuentas bancarias del principal.',
 'NestoApp', SUSER_SNAME()),
('2.20.0', '2026-09-09', 'Nuevo', 'Empleados del centro en el rapport',
 'En el rapport de los clientes de Madrid se pregunta el número de empleados del centro.',
 'NestoApp', SUSER_SNAME()),
('2.20.0', '2026-09-09', 'Mejorado', 'Las Ganavisiones ya no cuentan la peluquería',
 'Solo suman cosmética y accesorios.',
 'NestoApp', SUSER_SNAME()),
('2.20.0', '2026-09-09', 'Mejorado', 'Arranque más rápido',
 'La app arranca más rápido y cada actualización gasta bastantes menos datos.',
 'NestoApp', SUSER_SNAME());
GO
