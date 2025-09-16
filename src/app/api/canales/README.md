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
   - Los IDs deben ser números válidos
   - Los campos requeridos se validan en cada endpoint
   - `usuario_id` y `espacio_id` son obligatorios

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos.

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data` y `error`.

5. **Campos de Auditoría**: Los campos `creado_en`, `actualizado_en` y `creado_por` se manejan automáticamente por Supabase.

---

## 🚀 Uso en el Frontend

```typescript
// Ejemplo de uso en el frontend
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

const getCanales = async () => {
  const response = await fetch('/api/canales', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};

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

const deleteCanal = async (id: number) => {
  const response = await fetch(`/api/canales/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};
```

---

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único del canal |
| usuario_id | bigint | ID del usuario propietario |
| espacio_id | bigint | ID del espacio de trabajo |
| tipo | text | Tipo de canal (WhatsApp, Telegram, etc.) |
| descripcion | text | Descripción del canal |
| creado_en | timestamp | Fecha de creación |
| actualizado_en | timestamp | Fecha de última actualización |
| creado_por | bigint | ID del usuario que creó el canal |

---

*Documentación generada automáticamente - Última actualización: $(date)*
