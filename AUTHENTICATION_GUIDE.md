# Guía de Autenticación - Beast CRM

## Sistema de Autenticación Implementado

Este documento describe el sistema de autenticación implementado para Beast CRM usando Supabase.

## 🔧 Componentes Principales

### 1. **Servicio de Supabase** (`src/services/supabaseService.ts`)
- `loginUsuario()`: Autentica usuarios mediante email y contraseña
- `createUsuario()`: Registra nuevos usuarios
- `checkEmailExists()`: Verifica si un email ya está registrado

### 2. **Página de Login** (`src/app/login/page.tsx`)
- Formulario de autenticación con validaciones
- Conexión real con API de Supabase
- Manejo de errores y estados de carga
- Pre-llenado de email desde registro

### 3. **Página de Registro** (`src/app/register/page.tsx`)
- Proceso de registro en 2 pasos
- Validaciones completas
- Verificación de emails duplicados
- Redirección automática al login

### 4. **Hook de Autenticación** (`src/hooks/useAuth.ts`)
- Hook personalizado para manejar estado de autenticación
- Verificación automática de sesión
- Funciones de logout y protección de rutas

## 🔐 Flujo de Autenticación

### Registro:
1. Usuario completa formulario en 2 pasos
2. Validaciones del lado del cliente
3. Verificación de email duplicado
4. Creación de usuario en Supabase
5. Redirección al login con email pre-llenado

### Login:
1. Usuario ingresa credenciales
2. Validaciones del lado del cliente
3. Consulta a Supabase con filtros
4. Verificación de usuario activo
5. Almacenamiento de datos de sesión
6. Redirección al dashboard

### Protección de Rutas:
1. Verificación automática en páginas protegidas
2. Redirección al login si no está autenticado
3. Carga de datos de usuario desde localStorage

## 📊 Datos de Sesión Almacenados

El sistema almacena en `localStorage`:

```javascript
{
  isLoggedIn: 'true',
  userEmail: 'usuario@email.com',
  userName: 'Nombre Usuario',
  userRole: 'Operador',
  userId: '123',
  agencyName: 'Nombre Agencia',
  userData: '{"id":123,"nombre_usuario":"..."}' // JSON completo
}
```

## 🛡️ Seguridad Implementada

### Validaciones del Cliente:
- ✅ Formato de email válido
- ✅ Longitud mínima de contraseña (6 caracteres)
- ✅ Coincidencia de contraseñas en registro
- ✅ Campos requeridos
- ✅ Verificación de emails duplicados

### Validaciones del Servidor:
- ✅ Autenticación mediante API de Supabase
- ✅ Verificación de usuario activo
- ✅ Manejo seguro de errores
- ✅ Headers de autorización correctos

## 🔄 API Endpoints Utilizados

### Login:
```bash
# Sintaxis de PostgREST: eq. = equal (igualdad exacta)
GET /rest/v1/usuarios?correo_electronico=eq.{email}&contrasena=eq.{password}

# Ejemplo real:
GET /rest/v1/usuarios?correo_electronico=eq.kiko%40gmail.com&contrasena=eq.Kiko1234
```

### Registro:
```bash
POST /rest/v1/usuarios
Content-Type: application/json
{
  "nombre_agencia": "...",
  "tipo_empresa": "...",
  "nombre_usuario": "...",
  "correo_electronico": "...",
  "telefono": "...",
  "codigo_pais": "...",
  "contrasena": "...",
  "rol": "Operador",
  "activo": 1
}
```

### Verificación de Email:
```bash
# Solo selecciona el campo correo_electronico para verificar existencia
GET /rest/v1/usuarios?correo_electronico=eq.{email}&select=correo_electronico

# Ejemplo real:
GET /rest/v1/usuarios?correo_electronico=eq.kiko%40gmail.com&select=correo_electronico
```

## 📝 Sintaxis de PostgREST

Supabase usa PostgREST para las consultas REST, donde:

- `eq.` = Equal (igualdad exacta)
- `neq.` = Not equal (diferente)
- `gt.` = Greater than (mayor que)
- `gte.` = Greater than or equal (mayor o igual)
- `lt.` = Less than (menor que)
- `lte.` = Less than or equal (menor o igual)
- `like.` = Pattern matching (coincidencia de patrón)
- `ilike.` = Case insensitive pattern matching

**Importante**: Los valores deben estar URL-encoded cuando contienen caracteres especiales como `@`.

## 🎯 Características Implementadas

- ✅ **Autenticación Real**: Conexión con base de datos Supabase
- ✅ **Validaciones Robustas**: Cliente y servidor
- ✅ **Manejo de Errores**: Mensajes informativos para el usuario
- ✅ **Estados de Carga**: Feedback visual durante operaciones
- ✅ **Protección de Rutas**: Redirección automática
- ✅ **Datos de Usuario**: Almacenamiento y uso en la aplicación
- ✅ **Logout Seguro**: Limpieza completa de datos de sesión

## 🚀 Cómo Usar

### Para Probar el Login:
1. Asegúrate de que `.env.local` esté configurado
2. Registra un usuario desde `/register`
3. Usa las credenciales para hacer login en `/login`
4. Serás redirigido al dashboard con tus datos

### Para Desarrollo:
```typescript
// Usar el hook de autenticación
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, user, logout, requireAuth } = useAuth();
  
  // Proteger componente
  useEffect(() => {
    requireAuth();
  }, []);
  
  // Usar datos del usuario
  if (user) {
    console.log('Usuario:', user.nombre_usuario);
    console.log('Rol:', user.rol);
  }
}
```

## 🔧 Próximas Mejoras Recomendadas

1. **JWT Tokens**: Implementar tokens con expiración
2. **Refresh Tokens**: Sistema de renovación automática
3. **Hash de Contraseñas**: bcrypt para mayor seguridad
4. **Middleware**: Protección de rutas a nivel de Next.js
5. **2FA**: Autenticación de dos factores
6. **Session Storage**: Usar sessionStorage en lugar de localStorage
7. **Encriptación**: Encriptar datos sensibles en storage

## 🐛 Debugging

Para debuggear problemas de autenticación:

1. **Revisa la consola del navegador** para logs de:
   - "Intentando login para: ..."
   - "Respuesta de login: ..."
   - "Login exitoso: ..."

2. **Verifica localStorage** en DevTools → Application → Storage

3. **Comprueba la respuesta de Supabase** en Network tab

4. **Valida las credenciales** directamente en la base de datos
