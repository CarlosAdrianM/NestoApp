# NestoApp - Notas del Proyecto

## Descripción
Aplicación móvil Ionic/Angular para gestión de ventas y pedidos.

## Repositorios Relacionados

### NestoAPI (Backend)
- **URL:** https://github.com/CarlosAdrianM/NestoAPI
- **Uso:** Consultar endpoints, DTOs y lógica de negocio del servidor
- **Tecnología:** ASP.NET Core Web API

### Nesto (Cliente Desktop)
- **URL:** https://github.com/CarlosAdrianM/Nesto
- **Uso:** Referencia de implementación. Si hay dudas sobre cómo implementar algo en NestoApp, mirar primero cómo está hecho en Nesto
- **Tecnología:** WPF (Windows Presentation Foundation)

## Sistema Ganavisiones (Issue #75)

### Concepto
- 1 Ganavision = 10 EUR de base imponible bonificable (truncado)
- Base imponible bonificable = suma de líneas de grupos COS, ACC, PEL

### Endpoints API
```
GET  /api/Ganavisiones/ProductosBonificables
POST /api/PedidosVenta/ValidarServirJunto
```
> El endpoint antiguo `POST /api/Ganavisiones/ValidarServirJunto` está marcado `[Obsolete]` en NestoAPI. Usar el canónico, que además detecta muestras MMP vía `LineasPedido` (NestoAPI#161, NestoApp#112).

### Referencias de implementación
- NestoAPI#94 - Backend de Ganavisiones
- Nesto#281 - Frontend WPF de Ganavisiones (usar como referencia)
- NestoApp#75 - Este issue

## Estructura del Proyecto

### Componentes principales
- `plantilla-venta/` - Wizard de creación de pedidos (5 slides)
- `selector-plantilla-venta/` - Selección de productos
- `selector-direcciones-entrega/` - Direcciones de entrega
- `selector-formas-pago/` - Formas de pago
- `selector-plazos-pago/` - Plazos de pago

## Antes de hacer push

Siempre que se vaya a hacer push, hay que:

1. **Actualizar el número de versión** en estos 3 ficheros:
   - `package.json`
   - `config.xml`
   - `src/app/components/configuracion/configuracion.component.ts` (constante `Configuracion.VERSION`)

2. **Actualizar el changelog** en `src/app/components/profile/profile/profile.component.html`:
   - Los nuevos `<ion-item>` se añaden **arriba** de la lista (justo después del `<h1>Hola...`)
   - Se quitan los últimos `<ion-item>` (los de abajo) para mantener entre 6 y 10 entradas
   - El contenido debe describir las funcionalidades nuevas visibles para el usuario (ej: portes, mensajes de Ganavisiones, PDF con imágenes), no cambios internos como migraciones o fixes de build

## Reglas Ionic 8

### Controles en ion-item
`ion-select`, `ion-toggle` e `ion-checkbox` dentro de `ion-item` **requieren `slot="end"`** para alinearse a la derecha. En Ionic 5 era automático, en Ionic 8 no.

`ion-input` e `ion-textarea` **NO usan `slot="end"`** (los empuja demasiado lejos del label).

```html
<!-- CORRECTO -->
<ion-item>
  <ion-label>Etiqueta</ion-label>
  <ion-toggle slot="end" [(ngModel)]="valor"></ion-toggle>
</ion-item>

<!-- INCORRECTO (se centra en vez de ir a la derecha) -->
<ion-item>
  <ion-label>Etiqueta</ion-label>
  <ion-toggle [(ngModel)]="valor"></ion-toggle>
</ion-item>
```

### Swiper y position:fixed
`<swiper-container>` usa `transform: translate3d()` que rompe `position: fixed` en cualquier elemento hijo. **No usar FABs flotantes dentro de slides.** Usar botones inline en su lugar.

### No cambiar la paleta de colores
Los colores de Ionic por defecto (azul=primary, verde=success, rojo=danger) están asociados a funciones para los vendedores. No cambiarlos.

## Comandos útiles

```bash
# Desarrollo
ionic serve

# Build
ionic build

# Android
ionic capacitor run android
```
