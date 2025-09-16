# API de Usuarios - Documentación

Esta API proporciona endpoints para la gestión completa de usuarios en el sistema CRM. Todos los endpoints están implementados siguiendo el patrón DDD (Domain-Driven Design) y se conectan directamente con Supabase.

## 📁 Estructura del Proyecto

```
src/app/api/usuarios/
├── domain/
│   └── usuario.ts          # Interfaces y tipos del dominio
├── [id]/
│   ├── route.ts            # GET, PATCH, DELETE por ID
│   └── toggle-status/
│       └── route.ts        # PATCH para cambiar estado
├── check-email/
│   └── route.ts            # GET para verificar email
├── login/
│   └── route.ts            # POST para autenticación
├── route.ts                # GET todos, POST crear
├── utils/
│   ├── getHeaders.ts       # Utilidades para headers
│   ├── handleResponse.ts   # Manejo de respuestas
│   └── index.ts           # Exportaciones
└── README.md               # Esta documentación
```

## 🔗 Endpoints Disponibles

### 1. **POST** `/api/usuarios` - Crear Usuario

Crea un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "nombre_agencia": "Agencia Ejemplo",
  "tipo_empresa": "Corporativo",
  "nombre_usuario": "Juan Pérez",
  "correo_electronico": "juan@ejemplo.com",
  "telefono": "1234567890",
  "codigo_pais": "52",
  "contrasena": "password123",
  "rol": "Operador",
  "activo": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_agencia": "Agencia Ejemplo",
    "tipo_empresa": "Corporativo",
    "nombre_usuario": "Juan Pérez",
    "correo_electronico": "juan@ejemplo.com",
    "telefono": "1234567890",
    "codigo_pais": "52",
    "rol": "Operador",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Error del servidor: 400 Bad Request",
  "details": "Datos de usuario inválidos"
}
```

---

### 2. **GET** `/api/usuarios` - Obtener Todos los Usuarios

Retorna una lista de todos los usuarios registrados.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre_agencia": "Agencia Ejemplo",
      "tipo_empresa": "Corporativo",
      "nombre_usuario": "Juan Pérez",
      "correo_electronico": "juan@ejemplo.com",
      "telefono": "1234567890",
      "codigo_pais": "52",
      "rol": "Operador",
      "activo": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. **GET** `/api/usuarios/[id]` - Obtener Usuario por ID

Retorna los datos de un usuario específico.

**Parámetros:**
- `id` (number): ID del usuario

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_agencia": "Agencia Ejemplo",
    "tipo_empresa": "Corporativo",
    "nombre_usuario": "Juan Pérez",
    "correo_electronico": "juan@ejemplo.com",
    "telefono": "1234567890",
    "codigo_pais": "52",
    "rol": "Operador",
    "activo": true,
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

### 4. **PATCH** `/api/usuarios/[id]` - Actualizar Usuario

Actualiza los datos de un usuario existente.

**Parámetros:**
- `id` (number): ID del usuario

**Request Body:**
```json
{
  "nombre_usuario": "Juan Carlos Pérez",
  "telefono": "0987654321",
  "rol": "Administrador"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_agencia": "Agencia Ejemplo",
    "tipo_empresa": "Corporativo",
    "nombre_usuario": "Juan Carlos Pérez",
    "correo_electronico": "juan@ejemplo.com",
    "telefono": "0987654321",
    "codigo_pais": "52",
    "rol": "Administrador",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. **DELETE** `/api/usuarios/[id]` - Eliminar Usuario

Elimina un usuario del sistema.

**Parámetros:**
- `id` (number): ID del usuario

**Response (200):**
```json
{
  "success": true,
  "data": undefined
}
```

---

### 6. **PATCH** `/api/usuarios/[id]/toggle-status` - Cambiar Estado del Usuario

Activa o desactiva un usuario.

**Parámetros:**
- `id` (number): ID del usuario

**Request Body:**
```json
{
  "activo": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

**Response (200) - Activación:**
```json
{
  "success": true,
  "message": "Usuario activado exitosamente"
}
```

---

### 7. **GET** `/api/usuarios/check-email` - Verificar Email

Verifica si un email ya está registrado en el sistema.

**Query Parameters:**
- `email` (string): Email a verificar

**Ejemplo de Request:**
```
GET /api/usuarios/check-email?email=juan@ejemplo.com
```

**Response (200) - Email disponible:**
```json
{
  "success": true,
  "data": false,
  "message": "El email está disponible"
}
```

**Response (200) - Email registrado:**
```json
{
  "success": true,
  "data": true,
  "message": "El email ya está registrado"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Formato de email inválido"
}
```

---

### 8. **POST** `/api/usuarios/login` - Autenticación

Autentica un usuario con email y contraseña.

**Request Body:**
```json
{
  "correo_electronico": "juan@ejemplo.com",
  "contrasena": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_agencia": "Agencia Ejemplo",
    "tipo_empresa": "Corporativo",
    "nombre_usuario": "Juan Pérez",
    "correo_electronico": "juan@ejemplo.com",
    "telefono": "1234567890",
    "codigo_pais": "52",
    "rol": "Operador",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Login exitoso"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Credenciales incorrectas"
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "Usuario desactivado. Contacta al administrador."
}
```

---

## 🔧 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error en la petición (datos inválidos) |
| 401 | No autorizado (credenciales incorrectas) |
| 403 | Prohibido (usuario desactivado) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación con Supabase usando service role key.

2. **Validaciones**: 
   - Los emails se validan con formato básico usando regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Los IDs deben ser números válidos (validación con `isNaN(Number(id))`)
   - Los campos requeridos se validan en cada endpoint
   - El campo `activo` en toggle-status debe ser un booleano
   - Email y contraseña son requeridos para login

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos:
   - Errores de validación (400)
   - Errores de autenticación (401)
   - Errores de autorización (403)
   - Errores de servidor (500)

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data`, `error` y `details` opcional.

5. **Seguridad**: Las contraseñas se almacenan en texto plano (considerar implementar hash en el futuro).

6. **Campos Opcionales**:
   - `rol` tiene valor por defecto 'Operador'
   - `activo` tiene valor por defecto `true`
   - `id` es opcional en creación (se genera automáticamente)

---

## 📋 Tipos de Datos

### UsuarioData (Para creación)
```typescript
interface UsuarioData {
  id?: number;                    // Opcional, se genera automáticamente
  nombre_agencia: string;         // Requerido
  tipo_empresa: string;           // Requerido
  nombre_usuario: string;         // Requerido
  correo_electronico: string;     // Requerido, formato email válido
  telefono: string;               // Requerido
  codigo_pais: string;            // Requerido
  contrasena: string;             // Requerido
  rol?: string;                   // Opcional, default: 'Operador'
  activo?: boolean;               // Opcional, default: true
}
```

### UsuarioResponse (Respuesta de la API)
```typescript
interface UsuarioResponse {
  id: number;                     // Siempre presente
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  rol: string;                    // Siempre presente
  activo: boolean;                // Siempre presente
  fecha_alta?: string;            // Opcional
  created_at?: string;            // Opcional
}
```

### LoginCredentials
```typescript
interface LoginCredentials {
  correo_electronico: string;     // Requerido, formato email válido
  contrasena: string;             // Requerido
}
```

### ToggleStatusRequest
```typescript
interface ToggleStatusRequest {
  activo: boolean;                // Requerido, debe ser booleano
}
```

---

## 🚀 Uso en el Frontend

```typescript
// Tipos de datos (importar desde el dominio)
import { UsuarioData, LoginCredentials, UsuarioResponse } from './domain/usuario';

// Crear usuario
const createUser = async (userData: UsuarioData) => {
  const response = await fetch('/api/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return await response.json();
};

// Obtener todos los usuarios
const getUsers = async (): Promise<UsuarioResponse[]> => {
  const response = await fetch('/api/usuarios');
  const result = await response.json();
  return result.data || [];
};

// Obtener usuario por ID
const getUserById = async (id: number): Promise<UsuarioResponse | null> => {
  const response = await fetch(`/api/usuarios/${id}`);
  const result = await response.json();
  return result.data;
};

// Actualizar usuario
const updateUser = async (id: number, userData: Partial<UsuarioData>) => {
  const response = await fetch(`/api/usuarios/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return await response.json();
};

// Eliminar usuario
const deleteUser = async (id: number) => {
  const response = await fetch(`/api/usuarios/${id}`, {
    method: 'DELETE',
  });
  
  return await response.json();
};

// Cambiar estado del usuario
const toggleUserStatus = async (id: number, activo: boolean) => {
  const response = await fetch(`/api/usuarios/${id}/toggle-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activo }),
  });
  
  return await response.json();
};

// Verificar email
const checkEmail = async (email: string): Promise<boolean> => {
  const response = await fetch(`/api/usuarios/check-email?email=${encodeURIComponent(email)}`);
  const result = await response.json();
  return result.data;
};

// Login de usuario
const loginUser = async (credentials: LoginCredentials) => {
  const response = await fetch('/api/usuarios/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  return await response.json();
};
```

---

## ⚠️ Errores Comunes

### 400 Bad Request
- **ID inválido**: `"ID de usuario inválido"` - El ID debe ser un número válido
- **Email inválido**: `"Formato de email inválido"` - El email no cumple con el formato requerido
- **Datos faltantes**: `"Email y contraseña son requeridos"` - Faltan credenciales en login
- **Parámetro faltante**: `"El parámetro email es requerido"` - Falta el parámetro email en check-email
- **Tipo incorrecto**: `"El campo 'activo' debe ser un valor booleano"` - El campo activo debe ser true/false

### 401 Unauthorized
- **Credenciales incorrectas**: `"Credenciales incorrectas"` - Email o contraseña incorrectos

### 403 Forbidden
- **Usuario desactivado**: `"Usuario desactivado. Contacta al administrador."` - El usuario existe pero está inactivo

### 500 Internal Server Error
- **Error de conexión**: `"Error de conexión al [operación]"` - Problemas de conectividad con Supabase
- **Error del servidor**: `"Error del servidor: [código] [mensaje]"` - Error específico de Supabase

---

*Documentación actualizada - Última actualización: Diciembre 2024*
