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

1. **Actualizar el número de versión** en estos 4 ficheros (los 3 del bundle web + el nativo):
   - `package.json`
   - `config.xml`
   - `src/app/components/configuracion/configuracion.component.ts` (constante `Configuracion.VERSION`)
   - `android/app/build.gradle` (`versionName` y `versionCode`). El `versionCode` es entero, conviene usar `MAJOR*10000 + MINOR*100 + PATCH` (ej: `21703` para 2.17.3). Si solo se publica un bundle web por Live Updates y los binarios no cambian, este fichero **no hace falta** subirlo. Solo cuando se vaya a generar APK release nuevo.

2. **Actualizar el changelog** en `src/app/components/profile/profile/profile.component.html`:
   - Los nuevos `<ion-item>` se añaden **arriba** de la lista (justo después del `<h1>Hola...`)
   - Se quitan los últimos `<ion-item>` (los de abajo) para mantener entre 6 y 10 entradas
   - El contenido debe describir las funcionalidades nuevas visibles para el usuario (ej: portes, mensajes de Ganavisiones, PDF con imágenes), no cambios internos como migraciones o fixes de build

## Build local de APK release firmado (WSL2)

Requisitos (una sola vez):
- JDK 21 en `/usr/lib/jvm/java-21-openjdk-amd64` (Capacitor 8 lo exige por `@capacitor/filesystem`)
- Android SDK en `~/Android` con `build-tools/29.0.2/apksigner` y `platforms` android-26+
- WSL2 con al menos 5 GB de RAM (configurar `.wslconfig` en Windows)
- Keystore en `/mnt/c/Users/Usuario/OneDrive - NUEVA VISION/Escritorio/my-release-key.keystore` (alias `nestoapp`)
- `scripts/local-env.sh` que exporta JAVA_HOME, ANDROID_HOME, PATH y nvm 22 (no se commitea, está en .gitignore)

Pasos para generar APK release firmado:

```bash
source scripts/local-env.sh
npx ng build
npx cap sync android
cd android && ./gradlew assembleRelease

# Firmar con apksigner (la contraseña del keystore va inline; pedírsela a Carlos)
/home/carlos/Android/build-tools/29.0.2/apksigner sign \
  --ks "/mnt/c/Users/Usuario/OneDrive - NUEVA VISION/Escritorio/my-release-key.keystore" \
  --ks-key-alias nestoapp \
  --ks-pass pass:<contraseña> \
  --key-pass pass:<contraseña> \
  --out app/build/outputs/apk/release/NestoApp-<version>-<canal>.apk \
  app/build/outputs/apk/release/app-release-unsigned.apk
```

### Canales Master vs Production en `capacitor.config.ts`

El campo `LiveUpdates.channel` se compila DENTRO del APK. Lo que decide a qué canal se suscribe cada dispositivo es el APK que tiene instalado, no el bundle. Entonces:
- APK con `channel: 'Master'` → tu móvil (recibe builds desde push a master de git)
- APK con `channel: 'Production'` → vendedores (recibe builds promocionados manualmente desde la UI de AppFlow)

Para construir los dos APKs hay que cambiar el canal en `capacitor.config.ts` antes de cada build, hacer `cap sync` y `gradlew assembleRelease`. El cambio de canal NO se commitea — el repo siempre tiene `channel: 'Master'` por defecto.

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
