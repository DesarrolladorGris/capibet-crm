# Maquetas Estáticas - Módulos de Ventas y Productos

Este directorio contiene las maquetas estáticas (UI/UX) para los módulos de Ventas y Productos del CRM.

## Archivos

### VentasMockup.tsx
Maqueta estática para el módulo de ventas que incluye:

- **Header con búsqueda y acciones**
- **Tarjetas de estadísticas** (Ventas del Mes, Transacciones, Ticket Promedio, Conversión)
- **Filtros y controles de vista** (Lista, Grid, Calendario)
- **Tabla de ventas** con información detallada
- **Vista de grid** con tarjetas de ventas
- **Vista de calendario** (placeholder)

### ProductosMockup.tsx
Maqueta estática para el módulo de productos que incluye:

- **Header con búsqueda y acciones**
- **Tarjetas de estadísticas** (Total Productos, Activos, Sin Stock, Valor Total)
- **Filtros por categoría** (Todas, Software, Servicios, Hardware, etc.)
- **Controles de vista** (Grid, Lista, Categorías)
- **Vista de grid** con tarjetas de productos
- **Vista de lista** con tabla detallada
- **Vista de categorías** con resumen por categoría

## Características de las Maquetas

### Diseño
- **Tema oscuro** consistente con BEAST CRM
- **Colores**: Esquema con acentos verdes (#00b894)
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Interactivo**: Hover effects y transiciones suaves

### Funcionalidades Simuladas
- **Filtros dinámicos** por estado, categoría, fecha
- **Búsqueda en tiempo real** (simulada)
- **Cambio de vista** entre diferentes layouts
- **Estadísticas en tiempo real** (datos mock)
- **Acciones de CRUD** (botones funcionales)

### Datos de Ejemplo
- **Ventas**: IDs, clientes, productos, cantidades, precios, fechas, estados
- **Productos**: IDs, nombres, categorías, precios, stock, estados, ventas
- **Estadísticas**: Métricas calculadas con indicadores de cambio

## Uso

Para usar estas maquetas en el desarrollo:

```tsx
import VentasMockup from './maquetas/VentasMockup';
import ProductosMockup from './maquetas/ProductosMockup';

// En tu componente
<VentasMockup />
<ProductosMockup />
```

## Notas de Desarrollo

- Las maquetas son completamente estáticas y no requieren backend
- Los datos son simulados para demostrar la funcionalidad
- El diseño es responsive y sigue las mejores prácticas de UX
- Los componentes están listos para ser integrados con datos reales
