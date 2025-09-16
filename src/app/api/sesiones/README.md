# API de Sesiones - Documentación

Esta API proporciona endpoints para la gestión completa de sesiones en el sistema CRM. Todos los endpoints están implementados siguiendo el patrón DDD (Domain-Driven Design) y se conectan directamente con Supabase.

## 📁 Estructura del Proyecto

```
src/app/api/sesiones/
├── domain/
│   └── sesion.ts          # Interfaces y tipos del dominio
├── [id]/
│   └── route.ts           # GET, PATCH, DELETE por ID
├── utils/
│   ├── getHeaders.ts      # Headers para peticiones a Supabase
│   ├── handleResponse.ts  # Manejo de respuestas
│   └── index.ts          # Exportaciones de utils
├── route.ts               # GET todos, POST crear
└── README.md              # Esta documentación
```

## 🔗 Endpoints Disponibles

### 1. **POST** `/api/sesiones` - Crear Sesión

Crea una nueva sesión en el sistema.

**Request Body:**
```json
{
  "canal_id": 1,
  "usuario_id": 1,
  "nombre": "Sesión WhatsApp Principal",
  "api_key": "api_key_123",
  "access_token": "access_token_456",
  "phone_number": "+1234567890",
  "email_user": "usuario@ejemplo.com",
  "email_password": "password123",
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "imap_host": "imap.gmail.com",
  "imap_port": 993,
  "estado": "Activo",
  "creado_por": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "usuario_id": 1,
    "nombre": "Sesión WhatsApp Principal",
    "api_key": "api_key_123",
    "access_token": "access_token_456",
    "phone_number": "+1234567890",
    "email_user": "usuario@ejemplo.com",
    "email_password": "password123",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "imap_host": "imap.gmail.com",
    "imap_port": 993,
    "estado": "Activo",
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
  "details": "Datos de sesión inválidos"
}
```

---

### 2. **GET** `/api/sesiones` - Obtener Todas las Sesiones

Retorna una lista de todas las sesiones registradas.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "canal_id": 1,
      "usuario_id": 1,
      "nombre": "Sesión WhatsApp Principal",
      "api_key": "api_key_123",
      "access_token": "access_token_456",
      "phone_number": "+1234567890",
      "email_user": "usuario@ejemplo.com",
      "email_password": "password123",
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "imap_host": "imap.gmail.com",
      "imap_port": 993,
      "estado": "Activo",
      "creado_en": "2024-01-15T10:30:00Z",
      "actualizado_en": "2024-01-15T10:30:00Z",
      "creado_por": 1
    }
  ]
}
```

---

### 3. **GET** `/api/sesiones/[id]` - Obtener Sesión por ID

Retorna los datos de una sesión específica.

**Parámetros:**
- `id` (number): ID de la sesión

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "usuario_id": 1,
    "nombre": "Sesión WhatsApp Principal",
    "api_key": "api_key_123",
    "access_token": "access_token_456",
    "phone_number": "+1234567890",
    "email_user": "usuario@ejemplo.com",
    "email_password": "password123",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "imap_host": "imap.gmail.com",
    "imap_port": 993,
    "estado": "Activo",
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

### 4. **PATCH** `/api/sesiones/[id]` - Actualizar Sesión

Actualiza los datos de una sesión existente.

**Parámetros:**
- `id` (number): ID de la sesión

**Request Body:**
```json
{
  "nombre": "Sesión WhatsApp Actualizada",
  "estado": "Inactivo",
  "phone_number": "+0987654321"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "canal_id": 1,
    "usuario_id": 1,
    "nombre": "Sesión WhatsApp Actualizada",
    "api_key": "api_key_123",
    "access_token": "access_token_456",
    "phone_number": "+0987654321",
    "email_user": "usuario@ejemplo.com",
    "email_password": "password123",
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "imap_host": "imap.gmail.com",
    "imap_port": 993,
    "estado": "Inactivo",
    "creado_en": "2024-01-15T10:30:00Z",
    "actualizado_en": "2024-01-15T11:45:00Z",
    "creado_por": 1
  }
}
```

---

### 5. **DELETE** `/api/sesiones/[id]` - Eliminar Sesión

Elimina una sesión del sistema.

**Parámetros:**
- `id` (number): ID de la sesión

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
   - `canal_id`, `usuario_id` y `nombre` son obligatorios

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos.

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data` y `error`.

5. **Campos de Auditoría**: Los campos `creado_en`, `actualizado_en` y `creado_por` se manejan automáticamente por Supabase.

6. **Seguridad**: Los campos sensibles como `api_key`, `access_token`, `email_password` deben manejarse con cuidado en producción.

---

## 🚀 Uso en el Frontend

```typescript
// Ejemplo de uso en el frontend
const createSesion = async (sesionData: SesionData) => {
  const response = await fetch('/api/sesiones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sesionData),
  });
  
  return await response.json();
};

const getSesiones = async () => {
  const response = await fetch('/api/sesiones', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};

const updateSesion = async (id: number, sesionData: Partial<SesionData>) => {
  const response = await fetch(`/api/sesiones/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sesionData),
  });
  
  return await response.json();
};

const deleteSesion = async (id: number) => {
  const response = await fetch(`/api/sesiones/${id}`, {
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
| id | bigint | Identificador único de la sesión |
| canal_id | bigint | ID del canal asociado |
| usuario_id | bigint | ID del usuario propietario |
| nombre | varchar | Nombre descriptivo de la sesión |
| api_key | text | Clave API para servicios externos |
| access_token | text | Token de acceso para autenticación |
| phone_number | text | Número de teléfono asociado |
| email_user | text | Usuario de email |
| email_password | text | Contraseña del email |
| smtp_host | text | Host del servidor SMTP |
| smtp_port | integer | Puerto del servidor SMTP |
| imap_host | text | Host del servidor IMAP |
| imap_port | integer | Puerto del servidor IMAP |
| estado | varchar | Estado de la sesión (Activo/Inactivo) |
| creado_en | timestamp | Fecha de creación |
| actualizado_en | timestamp | Fecha de última actualización |
| creado_por | bigint | ID del usuario que creó la sesión |

---

*Documentación generada automáticamente - Última actualización: $(date)*
