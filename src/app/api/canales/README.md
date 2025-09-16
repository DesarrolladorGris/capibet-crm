# API de Canales - Documentación

Esta API proporciona endpoints para la gestión completa de canales en el sistema CRM. Todos los endpoints están implementados siguiendo el patrón DDD (Domain-Driven Design) y se conectan directamente con Supabase.

## 📁 Estructura del Proyecto

```
src/app/api/canales/
├── domain/
│   └── canal.ts           # Interfaces y tipos del dominio
├── [id]/
│   └── route.ts           # GET, PATCH, DELETE por ID
├── route.ts               # GET todos, POST crear
├── utils/
│   ├── getHeaders.ts      # Utilidades para headers
│   ├── handleResponse.ts  # Manejo de respuestas
│   └── index.ts          # Exportaciones
└── README.md              # Esta documentación
```

## 🔗 Endpoints Disponibles

### 1. **POST** `/api/canales` - Crear Canal

Crea un nuevo canal en el sistema.

**Request Body:**
```json
{
  "usuario_id": 1,
  "espacio_id": 1,
  "tipo": "WhatsApp",
  "descripcion": "Canal principal de WhatsApp",
  "creado_por": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "espacio_id": 1,
    "tipo": "WhatsApp",
    "descripcion": "Canal principal de WhatsApp",
    "creado_en": "2024-01-15T10:30:00Z",
    "actualizado_en": "2024-01-15T10:30:00Z",
    "creado_por": 1
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Error del servidor: 400 Bad Request",
  "details": "Datos de canal inválidos"
}
```

---

### 2. **GET** `/api/canales` - Obtener Todos los Canales

Retorna una lista de todos los canales registrados.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "espacio_id": 1,
      "tipo": "WhatsApp",
      "descripcion": "Canal principal de WhatsApp",
      "creado_en": "2024-01-15T10:30:00Z",
      "actualizado_en": "2024-01-15T10:30:00Z",
      "creado_por": 1
    }
  ]
}
```

---

### 3. **GET** `/api/canales/[id]` - Obtener Canal por ID

Retorna los datos de un canal específico.

**Parámetros:**
- `id` (number): ID del canal

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "espacio_id": 1,
    "tipo": "WhatsApp",
    "descripcion": "Canal principal de WhatsApp",
    "creado_en": "2024-01-15T10:30:00Z",
    "actualizado_en": "2024-01-15T10:30:00Z",
    "creado_por": 1
  }
}
```

**Response (404):**
```json
{
  "success": true,
  "data": null
}
```

---

### 4. **PATCH** `/api/canales/[id]` - Actualizar Canal

Actualiza los datos de un canal existente.

**Parámetros:**
- `id` (number): ID del canal

**Request Body:**
```json
{
  "tipo": "Telegram",
  "descripcion": "Canal principal de Telegram"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "espacio_id": 1,
    "tipo": "Telegram",
    "descripcion": "Canal principal de Telegram",
    "creado_en": "2024-01-15T10:30:00Z",
    "actualizado_en": "2024-01-15T11:45:00Z",
    "creado_por": 1
  }
}
```

---

### 5. **DELETE** `/api/canales/[id]` - Eliminar Canal

Elimina un canal del sistema.

**Parámetros:**
- `id` (number): ID del canal

**Response (200):**
```json
{
  "success": true,
  "data": undefined
}
```

---

## 🔧 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error en la petición (datos inválidos) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación con Supabase usando service role key.

2. **Validaciones**: 
   - Los IDs deben ser números válidos (validación con `isNaN(Number(id))`)
   - Los campos requeridos se validan en cada endpoint
   - `usuario_id`, `espacio_id`, `tipo`, `descripcion` y `creado_por` son obligatorios al crear un canal

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos:
   - Errores de validación (400)
   - Errores de servidor (500)

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data`, `error` y `details` opcional.

5. **Campos de Auditoría**: Los campos `creado_en`, `actualizado_en` y `creado_por` se manejan automáticamente por Supabase.

6. **Campos Opcionales**:
   - `id` es opcional en creación (se genera automáticamente)

---

## 📋 Tipos de Datos

### CanalData (Para creación)
```typescript
interface CanalData {
  id?: number;                    // Opcional, se genera automáticamente
  usuario_id: number;             // Requerido
  espacio_id: number;             // Requerido
  tipo: string;                   // Requerido
  descripcion: string;            // Requerido
  creado_por: number;             // Requerido
}
```

### CanalResponse (Respuesta de la API)
```typescript
interface CanalResponse {
  id: number;                     // Siempre presente
  usuario_id: number;
  espacio_id: number;
  tipo: string;
  descripcion: string;
  creado_en: string;              // Siempre presente
  actualizado_en: string;         // Siempre presente
  creado_por: number;             // Siempre presente
}
```

### ApiResponse
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
```

---

## 🚀 Uso en el Frontend

```typescript
// Tipos de datos (importar desde el dominio)
import { CanalData, CanalResponse } from './domain/canal';

// Crear canal
const createCanal = async (canalData: CanalData) => {
  const response = await fetch('/api/canales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(canalData),
  });
  
  return await response.json();
};

// Obtener todos los canales
const getCanales = async (): Promise<CanalResponse[]> => {
  const response = await fetch('/api/canales');
  const result = await response.json();
  return result.data || [];
};

// Obtener canal por ID
const getCanalById = async (id: number): Promise<CanalResponse | null> => {
  const response = await fetch(`/api/canales/${id}`);
  const result = await response.json();
  return result.data;
};

// Actualizar canal
const updateCanal = async (id: number, canalData: Partial<CanalData>) => {
  const response = await fetch(`/api/canales/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(canalData),
  });
  
  return await response.json();
};

// Eliminar canal
const deleteCanal = async (id: number) => {
  const response = await fetch(`/api/canales/${id}`, {
    method: 'DELETE',
  });
  
  return await response.json();
};
```

---

## ⚠️ Errores Comunes

### 400 Bad Request
- **ID inválido**: `"ID de canal inválido"` - El ID debe ser un número válido
- **Datos faltantes**: `"Datos de canal inválidos"` - Faltan campos requeridos
- **Error del servidor**: `"Error del servidor: [código] [mensaje]"` - Error específico de Supabase

### 500 Internal Server Error
- **Error de conexión**: `"Error de conexión al [operación]"` - Problemas de conectividad con Supabase
- **Error del servidor**: `"Error del servidor: [código] [mensaje]"` - Error específico de Supabase

---

*Documentación actualizada - Última actualización: Diciembre 2024*
