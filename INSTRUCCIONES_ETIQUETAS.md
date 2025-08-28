# 🚀 Instrucciones Rápidas - Módulo de Etiquetas

## ✅ **Ya está funcionando**
- Interfaz completa con datos de ejemplo
- Puedes crear, editar, eliminar y buscar etiquetas
- Colores predefinidos y personalizados

## 🔧 **Para conectar a base de datos real**

### 1. **Ejecutar SQL en Supabase**
```sql
-- Copiar y pegar en Supabase SQL Editor
-- El archivo DATABASE_ETIQUETAS.sql tiene el código completo
```

### 2. **Activar conexión real**
- Ir a `EtiquetasTab.tsx`
- Descomentar línea: `import { supabaseService } from '@/services/supabaseService';`
- Comentar línea: `// Usar datos de prueba por ahora`

### 3. **Verificar variables de entorno**
- `.env.local` debe tener las credenciales de Supabase

## 🎯 **Uso básico**
1. **Dashboard** → **Configuración** → **Etiquetas**
2. **Crear**: Botón "Nueva Etiqueta"
3. **Editar**: ✏️ en la fila
4. **Eliminar**: 🗑️ en la fila
5. **Buscar**: Campo de búsqueda

---
*Instrucciones simplificadas para desarrolladores*
