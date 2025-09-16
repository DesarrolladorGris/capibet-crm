# API de Mensajes

Este módulo proporciona endpoints para el manejo de mensajes en el sistema CRM.

## Estructura de Datos

### MensajeData
```typescript
interface MensajeData {
  id?: number;
  canal_id: number;
  remitente_id: number;
  contenido: string;
  contacto_id: number;
  sesion_id: number;
  destinatario_id: number;
  embudo_id: number;
  creado_en?: string;
}
```

### MensajeResponse
```typescript
interface MensajeResponse {
  id: number;
  canal_id: number;
  remitente_id: number;
  contenido: string;
  contacto_id: number;
  sesion_id: number;
  destinatario_id: number;
  embudo_id: number;
  creado_en: string;
}
```

## Endpoints

### POST /api/mensajes
Crear un nuevo mensaje.

**Body:**
```json
{
  "canal_id": 1,
  "remitente_id": 2,
  "contenido": "Hola, ¿cómo estás?",
  "contacto_id": 3,
  "sesion_id": 4,
  "destinatario_id": 5,
  "embudo_id": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "remitente_id": 2,
    "contenido": "Hola, ¿cómo estás?",
    "contacto_id": 3,
    "sesion_id": 4,
    "destinatario_id": 5,
    "embudo_id": 6,
    "creado_en": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/mensajes
Obtener todos los mensajes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "canal_id": 1,
      "remitente_id": 2,
      "contenido": "Hola, ¿cómo estás?",
      "contacto_id": 3,
      "sesion_id": 4,
      "destinatario_id": 5,
      "embudo_id": 6,
      "creado_en": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/mensajes/[id]
Obtener un mensaje específico por ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "remitente_id": 2,
    "contenido": "Hola, ¿cómo estás?",
    "contacto_id": 3,
    "sesion_id": 4,
    "destinatario_id": 5,
    "embudo_id": 6,
    "creado_en": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/mensajes/[id]
Actualizar un mensaje existente.

**Body:**
```json
{
  "contenido": "Mensaje actualizado"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "remitente_id": 2,
    "contenido": "Mensaje actualizado",
    "contacto_id": 3,
    "sesion_id": 4,
    "destinatario_id": 5,
    "embudo_id": 6,
    "creado_en": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/mensajes/[id]
Eliminar un mensaje.

**Response:**
```json
{
  "success": true,
  "data": undefined
}
```

## Validaciones

- Todos los campos son requeridos al crear un mensaje: `canal_id`, `remitente_id`, `contenido`, `contacto_id`, `sesion_id`, `destinatario_id`, `embudo_id`
- El campo `creado_en` se establece automáticamente si no se proporciona
- El ID debe ser un número válido para operaciones de actualización y eliminación

## Manejo de Errores

Todos los endpoints devuelven respuestas consistentes:

```json
{
  "success": false,
  "error": "Descripción del error",
  "details": "Detalles adicionales del error"
}
```

Los códigos de estado HTTP estándar se utilizan para indicar el tipo de error:
- 400: Bad Request (datos inválidos)
- 404: Not Found (recurso no encontrado)
- 500: Internal Server Error (error del servidor)
