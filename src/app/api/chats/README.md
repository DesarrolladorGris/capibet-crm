# API de Chats

Este módulo maneja las operaciones CRUD para la entidad `chats` en el sistema CRM.

## Estructura de Datos

### ChatData
```typescript
interface ChatData {
  id?: number;           // ID del chat (opcional para creación)
  sesion_id: number;     // ID de la sesión asociada
  contact_id: number;    // ID del contacto asociado
}
```

### ChatResponse
```typescript
interface ChatResponse {
  id: number;            // ID del chat
  sesion_id: number;     // ID de la sesión asociada
  contact_id: number;    // ID del contacto asociado
  created_at?: string;   // Fecha de creación (timestamp)
}
```

## Endpoints Disponibles

### GET /api/chats
Obtiene todos los chats del sistema.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sesion_id": 123,
      "contact_id": 456,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/chats
Crea un nuevo chat.

**Body:**
```json
{
  "sesion_id": 123,
  "contact_id": 456
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sesion_id": 123,
    "contact_id": 456,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/chats
Actualiza un chat existente.

**Body:**
```json
{
  "id": 1,
  "sesion_id": 124,
  "contact_id": 457
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sesion_id": 124,
    "contact_id": 457,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/chats?id={id}
Elimina un chat por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": undefined
}
```

### GET /api/chats/[id]
Obtiene un chat específico por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sesion_id": 123,
    "contact_id": 456,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/chats/[id]
Actualiza un chat específico por ID.

**Body:**
```json
{
  "sesion_id": 124,
  "contact_id": 457
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sesion_id": 124,
    "contact_id": 457,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/chats/[id]
Elimina un chat específico por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": undefined
}
```

## Códigos de Error

- `400`: Bad Request - Datos inválidos o faltantes
- `404`: Not Found - Chat no encontrado
- `500`: Internal Server Error - Error del servidor

## Ejemplos de Uso

### Crear un nuevo chat
```javascript
const response = await fetch('/api/chats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sesion_id: 123,
    contact_id: 456
  })
});

const result = await response.json();
```

### Obtener todos los chats
```javascript
const response = await fetch('/api/chats');
const result = await response.json();
```

### Actualizar un chat
```javascript
const response = await fetch('/api/chats/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sesion_id: 124,
    contact_id: 457
  })
});

const result = await response.json();
```

### Eliminar un chat
```javascript
const response = await fetch('/api/chats/1', {
  method: 'DELETE'
});

const result = await response.json();
```
