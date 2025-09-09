# API de Respuestas Rápidas - Documentación

Esta API proporciona endpoints para la gestión completa de respuestas rápidas en el sistema CRM. Todos los endpoints están implementados siguiendo el patrón DDD (Domain-Driven Design) y se conectan directamente con Supabase.

## 📁 Estructura del Proyecto

```
src/app/api/respuestas_rapidas/
├── domain/
│   └── respuesta_rapida.ts      # Interfaces y tipos del dominio
├── [id]/
│   ├── route.ts                 # GET, PATCH, DELETE por ID
│   └── toggle-status/
│       └── route.ts             # PATCH para cambiar estado
├── utils/
│   ├── getHeaders.ts            # Configuración de headers
│   ├── handleResponse.ts        # Manejo de respuestas
│   └── index.ts                 # Exportaciones
├── route.ts                     # GET todos, POST crear
└── README.md                    # Esta documentación
```

## 🔗 Endpoints Disponibles

### 1. **POST** `/api/respuestas-rapidas` - Crear Respuesta Rápida

Crea una nueva respuesta rápida en el sistema.

**Request Body:**
```json
{
  "titulo": "Saludo de bienvenida",
  "contenido": "¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?",
  "categoria": "Saludos"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Saludo de bienvenida",
    "contenido": "¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?",
    "categoria": "Saludos",
    "activa": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Título y contenido son campos requeridos"
}
```

---

### 2. **GET** `/api/respuestas-rapidas` - Obtener Todas las Respuestas Rápidas

Retorna una lista de todas las respuestas rápidas registradas, ordenadas por fecha de creación descendente.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Saludo de bienvenida",
      "contenido": "¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?",
      "categoria": "Saludos",
      "activa": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "titulo": "Despedida cordial",
      "contenido": "Gracias por contactarnos. ¡Que tengas un excelente día!",
      "categoria": "Despedidas",
      "activa": true,
      "created_at": "2024-01-14T15:20:00Z"
    }
  ]
}
```

---

### 3. **GET** `/api/respuestas-rapidas/[id]` - Obtener Respuesta Rápida por ID

Retorna los datos de una respuesta rápida específica.

**Parámetros:**
- `id` (number): ID de la respuesta rápida

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Saludo de bienvenida",
    "contenido": "¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte hoy?",
    "categoria": "Saludos",
    "activa": true,
    "created_at": "2024-01-15T10:30:00Z"
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

### 4. **PATCH** `/api/respuestas-rapidas/[id]` - Actualizar Respuesta Rápida

Actualiza los datos de una respuesta rápida existente.

**Parámetros:**
- `id` (number): ID de la respuesta rápida

**Request Body:**
```json
{
  "titulo": "Saludo personalizado",
  "contenido": "¡Hola! Gracias por elegirnos. ¿Cómo podemos ayudarte hoy?",
  "categoria": "Personalizado"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Saludo personalizado",
    "contenido": "¡Hola! Gracias por elegirnos. ¿Cómo podemos ayudarte hoy?",
    "categoria": "Personalizado",
    "activa": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. **DELETE** `/api/respuestas-rapidas/[id]` - Eliminar Respuesta Rápida

Elimina una respuesta rápida del sistema.

**Parámetros:**
- `id` (number): ID de la respuesta rápida

**Response (200):**
```json
{
  "success": true,
  "data": undefined
}
```

---

### 6. **PATCH** `/api/respuestas-rapidas/[id]/toggle-status` - Cambiar Estado de la Respuesta Rápida

Activa o desactiva una respuesta rápida.

**Parámetros:**
- `id` (number): ID de la respuesta rápida

**Request Body:**
```json
{
  "activa": false
}
```

**Response (200) - Desactivación:**
```json
{
  "success": true,
  "message": "Respuesta rápida desactivada exitosamente"
}
```

**Response (200) - Activación:**
```json
{
  "success": true,
  "message": "Respuesta rápida activada exitosamente"
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
   - Los campos `titulo` y `contenido` son requeridos para crear respuestas rápidas
   - Los IDs deben ser números válidos
   - El campo `categoria` es opcional y por defecto se asigna "General"
   - El campo `activa` se establece automáticamente como `true` al crear

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos.

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data` y `error`.

5. **Ordenamiento**: Las respuestas rápidas se ordenan por fecha de creación descendente por defecto.

---

## 🚀 Uso en el Frontend

```typescript
// Ejemplo de uso en el frontend
const createRespuestaRapida = async (respuestaData: RespuestaRapidaFormData) => {
  const response = await fetch('/api/respuestas-rapidas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(respuestaData),
  });
  
  return await response.json();
};

const getRespuestasRapidas = async () => {
  const response = await fetch('/api/respuestas-rapidas');
  return await response.json();
};

const updateRespuestaRapida = async (id: number, data: Partial<RespuestaRapidaData>) => {
  const response = await fetch(`/api/respuestas-rapidas/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  return await response.json();
};

const toggleRespuestaRapidaStatus = async (id: number, activa: boolean) => {
  const response = await fetch(`/api/respuestas-rapidas/${id}/toggle-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activa }),
  });
  
  return await response.json();
};
```

---

## 🏗️ Estructura de Datos

### RespuestaRapidaData (Para crear/actualizar)
```typescript
interface RespuestaRapidaData {
  id?: number;
  titulo: string;
  contenido: string;
  categoria?: string;
  activa?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### RespuestaRapidaResponse (Respuesta del servidor)
```typescript
interface RespuestaRapidaResponse {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at: string;
  updated_at?: string;
}
```

### RespuestaRapidaFormData (Para formularios)
```typescript
interface RespuestaRapidaFormData {
  titulo: string;
  contenido: string;
  categoria?: string;
}
```

---

*Documentación generada automáticamente - Última actualización: $(date)*
