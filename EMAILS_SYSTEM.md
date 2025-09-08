# Sistema de Emails - BeastCRM

## Descripción General

El sistema de emails de BeastCRM permite gestionar múltiples cuentas de correo electrónico desde una interfaz unificada, con sincronización automática y funcionalidades avanzadas de gestión de correo.

## Características Principales

### 🚀 **Gestión Multi-Cuenta**
- Soporte para múltiples proveedores: Gmail, Outlook, Yahoo
- Cuentas personalizadas con configuración IMAP/SMTP
- Conexión segura mediante OAuth 2.0
- Sincronización automática cada 5 minutos

### ✉️ **Funcionalidades de Email**
- Bandeja de entrada unificada
- Composición de emails con adjuntos
- Respuesta y reenvío de mensajes
- Sistema de etiquetas y marcado
- Búsqueda avanzada de mensajes
- Gestión de borradores

### 🎨 **Interfaz de Usuario**
- Diseño moderno con tema oscuro
- Layout responsive y intuitivo
- Navegación por pestañas (Entrada, Destacados, Enviados, etc.)
- Indicadores visuales de estado (leído/no leído, destacado)

## Arquitectura del Sistema

### Componentes Principales

```
src/app/dashboard/emails/
├── page.tsx                 # Página principal de emails
├── components/
│   ├── EmailAccountManager.tsx  # Gestor de cuentas
│   ├── EmailComposer.tsx        # Editor de emails
│   └── index.ts                 # Exportaciones
└── services/
    └── emailService.ts          # Servicio de sincronización
```

### Servicios y APIs

- **EmailService**: Maneja toda la lógica de negocio
- **Supabase**: Base de datos para almacenamiento
- **OAuth 2.0**: Autenticación con proveedores de email
- **IMAP/SMTP**: Para cuentas personalizadas

## Configuración de Cuentas

### Proveedores Soportados

#### Gmail
- Autenticación OAuth 2.0
- Scopes: `gmail.readonly`, `gmail.send`
- Sincronización automática

#### Outlook
- Autenticación OAuth 2.0
- Scopes: `Mail.Read`, `Mail.Send`
- Integración con Microsoft Graph API

#### Yahoo
- Autenticación OAuth 2.0
- Scopes: `mail-r`, `mail-w`
- API de Yahoo Mail

#### Personalizado
- Configuración IMAP para recepción
- Configuración SMTP para envío
- Soporte para SSL/TLS

### Variables de Entorno Requeridas

```bash
# Gmail
NEXT_PUBLIC_GMAIL_CLIENT_ID=tu_client_id_gmail

# Outlook
NEXT_PUBLIC_OUTLOOK_CLIENT_ID=tu_client_id_outlook

# Yahoo
NEXT_PUBLIC_YAHOO_CLIENT_ID=tu_client_id_yahoo
```

## Base de Datos

### Tabla: email_accounts

```sql
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  is_connected BOOLEAN DEFAULT FALSE,
  unread_count INTEGER DEFAULT 0,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  imap_settings JSONB,
  smtp_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: emails

```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts(id),
  message_id VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  date TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels TEXT[],
  attachments JSONB,
  thread_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Flujo de Sincronización

### 1. Conexión de Cuenta
```
Usuario → Agregar Cuenta → Seleccionar Proveedor → OAuth → Tokens → Sincronización
```

### 2. Sincronización Automática
```
Intervalo (5 min) → Verificar Tokens → Obtener Nuevos Emails → Actualizar BD → UI
```

### 3. Envío de Email
```
Componer → Validar → Seleccionar Cuenta → Enviar → Confirmar → Actualizar UI
```

## Funcionalidades de Usuario

### Gestión de Cuentas
- ✅ Agregar nuevas cuentas
- ✅ Conectar/desconectar cuentas
- ✅ Configurar proveedores
- ✅ Ver estado de conexión
- ✅ Eliminar cuentas

### Operaciones de Email
- ✅ Leer mensajes
- ✅ Marcar como leído/no leído
- ✅ Destacar mensajes
- ✅ Responder mensajes
- ✅ Reenviar mensajes
- ✅ Componer nuevos emails
- ✅ Adjuntar archivos
- ✅ Guardar borradores

### Organización
- ✅ Filtros por carpeta
- ✅ Búsqueda de texto
- ✅ Etiquetas personalizadas
- ✅ Vista de hilos de conversación

## Seguridad

### OAuth 2.0
- Tokens de acceso temporales
- Tokens de actualización seguros
- Scopes limitados por funcionalidad
- Renovación automática de tokens

### Almacenamiento
- Tokens encriptados en base de datos
- No almacenamiento de contraseñas
- Acceso solo a permisos autorizados

## Implementación Técnica

### Tecnologías Utilizadas
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: OAuth 2.0
- **Estado**: React Hooks + Context

### Patrones de Diseño
- **Service Layer**: Lógica de negocio centralizada
- **Component Composition**: Componentes reutilizables
- **Observer Pattern**: Sincronización automática
- **Factory Pattern**: Creación de proveedores

## Roadmap de Desarrollo

### Fase 1 (Actual)
- ✅ Interfaz básica de emails
- ✅ Gestión de cuentas
- ✅ Composición de emails
- ✅ Sincronización básica

### Fase 2 (Próxima)
- 🔄 Integración real con APIs de proveedores
- 🔄 Sistema de plantillas de email
- 🔄 Programación de envíos
- 🔄 Análisis y reportes

### Fase 3 (Futura)
- 📋 Integración con CRM
- 📋 Automatización de respuestas
- 📋 Workflows de email
- 📋 Analytics avanzados

## Solución de Problemas

### Problemas Comunes

#### Cuenta no se conecta
1. Verificar credenciales OAuth
2. Comprobar scopes de permisos
3. Revisar tokens de acceso
4. Verificar configuración de red

#### Sincronización falla
1. Verificar conexión a internet
2. Comprobar validez de tokens
3. Revisar logs de error
4. Verificar límites de API

#### Emails no se envían
1. Verificar configuración SMTP
2. Comprobar permisos de envío
3. Revisar límites de cuota
4. Verificar formato de email

### Logs y Debugging

```typescript
// Habilitar logs detallados
console.log('Sincronizando cuenta:', accountId);
console.log('Tokens:', { accessToken, refreshToken });
console.log('Configuración:', { imap, smtp });
```

## Contribución

### Estándares de Código
- TypeScript estricto
- ESLint + Prettier
- Componentes funcionales
- Hooks personalizados
- Tests unitarios

### Estructura de Commits
```
feat: agregar funcionalidad de etiquetas
fix: corregir error de sincronización
docs: actualizar documentación
refactor: mejorar servicio de emails
```

## Soporte

### Recursos Adicionales
- [Documentación de Gmail API](https://developers.google.com/gmail/api)
- [Microsoft Graph API](https://docs.microsoft.com/graph/)
- [Yahoo Mail API](https://developer.yahoo.com/mail/)
- [RFC 3501 - IMAP](https://tools.ietf.org/html/rfc3501)

### Contacto
- **Desarrollador**: Equipo BeastCRM
- **Email**: soporte@beastcrm.com
- **Documentación**: [docs.beastcrm.com](https://docs.beastcrm.com)

---

*Última actualización: Diciembre 2024*
*Versión: 1.0.0*
