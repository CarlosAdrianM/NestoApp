/*
    24/11/26: globos («consejos», NestoAPI#774) de NestoApp para lo nuevo de la 2.30.0.
    En NestoApp la Pantalla es la ruta («pedido-venta», «cliente»…) y el Ancla «<ruta>.<Control>» (directiva globoAncla).
    Los globos con ancla ESPERAN a que su control se vea (hasta 10 s): el de «Usar ya» solo sale a quien puede adelantar un
    cupón, el de «¿Dónde está lo que falta?» solo en pedidos (no en presupuestos) y el de «Próxima entrada» solo si la API da fecha.
    El de «Autorizaciones de pedidos» va SIN ancla (tarjeta centrada al entrar en la pantalla).
    VersionDesde 2.30.0: una app anterior no tiene los controles. Cada globo enlaza con su novedad (ejecutar ANTES
    scripts/Novedades_2.30.0.sql; si se lanza antes, al relanzarlo se enlazan) para el botón «Ver la novedad».
    Lanzar DESPUÉS de publicar la 2.30.0. Duran 45 días. Para todos (Grupos NULL).
    Ejecutar en SSMS contra NV. Idempotente: no repite un globo con la misma Aplicación + Pantalla + Ancla.
*/
SET NOCOUNT ON;
USE NV;

DECLARE @hoy date = CAST(GETDATE() AS date);
DECLARE @fin date = DATEADD(day, 45, @hoy);
DECLARE @orden int = ISNULL((SELECT MAX(Orden) FROM dbo.Globos WHERE Aplicacion = 'NestoApp'), 0);

DECLARE @novAlmacen int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Mi almacén: lo que tienes tú');
DECLARE @novAutorizacion int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Pide autorización cuando un pedido no pasa por una oferta');
DECLARE @novDondeEsta int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'En el pedido: «¿Dónde está lo que falta?»');
DECLARE @novProxima int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Ficha del producto: cuándo vuelve a entrar');
DECLARE @novQueEs int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Alta de cliente: «¿Qué es?» y el número de la calle');
DECLARE @novEntrega int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Alta de cliente: la entrega en otra dirección, en la misma alta');
DECLARE @novCupon int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.30.0' AND Titulo = N'Cupones de evento: usarlos antes por excepción');

DECLARE @g TABLE (Aplicacion varchar(10), VersionDesde varchar(23), Pantalla nvarchar(60), Ancla nvarchar(120),
                  Titulo nvarchar(100), Texto nvarchar(500), Grupos nvarchar(500), Orden int, NovedadId int);
INSERT INTO @g VALUES
('NestoApp', '2.30.0', 'mi-almacen', 'mi-almacen.Resumen', N'Nuevo: su almacén',
 N'Aquí ve lo que tiene en su almacén: los productos y cuántas unidades de cada uno, por familia. Use el buscador para encontrar uno y tóquelo para abrir su ficha. Es solo para consultar: meter y sacar lo hacen el almacén y las tiendas.',
 NULL, @orden + 10, @novAlmacen),
('NestoApp', '2.30.0', 'autorizaciones-pedido', NULL, N'Nuevo: autorizaciones de pedidos',
 N'Cuando un pedido no pasa por una oferta o un descuento, puede pulsar «Pedir autorización» en la plantilla. Aquí ve cómo van las que ha pedido: pendientes, autorizadas (con su pedido ya creado) o denegadas, con el motivo. También puede anularlas.',
 NULL, @orden + 20, @novAutorizacion),
('NestoApp', '2.30.0', 'pedido-venta', 'pedido-venta.DondeEstaLoQueFalta', N'Nuevo: ¿dónde está lo que falta?',
 N'Pulse aquí para saber dónde está cada producto que todavía no está listo en Algete: de camino desde una tienda, pendiente del proveedor (y para cuándo) o sin fecha.',
 NULL, @orden + 30, @novDondeEsta),
('NestoApp', '2.30.0', 'producto', 'producto.ProximaEntrada', N'Nuevo: próxima entrada',
 N'Aquí ve cuándo se espera que este producto vuelva a entrar en Algete, aunque todavía no esté pedido al proveedor (entonces la fecha es orientativa).',
 NULL, @orden + 40, @novProxima),
('NestoApp', '2.30.0', 'cliente', 'cliente.QueEs', N'Nuevo: ¿qué es la dirección?',
 N'Indique si es un piso, un local, una casa, una nave u otra cosa, y rellene lo que se le pide (en un local, lo que pone en el rótulo). Es lo que necesita el repartidor para encontrar al cliente.',
 NULL, @orden + 50, @novQueEs),
('NestoApp', '2.30.0', 'cliente', 'cliente.EntregaEnOtraDireccion', N'Nuevo: entrega en otra dirección',
 N'Si los pedidos se entregan en un sitio distinto de la dirección fiscal, márquelo aquí y rellene la segunda dirección: se crean las dos fichas a la vez y la de entrega queda por defecto.',
 NULL, @orden + 60, @novEntrega),
('NestoApp', '2.30.0', 'plantilla-venta', 'plantilla-venta.UsarCuponYa', N'Nuevo: usar el cupón ya',
 N'Este cupón de evento todavía no vale. Como jefe de equipo puede adelantarlo por excepción: pulse aquí e indique el motivo.',
 NULL, @orden + 70, @novCupon),
('NestoApp', '2.30.0', 'extracto-cliente', 'extracto-cliente.UsarCuponYa', N'Nuevo: usar el cupón ya',
 N'Este cupón de evento todavía no vale. Como jefe de equipo puede adelantarlo por excepción: pulse aquí e indique el motivo.',
 NULL, @orden + 80, @novCupon);

INSERT INTO dbo.Globos (Aplicacion, VersionDesde, Pantalla, Ancla, Titulo, Texto, Grupos, FechaDesde, FechaHasta, Orden, NovedadId)
SELECT g.Aplicacion, g.VersionDesde, g.Pantalla, g.Ancla, g.Titulo, g.Texto, g.Grupos, @hoy, @fin, g.Orden, g.NovedadId
FROM @g g
WHERE NOT EXISTS (SELECT 1 FROM dbo.Globos x WHERE x.Aplicacion = g.Aplicacion AND x.Pantalla = g.Pantalla
                  AND ISNULL(x.Ancla, N'') = ISNULL(g.Ancla, N''));
SELECT @@ROWCOUNT AS GlobosInsertadosAhora;

-- Si se lanzó antes que Novedades_2.30.0.sql, al relanzarlo se enlazan.
UPDATE x SET x.NovedadId = g.NovedadId
FROM dbo.Globos x JOIN @g g ON g.Aplicacion = x.Aplicacion AND g.Pantalla = x.Pantalla
     AND ISNULL(g.Ancla, N'') = ISNULL(x.Ancla, N'')
WHERE x.NovedadId IS NULL AND g.NovedadId IS NOT NULL;
SELECT @@ROWCOUNT AS GlobosEnlazadosASuNovedadAhora;

SELECT Id, Aplicacion, VersionDesde, Pantalla, Ancla, Orden, NovedadId, FechaDesde, FechaHasta, Activo FROM dbo.Globos
WHERE Aplicacion = 'NestoApp' ORDER BY Pantalla, Orden;
