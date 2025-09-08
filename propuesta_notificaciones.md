
# Sistema de Notificaciones en Tiempo Real - Capibet CRM

## 📊 Análisis de Costos - Supabase Realtime

### Planes de Precios

| Plan | Conexiones Simultáneas | Mensajes/Mes | Precio |
|------|----------------------|--------------|---------|
| **Free** | 200 | 2 millones | $0 |
| **Pro** | 500 | 5 millones | ~$25 USD/mes |

### 💡 Ventajas de Supabase Realtime

- **Integración nativa**: No es necesario montar un sistema de pub/sub externo (como Redis o Kafka)
- **Sincronización automática**: Los cambios en la base de datos se envían automáticamente a través de WebSockets gestionados por el SDK de supabase
- **Escalabilidad**: Manejo eficiente de conexiones simultáneas
- **Simplicidad**: Implementación directa sin infraestructura adicional como WebSocket en nuestro backend

## 🔧 Implementación Técnica

### Ejemplo Básico de Implementación

```typescript
"use client"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

export default function Chat() {
  React.useEffect(() => {
    const channel = supabase
      .channel("room-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          console.log("Nuevo cambio:", payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>Chat en tiempo real</div>
}
```

### ⚠️ Consideraciones Importantes

**En el servidor (Next.js API routes, Server Actions, etc.):**
No es recomendable mantener sockets abiertos en serverless functions como con Vercel o Netlify ya que las funciones serverless son efímeras y se cierran rápidamente
Solo podemos usar channel subscribe en componentes del lado del cliente (`'use client'`) para manejar el realtime

## 📋 Diseño de la Tabla de Notificaciones

### Estructura de la Tabla `notifications`

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES usuarios(id),
  type VARCHAR(50) NOT NULL, -- Tipo de notificación
  title VARCHAR(200) NOT NULL, -- Título de la notificación
  message TEXT NOT NULL, -- Mensaje descriptivo
  data JSONB, -- Datos adicionales específicos del tipo
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(20) DEFAULT 'unread', -- unread, read, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500), -- URL para redirigir al hacer clic
  icon VARCHAR(50) -- Icono a mostrar (emoji o clase CSS)
);

-- Índices para optimización
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### Campos de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la notificación |
| `user_id` | INTEGER | ID del usuario destinatario |
| `type` | VARCHAR(50) | Tipo de notificación (ej: 'task_assigned', 'contact_created') |
| `title` | VARCHAR(200) | Título corto de la notificación |
| `message` | TEXT | Descripción detallada del evento |
| `data` | JSONB | Datos adicionales (IDs, nombres, etc.) |
| `priority` | VARCHAR(20) | Prioridad: low, medium, high, urgent |
| `status` | VARCHAR(20) | Estado: unread, read, archived |
| `created_at` | TIMESTAMP | Fecha de creación |
| `read_at` | TIMESTAMP | Fecha de lectura (null si no leída) |
| `expires_at` | TIMESTAMP | Fecha de expiración (opcional) |
| `action_url` | VARCHAR(500) | URL para redirigir al hacer clic |
| `icon` | VARCHAR(50) | Icono a mostrar |

## 🏗️ Implementación del Backend

### Estructura del Módulo de Notificaciones

```
src/app/api/notifications/
├── route.ts                    # POST /api/notifications
├── types/
│   └── notification-types.ts   # Definición de tipos
└── utils/
    └── notification-builder.ts # Lógica para construir notificaciones
```

### Diccionario de Tipos de Notificaciones

```typescript
// src/app/api/notifications/types/notification-types.ts

export interface NotificationTemplate {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
  actionUrl?: string;
  getRecipients: (data: any) => number[]; // Función para determinar destinatarios
}

export const NOTIFICATION_TYPES: Record<string, NotificationTemplate> = {
  // Tareas (futuro)
  'task_assigned': {
    title: 'Nueva Tarea Asignada',
    message: 'Se te ha asignado la tarea: {task_title}',
    priority: 'high',
    icon: '📋',
    actionUrl: '/dashboard/tareas/{task_id}',
    getRecipients: (data) => [data.assigned_to]
  },

  'task_completed': {
    title: 'Tarea Completada',
    message: 'La tarea {task_title} ha sido completada por {user_name}',
    priority: 'medium',
    icon: '✅',
    actionUrl: '/dashboard/tareas/{task_id}',
    getRecipients: (data) => [data.created_by, data.assigned_to]
  },

  // Chat Interno
  'chat_message': {
    title: 'Nuevo Mensaje',
    message: '{user_name}: {message_preview}',
    priority: 'medium',
    icon: '💬',
    actionUrl: '/dashboard/chat-interno/{channel_id}',
    getRecipients: (data) => data.channel_members
  }
};
```

### Endpoint Principal de Notificaciones

```typescript
// src/app/api/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/services/supabaseService';
import { NOTIFICATION_TYPES } from './types/notification-types';

interface CreateNotificationRequest {
  type: string;
  data: any;
  recipients?: number[]; // Opcional: sobrescribe la lógica de destinatarios
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateNotificationRequest = await request.json();
    const { type, data, recipients } = body;

    // Validar que el tipo existe
    const template = NOTIFICATION_TYPES[type];
    if (!template) {
      return NextResponse.json(
        { error: 'Tipo de notificación no válido' },
        { status: 400 }
      );
    }

    // Determinar destinatarios
    const finalRecipients = recipients || template.getRecipients(data);
    
    if (finalRecipients.length === 0) {
      // Si no hay destinatarios específicos, obtener todos los usuarios activos
      const { data: allUsers } = await supabaseService.getAllUsuarios();
      if (allUsers?.success && allUsers.data) {
        finalRecipients.push(...allUsers.data.map(user => user.id));
      }
    }

    // Construir notificaciones para cada destinatario
    const notifications = finalRecipients.map(userId => ({
      user_id: userId,
      type,
      title: buildTitle(template.title, data),
      message: buildMessage(template.message, data),
      priority: template.priority,
      icon: template.icon,
      action_url: buildActionUrl(template.actionUrl, data),
      data: JSON.stringify(data)
    }));

    // Insertar notificaciones en lote
    const { error } = await supabaseService.createNotifications(notifications);

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear notificaciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones creadas para ${notifications.length} usuarios`,
      notifications_created: notifications.length
    });

  } catch (error) {
    console.error('Error en endpoint de notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para construir títulos con variables
function buildTitle(template: string, data: any): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Función para construir mensajes con variables
function buildMessage(template: string, data: any): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Función para construir URLs de acción
function buildActionUrl(template: string | undefined, data: any): string | null {
  if (!template) return null;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return data[key] || match;
  });
}
```


## 🎯 Ventajas de esta Arquitectura

1. **Centralización**: Todas las notificaciones pasan por un solo endpoint
2. **Flexibilidad**: Fácil agregar nuevos tipos de notificaciones
3. **Mantenibilidad**: Lógica de notificaciones separada del negocio
4. **Escalabilidad**: Sistema preparado para crecer
5. **Consistencia**: Formato uniforme para todas las notificaciones

## 📝 Implementación Completa

### 1. Extensión del SupabaseService

Se ha extendido el `supabaseService.ts` con el método `createNotification`:

```typescript
// Tipos para notificaciones
export interface NotificationData {
  type: string;
  data: any;
  recipients?: number[];
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  notifications_created?: number;
  error?: string;
}

// Método para crear notificaciones
async createNotification(notificationData: NotificationData): Promise<ApiResponse<NotificationResponse>> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: `Error del servidor: ${response.status} ${response.statusText}`,
        details: errorData
      };
    }

    const data = await this.handleResponse(response);
    return {
      success: true,
      data: data as unknown as NotificationResponse
    };

  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: 'Error de conexión al crear notificación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
```

### 2. Ejemplo de Uso en Componente

Ejemplo de cómo usar el sistema de notificaciones al crear un usuario:

```typescript
// En NuevoUsuarioModal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validaciones ...
  
  try {
    // Crear usuario en Supabase
    const result = await supabaseService.createUsuario(userData);
    
    if (result.success) {
      setSuccess('¡Usuario creado exitosamente!');
      
      // Crear notificación para informar sobre el nuevo usuario
      try {
        // Obtener todos los usuarios para notificar a los administradores
        const { data: allUsers } = await supabaseService.getAllUsuarios();
        const adminUsers = allUsers?.filter(user => user.rol === 'Administrador' || user.rol === 'Admin') || [];
        
        await supabaseService.createNotification({
          type: 'user_created',
          data: {
            user_name: formData.name,
            user_email: formData.email,
            agency_name: formData.agencyName,
            company_type: formData.companyType,
            admin_users: adminUsers.map(admin => admin.id)
          }
        });
      } catch (notificationError) {
        console.warn('Error al crear notificación:', notificationError);
        // No mostramos error al usuario ya que el usuario se creó correctamente
      }
      
      // Continuar con el flujo normal...
    }
  } catch (error) {
    // Manejo de errores...
  }
};
```

### 3. API de Notificaciones

La API `/api/notifications` maneja la creación de notificaciones:

```typescript
// POST /api/notifications
export async function POST(request: NextRequest) {
  try {
    const body: CreateNotificationRequest = await request.json();
    const { type, data, recipients } = body;

    // Validar que el tipo existe
    if (!isValidNotificationType(type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tipo de notificación no válido',
          details: `El tipo '${type}' no está registrado en el sistema`
        },
        { status: 400 }
      );
    }

    const template = getNotificationTemplate(type);
    
    // Determinar destinatarios
    let finalRecipients = recipients || template.getRecipients(data);
    
    // Si no hay destinatarios específicos, obtener todos los usuarios activos
    if (finalRecipients.length === 0) {
      const { data: allUsers, success } = await supabaseService.getAllUsuarios();
      if (success && allUsers) {
        finalRecipients = allUsers
          .filter(user => user.activo)
          .map(user => user.id);
      }
    }

    // Construir notificaciones para cada destinatario
    const notifications = finalRecipients.map(userId => ({
      user_id: userId,
      type,
      title: buildTitle(template.title, data),
      message: buildMessage(template.message, data),
      priority: template.priority,
      icon: template.icon,
      action_url: buildActionUrl(template.actionUrl, data),
      data: JSON.stringify(data),
      status: 'unread',
      created_at: new Date().toISOString()
    }));

    // Insertar notificaciones en lote
    const { error } = await supabaseService.createNotifications(notifications);

    if (error) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Error al crear notificaciones en la base de datos',
          details: error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones creadas exitosamente para ${notifications.length} usuarios`,
      notifications_created: notifications.length,
      type,
      recipients: finalRecipients
    });

  } catch (error) {
    console.error('Error en endpoint de notificaciones:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
```

### 4. Tipos de Notificaciones Disponibles

El sistema incluye los siguientes tipos de notificaciones:

#### Usuarios
- `user_created` - Nuevo usuario creado
- `user_updated` - Usuario actualizado
- `user_deleted` - Usuario eliminado
- `user_status_changed` - Estado de usuario cambiado

#### Contactos
- `contact_created` - Nuevo contacto agregado
- `contact_updated` - Contacto actualizado
- `contact_deleted` - Contacto eliminado

#### Espacios de Trabajo
- `workspace_created` - Nuevo espacio de trabajo
- `workspace_updated` - Espacio de trabajo actualizado
- `workspace_deleted` - Espacio de trabajo eliminado

#### Embudos
- `funnel_created` - Nuevo embudo creado
- `funnel_updated` - Embudo actualizado
- `funnel_deleted` - Embudo eliminado

#### Respuestas Rápidas
- `quick_response_created` - Nueva respuesta rápida
- `quick_response_updated` - Respuesta rápida actualizada
- `quick_response_deleted` - Respuesta rápida eliminada

### 5. Ejemplos de Uso en Diferentes Contextos

#### Crear Notificación al Eliminar un Contacto
```typescript
await supabaseService.createNotification({
  type: 'contact_deleted',
  data: {
    contact_name: 'Juan Pérez',
    deleted_by: currentUserId
  }
});
```

#### Crear Notificación al Actualizar un Embudo
```typescript
await supabaseService.createNotification({
  type: 'funnel_updated',
  data: {
    funnel_name: 'Ventas Q1',
    updated_by: currentUserId
  }
});
```

#### Crear Notificación con Destinatarios Específicos
```typescript
await supabaseService.createNotification({
  type: 'task_assigned',
  data: {
    task_title: 'Revisar propuesta comercial',
    assigned_to: 123
  },
  recipients: [123, 456, 789] // Sobrescribe la lógica de destinatarios
});
```

### 6. Estructura de Archivos Creada

```
src/
├── app/
│   └── api/
│       └── notifications/
│           ├── route.ts                    # Endpoint principal
│           └── types/
│               └── notification-types.ts   # Tipos y plantillas
├── services/
│   └── supabaseService.ts                 # Extendido con createNotification
└── app/dashboard/configuracion/components/
    └── NuevoUsuarioModal.tsx              # Ejemplo de uso
```

### 7. Próximos Pasos

1. **Crear la tabla `notifications` en Supabase** usando el SQL proporcionado
2. **Implementar el componente de notificaciones** en tiempo real
3. **Agregar notificaciones a otros componentes** (eliminar usuario, crear contacto, etc.)
4. **Implementar sistema de lectura/archivado** de notificaciones
5. **Agregar notificaciones push** para navegadores compatibles