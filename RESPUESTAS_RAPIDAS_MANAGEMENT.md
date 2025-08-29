# 💬 Módulo de Respuestas Rápidas - Beast CRM

## 🎯 **¿Qué hace?**
Sistema para crear y gestionar respuestas predefinidas para el soporte al cliente.

## 🚀 **Cómo usar**

### 1. **Acceder**
- Dashboard → Configuración → **Respuestas Rápidas**

### 2. **Crear respuesta**
- Clic en "Nueva Respuesta"
- Título (obligatorio)
- Categoría (seleccionar o crear nueva)
- Contenido (obligatorio)
- Guardar

### 3. **Gestionar**
- **Editar**: ✏️ en la fila
- **Eliminar**: 🗑️ en la fila  
- **Buscar**: Campo de búsqueda
- **Activar/Desactivar**: Toggle switch

## 🏷️ **Categorías predefinidas**
- General, Soporte, Marketing, Cuenta
- Pagos, Juegos, Promociones, Técnico
- **Nuevas**: Botón "+" para agregar categorías personalizadas

## 📊 **Estadísticas**
- Total de respuestas
- Respuestas activas/inactivas
- Número de categorías

## ⚠️ **Estado**
- ✅ **Funciona**: Interfaz completa con datos de ejemplo
- 🔄 **Pendiente**: Conexión a base de datos real

## 📁 **Archivos principales**
- `RespuestasRapidasTab.tsx` - Componente principal
- `supabaseService.ts` - Servicios de API
- `supabase.ts` - Configuración
- `DATABASE_RESPUESTAS_RAPIDAS.sql` - SQL para crear tabla

---
*Documentación simplificada para uso interno*
