-- NestoApp#177: novedades de NestoApp en la tabla dbo.Novedades (Nesto#372).
-- Ejecutar a mano en la base de datos al publicar la versión (la app las lee de
-- GET api/Novedades?ambito=NestoApp, NestoApp#186).
-- REGLA DE ORO: lenguaje de usuario, nunca técnico. Solo cambios que el usuario percibe.
--
-- 2.27.0 (05/11/2026): minor (pantallas nuevas: Eventos y Envíos devueltos).
-- #268 Eventos en la app (Nesto#619; Sancho, Novedades 1021), #267 envío devuelto: ¿lo sigue queriendo?
-- (NestoAPI#699), #261 pedido y factura por WhatsApp (NestoAPI#737; sugerencias 866/867 de Nesto), #262 buscar
-- por código de barras (Nesto#582; sugerencia 908), #260 horario preferible (NestoAPI#763), #265 resumen del
-- vendedor en «Puede ofrecer» (NestoAPI#751), #263 «Sin contacto este mes» (Nesto#587; sugerencia 911),
-- #266/#207 detalle por producto de la fecha de entrega (Nesto#599, NestoAPI#577), #257 correo de los cursos
-- (NestoAPI#753; sugerencia 899), #255 P.O. obligatorio (NestoAPI#723), #264 avisos al grabar (NestoAPI#764),
-- #258 varias capturas (NestoAPI#754; sugerencia 900), #269 borrador y modo de entrega (Manuel, 1050),
-- #270/#271 alta de cliente (NestoAPI#821/#826), #256 pedido mínimo del cupón (NestoAPI#613).
-- Las sugerencias 866, 867, 899, 900, 908, 911 y 1021 son filas de Ambito 'Nesto' ya implementadas en Nesto:
-- aquí van filas propias de NestoApp (la app solo lee las suyas). La 1050 (Manuel, Ambito 'Nesto', Pendiente)
-- la decide Carlos en Novedades: aquí solo la fila de NestoApp.
-- Se puede ejecutar al publicar en Master: quien aún no la tiene la ve marcada como
-- «Aún no ha llegado a tu móvil».
-- Se puede ejecutar más de una vez: solo inserta las que falten.

INSERT INTO dbo.Novedades ([Version], Fecha, Categoria, Titulo, Descripcion, Ambito, Usuario)
SELECT '2.27.0', '2026-11-05', n.Categoria, n.Titulo, n.Descripcion, 'NestoApp', SUSER_SNAME()
FROM (VALUES
    (N'Nuevo', N'Eventos: los próximos, con sus plazas e inscritos',
     N'En el menú hay una entrada nueva, «Eventos»: los próximos cursos y eventos con su fecha, tienda u online, plazas libres y apuntados. Al tocar uno ves su ficha y la lista de inscritos (con «Solo mis clientes» marcado) y puedes inscribir a un cliente tuyo desde ahí: eliges el cliente, la modalidad, cuántas personas vienen y la forma de pago, y le mandas el enlace. Los eventos gratuitos también se pueden inscribir. Pasar lista y cobrar siguen en Nesto.'),
    (N'Nuevo', N'Envío devuelto: ¿el cliente lo sigue queriendo?',
     N'Cuando la agencia devuelve un envío (o lo deja en incidencia) te llega un aviso al móvil. Al tocarlo ves los datos del envío y el motivo de la agencia, y decides: «Sí, volver a enviar» (puedes corregir la dirección y los teléfonos; los portes del reenvío no se cobran salvo que lo marques) o «No, abonar». También están todos en el menú, en «Envíos devueltos». Si ya lo había decidido alguien, te lo dice.'),
    (N'Nuevo', N'Enviar el pedido o la factura por WhatsApp',
     N'En el pedido hay un botón «Enviar por WhatsApp» y en las facturas del extracto del cliente un icono de WhatsApp. Se abre WhatsApp con el móvil del cliente (si tiene varios, eliges) y un mensaje ya escrito con el enlace para descargar el documento, que dura 30 días. Solo tienes que pulsar enviar.'),
    (N'Nuevo', N'Buscar un producto por su código de barras',
     N'En el buscador de productos (en la plantilla y fuera de ella) puedes teclear o pegar el código de barras del envase: se abre el producto. Si varios productos comparten el código, eliges cuál.'),
    (N'Nuevo', N'Horario preferible de entrega del cliente',
     N'En el extracto del cliente ves y puedes editar su horario preferible de entrega (por ejemplo «L-V 10:00-14:00, 17:00-20:00; S 10:00-13:00»). Lo intentaremos respetar en nuestra ruta, pero sin compromiso; las agencias externas no lo ven.'),
    (N'Nuevo', N'«Puede ofrecer» te dice lo que ganas marcando ✓ y ✗',
     N'Arriba de las sugerencias de productos sale una frase con lo que has conseguido esta semana gracias a ellas (productos añadidos y ventas). Al tocarla ves el detalle de las últimas semanas. Cuanto más marques ✓ o ✗, más acierta con tus clientes. Solo ves lo tuyo.'),
    (N'Mejorado', N'Clientes para contactar: «Sin contacto este mes»',
     N'En la lista de «Llamar», los clientes con los que nadie ha hablado desde el día 1 del mes llevan la marca «Sin contacto este mes», para que no se te pase ninguno.'),
    (N'Mejorado', N'Por qué el pedido se queda en «Todo junto» y cuándo llega cada cosa',
     N'Bajo la fecha de entrega a la agencia (en la plantilla y en el pedido) hay un «Ver detalle por producto»: qué unidades salen desmontando un kit, cuáles vienen de Reina o Alcobendas con la reposición (y qué día llegan y pueden salir), cuáles del proveedor y cuáles no tienen fecha. Así sabes qué decirle al cliente sin preguntar a nadie.'),
    (N'Mejorado', N'Cursos: te preguntamos si se manda el correo al cliente',
     N'Al guardar un pedido con cursos te preguntamos si le mandamos al cliente el correo de sus cursos. El correo va según la forma de pago del pedido: con transferencia lleva la cuenta, el concepto y el importe; con efectivo le dice que lo paga en la tienda; con tarjeta, el enlace de pago.'),
    (N'Mejorado', N'Clientes que exigen su número de pedido (P.O.)',
     N'Si el cliente tiene marcado que exige el P.O. en todos sus pedidos, el campo «Su pedido / P.O.» sale resaltado como obligatorio y te avisamos de que sin él no se podrá grabar el pedido.'),
    (N'Mejorado', N'Avisos al grabar el pedido',
     N'Tras crear o modificar un pedido te enseñamos los avisos que haya, por ejemplo que el cliente cierra el día que le toca el reparto por nuestra ruta: así puedes mandarlo por agencia o cambiar el día.'),
    (N'Mejorado', N'Varias capturas en sugerencias, avisos y comentarios',
     N'En «Sugerir una mejora», «Algo no funciona» y los comentarios de las novedades puedes adjuntar hasta 10 capturas (de la galería, varias de una vez, o pegadas), con miniatura y «Quitar» en cada una. Y se ven todas las capturas de cada sugerencia y comentario.'),
    (N'Corregido', N'El modo de entrega elegido se respeta al recuperar un borrador',
     N'Si habías elegido el modo de entrega a mano, lo guardabas en un borrador y lo recuperabas, al llegar al resumen la recomendación del sistema podía cambiarlo sin avisar. Ahora el borrador recuerda que lo elegiste tú y se queda como lo dejaste (y si deja de tener sentido, te avisamos como siempre).'),
    (N'Mejorado', N'Alta de cliente: códigos postales nuevos y direcciones del extranjero',
     N'Al dar de alta un cliente eligiendo la dirección en el buscador de Google, un código postal que aún no teníamos se da de alta solo con la población y la provincia de Google (antes el alta fallaba). Y las direcciones de otros países quedan con el formato de su país (por ejemplo «12 Rue de la Paix»).'),
    (N'Mejorado', N'Cupones: el pedido mínimo es el de cada evento',
     N'La condición del cupón en la plantilla ya dice el pedido mínimo que fija cada evento (puede no haber mínimo), en vez de calcularlo la app.')
) AS n (Categoria, Titulo, Descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Novedades x
    WHERE x.Ambito = 'NestoApp' AND x.[Version] = '2.27.0' AND x.Titulo = n.Titulo
);

-- Comprobación: 15 filas nuevas.
SELECT Id, [Version], Categoria, Titulo, Ambito, Estado
FROM dbo.Novedades
WHERE Ambito = 'NestoApp' AND [Version] = '2.27.0'
ORDER BY Id;
