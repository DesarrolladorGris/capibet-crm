# API de Espacios de Trabajo - Documentación

Esta API proporciona endpoints para la gestión completa de espacios de trabajo en el sistema CRM. Todos los endpoints están implementados siguiendo el patrón DDD (Domain-Driven Design) y se conectan directamente con Supabase.

## 📁 Estructura del Proyecto

```
src/app/api/espacio_trabajos/
├── domain/
│   └── espacio_trabajo.ts     # Interfaces y tipos del dominio
├── [id]/
│   └── route.ts               # GET, PATCH, DELETE por ID
├── utils/
│   ├── getHeaders.ts          # Headers para Supabase
│   ├── handleResponse.ts      # Manejo de respuestas
│   └── index.ts               # Exportaciones
├── route.ts                   # GET todos, POST crear
└── README.md                  # Esta documentación
```

## 🔗 Endpoints Disponibles

### 1. **POST** `/api/espacio_trabajos` - Crear Espacio de Trabajo

Crea un nuevo espacio de trabajo en el sistema.

**Request Body:**
```json
{
  "nombre": "Espacio de Ventas",
  "descripcion": "Espacio dedicado al equipo de ventas",
  "activo": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Espacio de Ventas",
    "descripcion": "Espacio dedicado al equipo de ventas",
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
  "details": "Datos de espacio de trabajo inválidos"
}
```

---

### 2. **GET** `/api/espacio_trabajos` - Obtener Todos los Espacios de Trabajo

Retorna una lista de todos los espacios de trabajo registrados.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Espacio de Ventas",
      "descripcion": "Espacio dedicado al equipo de ventas",
      "activo": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "nombre": "Espacio de Marketing",
      "descripcion": "Espacio para el equipo de marketing",
      "activo": true,
      "created_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### 3. **GET** `/api/espacio_trabajos/[id]` - Obtener Espacio de Trabajo por ID

Retorna los datos de un espacio de trabajo específico.

**Parámetros:**
- `id` (number): ID del espacio de trabajo

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Espacio de Ventas",
    "descripcion": "Espacio dedicado al equipo de ventas",
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

### 4. **PATCH** `/api/espacio_trabajos/[id]` - Actualizar Espacio de Trabajo

Actualiza los datos de un espacio de trabajo existente.

**Parámetros:**
- `id` (number): ID del espacio de trabajo

**Request Body:**
```json
{
  "nombre": "Espacio de Ventas Premium",
  "descripcion": "Espacio mejorado para el equipo de ventas",
  "activo": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Espacio de Ventas Premium",
    "descripcion": "Espacio mejorado para el equipo de ventas",
    "activo": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. **DELETE** `/api/espacio_trabajos/[id]` - Eliminar Espacio de Trabajo

Elimina un espacio de trabajo del sistema.

**Parámetros:**
- `id` (number): ID del espacio de trabajo

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
   - El campo `nombre` es requerido
   - El campo `descripcion` es opcional
   - El campo `activo` tiene valor por defecto `true`

3. **Manejo de Errores**: Todos los endpoints incluyen manejo consistente de errores con mensajes descriptivos.

4. **Respuestas**: Todas las respuestas siguen el formato estándar con `success`, `data` y `error`.

5. **Campos Opcionales**: 
   - `descripcion`: Puede ser `null` si no se proporciona
   - `activo`: Por defecto es `true` si no se especifica

---

## 🚀 Uso en el Frontend

```typescript
// Ejemplo de uso en el frontend
const createEspacioTrabajo = async (espacioData: EspacioTrabajoData) => {
  const response = await fetch('/api/espacio_trabajos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(espacioData),
  });
  
  return await response.json();
};

const getEspaciosTrabajo = async () => {
  const response = await fetch('/api/espacio_trabajos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};

const updateEspacioTrabajo = async (id: number, espacioData: Partial<EspacioTrabajoData>) => {
  const response = await fetch(`/api/espacio_trabajos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(espacioData),
  });
  
  return await response.json();
};

const deleteEspacioTrabajo = async (id: number) => {
  const response = await fetch(`/api/espacio_trabajos/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
};
```

---

## 🔄 Migración desde supabaseService

Los métodos migrados desde `supabaseService.ts` son:

- `getAllEspaciosTrabajo()` → `GET /api/espacio_trabajos`
- `createEspacioTrabajo()` → `POST /api/espacio_trabajos`
- `updateEspacioTrabajo()` → `PATCH /api/espacio_trabajos/[id]`
- `deleteEspacioTrabajo()` → `DELETE /api/espacio_trabajos/[id]`

Todos los métodos mantienen la misma funcionalidad pero ahora están disponibles como endpoints REST independientes.

---

*Documentación generada automáticamente - Última actualización: $(date)*