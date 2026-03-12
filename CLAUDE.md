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
POST /api/Ganavisiones/ValidarServirJunto
```

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
   - Añadir las nuevas características/correcciones
   - Quitar las más antiguas para que la lista tenga siempre entre 6 y 10 entradas

## Comandos útiles

```bash
# Desarrollo
ionic serve

# Build
ionic build

# Android
ionic capacitor run android
```
