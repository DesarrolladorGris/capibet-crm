# API de Productos

Este módulo proporciona endpoints para gestionar productos en el sistema CRM.

## Estructura de Datos

### ProductData (Para crear/actualizar)
```typescript
interface ProductData {
  id?: number;
  nombre: string;
  moneda: string;
  precio: number;
  cantidad: number;
  descripcion?: string;
  creado_por: number;
}
```

### ProductResponse (Respuesta de la API)
```typescript
interface ProductResponse {
  id: number;
  nombre: string;
  moneda: string;
  precio: number;
  cantidad: number;
  descripcion?: string;
  creado_por: number;
  created_at?: string;
  updated_at?: string;
}
```

## Endpoints

### GET /api/productos
Obtiene todos los productos.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto Ejemplo",
      "moneda": "USD",
      "precio": 1000,
      "cantidad": 50,
      "descripcion": "Descripción del producto",
      "creado_por": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/productos
Crea un nuevo producto.

**Body:**
```json
{
  "nombre": "Nuevo Producto",
  "moneda": "USD",
  "precio": 1500,
  "cantidad": 25,
  "descripcion": "Descripción del nuevo producto",
  "creado_por": 1
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Nuevo Producto",
    "moneda": "USD",
    "precio": 1500,
    "cantidad": 25,
    "descripcion": "Descripción del nuevo producto",
    "creado_por": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/productos
Actualiza un producto existente.

**Body:**
```json
{
  "id": 1,
  "nombre": "Producto Actualizado",
  "precio": 1200,
  "cantidad": 30
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto Actualizado",
    "moneda": "USD",
    "precio": 1200,
    "cantidad": 30,
    "descripcion": "Descripción del producto",
    "creado_por": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/productos?id={id}
Elimina un producto por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": undefined
}
```

### GET /api/productos/[id]
Obtiene un producto específico por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto Ejemplo",
    "moneda": "USD",
    "precio": 1000,
    "cantidad": 50,
    "descripcion": "Descripción del producto",
    "creado_por": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### PATCH /api/productos/[id]
Actualiza un producto específico por ID.

**Body:**
```json
{
  "nombre": "Producto Actualizado",
  "precio": 1200
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Producto Actualizado",
    "moneda": "USD",
    "precio": 1200,
    "cantidad": 50,
    "descripcion": "Descripción del producto",
    "creado_por": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### DELETE /api/productos/[id]
Elimina un producto específico por ID.

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": undefined
}
```

## Códigos de Error

- **400**: Bad Request - Datos inválidos o faltantes
- **404**: Not Found - Producto no encontrado
- **500**: Internal Server Error - Error del servidor

## Ejemplos de Uso

### Crear un producto
```javascript
const response = await fetch('/api/productos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nombre: 'Laptop Dell',
    moneda: 'USD',
    precio: 1200,
    cantidad: 10,
    descripcion: 'Laptop Dell Inspiron 15',
    creado_por: 1
  })
});

const data = await response.json();
```

### Obtener todos los productos
```javascript
const response = await fetch('/api/productos');
const data = await response.json();
```

### Actualizar un producto
```javascript
const response = await fetch('/api/productos/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    precio: 1100,
    cantidad: 15
  })
});

const data = await response.json();
```

### Eliminar un producto
```javascript
const response = await fetch('/api/productos/1', {
  method: 'DELETE'
});

const data = await response.json();
```
