/*
    13/11/26: primeros globos («consejos», NestoAPI#774) de NestoApp, para lo nuevo de la 2.29.0.
    En NestoApp la Pantalla es la ruta («pedido-venta», «cliente»…) y el Ancla «<ruta>.<Control>» (directiva globoAncla).
    Los globos con ancla ESPERAN a que su control se vea (hasta 10 s): el de «Pagar a plazos» solo sale en los pedidos que se
    pueden financiar, y el de la lista de pedidos solo cuando hay alguno retenido por una falta.
    VersionDesde 2.29.0: una app anterior no tiene los controles. Cada globo enlaza con su novedad (si ya está insertada: ejecutar
    ANTES scripts/Novedades_2.29.0.sql) para el botón «Ver la novedad».
    Lanzar DESPUÉS de publicar la 2.29.0. Duran 45 días. Para todos (Grupos NULL).
    Ejecutar en SSMS contra NV. Idempotente: no repite un globo con la misma Aplicación + Ancla.
*/
SET NOCOUNT ON;
USE NV;

DECLARE @hoy date = CAST(GETDATE() AS date);
DECLARE @fin date = DATEADD(day, 45, @hoy);
DECLARE @orden int = ISNULL((SELECT MAX(Orden) FROM dbo.Globos WHERE Aplicacion = 'NestoApp'), 0);

DECLARE @novRecogidas int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.29.0' AND Titulo = N'Pide una recogida desde la app');
DECLARE @novRetenidos int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.29.0' AND Titulo = N'Pedidos «todo junto» retenidos por una falta: decides tú');
DECLARE @novPlazos int = (SELECT TOP 1 Id FROM dbo.Novedades WHERE Ambito = 'NestoApp' AND [Version] = '2.29.0' AND Titulo = N'Pagar un pedido a plazos (Aplázame)');

DECLARE @g TABLE (Aplicacion varchar(10), VersionDesde varchar(23), Pantalla nvarchar(60), Ancla nvarchar(120),
                  Titulo nvarchar(100), Texto nvarchar(500), Grupos nvarchar(500), Orden int, NovedadId int);
INSERT INTO @g VALUES
('NestoApp', '2.29.0', 'cliente', 'cliente.Recogidas', N'Nuevo: recogidas',
 N'Desde aquí puede pedir al almacén que recojan algo de este cliente: un aparato para reparar, una devolución… Le avisaremos cuando la confirmen.',
 NULL, @orden + 10, @novRecogidas),
('NestoApp', '2.29.0', 'extracto-cliente', 'extracto-cliente.Recogidas', N'Nuevo: recogidas',
 N'Con este botón pide una recogida de este cliente y ve cómo van las que ya ha pedido.',
 NULL, @orden + 20, @novRecogidas),
('NestoApp', '2.29.0', 'recogidas', 'recogidas.QuienRecoge', N'¿Quién la recoge?',
 N'«El reparto» solo vale para clientes de nuestra ruta. Si elige «La recojo yo», cuando el almacén la confirme tendrá aquí un código de barras para que se lo lean al entregarla en Algete.',
 NULL, @orden + 30, @novRecogidas),
('NestoApp', '2.29.0', 'pedido-venta', 'pedido-venta.PagarAPlazos', N'Nuevo: pago a plazos',
 N'Este pedido se puede pagar a plazos. Pulse aquí: si el cliente tiene nuestra app le llega un aviso para terminar el pago; si no, le damos el enlace para mandárselo por WhatsApp. Aquí mismo verá cómo va.',
 NULL, @orden + 40, @novPlazos),
('NestoApp', '2.29.0', 'lista-pedidos-venta', 'lista-pedidos-venta.RetenidosPorFalta', N'Pedidos esperando su decisión',
 N'A estos pedidos «todo junto» les falta algo en el almacén. Tóquelo para decidir si sale ya con lo que hay o espera a estar completo. Si no decide antes del plazo, se espera.',
 NULL, @orden + 50, @novRetenidos);

INSERT INTO dbo.Globos (Aplicacion, VersionDesde, Pantalla, Ancla, Titulo, Texto, Grupos, FechaDesde, FechaHasta, Orden, NovedadId)
SELECT g.Aplicacion, g.VersionDesde, g.Pantalla, g.Ancla, g.Titulo, g.Texto, g.Grupos, @hoy, @fin, g.Orden, g.NovedadId
FROM @g g
WHERE NOT EXISTS (SELECT 1 FROM dbo.Globos x WHERE x.Aplicacion = g.Aplicacion AND x.Ancla = g.Ancla);
SELECT @@ROWCOUNT AS GlobosInsertadosAhora;

SELECT Id, Aplicacion, VersionDesde, Pantalla, Ancla, Orden, NovedadId, FechaDesde, FechaHasta, Activo FROM dbo.Globos
WHERE Aplicacion = 'NestoApp' ORDER BY Pantalla, Orden;
