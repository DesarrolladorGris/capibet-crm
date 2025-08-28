# 🚀 Instrucciones Rápidas - Respuestas Rápidas

## ✅ **Ya está funcionando**
- Interfaz completa con datos de ejemplo
- Puedes crear, editar, eliminar y buscar respuestas
- Categorías predefinidas y personalizadas
- Estadísticas en tiempo real

## 🔧 **Para conectar a base de datos real**

### 1. **Ejecutar SQL en Supabase**
```sql
-- Copiar y pegar en Supabase SQL Editor
-- El archivo DATABASE_RESPUESTAS_RAPIDAS.sql tiene el código completo
```

### 2. **Activar conexión real**
- Ir a `RespuestasRapidasTab.tsx`
- Descomentar línea: `import { supabaseService } from '@/services/supabaseService';`
- Comentar línea: `// Usar datos de prueba por ahora`

### 3. **Verificar variables de entorno**
- `.env.local` debe tener las credenciales de Supabase

## 🎯 **Uso básico**
1. **Dashboard** → **Configuración** → **Respuestas Rápidas**
2. **Crear**: Botón "Nueva Respuesta"
3. **Editar**: ✏️ en la fila
4. **Eliminar**: 🗑️ en la fila
5. **Buscar**: Campo de búsqueda
6. **Categorías**: Botón "+" para agregar nuevas

## 💡 **Características especiales**
- **Búsqueda inteligente**: Por título, contenido y categoría
- **Categorías dinámicas**: Agregar nuevas categorías al vuelo
- **Estadísticas**: Contadores en tiempo real
- **Estado activo/inactivo**: Toggle para cada respuesta

---
*Instrucciones simplificadas para desarrolladores*
