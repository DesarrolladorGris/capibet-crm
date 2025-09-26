# Endpoint de Eliminación de Sesiones con Desconexión Automática

## Descripción

El endpoint `DELETE /api/sesiones/[id]` ahora incluye funcionalidad automática para desconectar sesiones de WhatsApp QR antes de eliminarlas. Cuando se elimina una sesión del tipo `whatsapp_qr`, el sistema:

1. **Desconecta automáticamente** la sesión en el orquestador de WhatsApp
2. **Elimina** la `whatsapp_session` de la base de datos
3. **Elimina** todos los chats y mensajes asociados
4. **Elimina** la sesión principal

## Endpoint

```
DELETE /api/sesiones/[id]
```

## Parámetros

- `id` (path): ID numérico de la sesión a eliminar

## Flujo de Eliminación

### Para Sesiones WhatsApp QR

1. **Validación**: Verifica que la sesión existe y es del tipo `whatsapp_qr`
2. **Obtención de datos**: Obtiene la `whatsapp_session` asociada
3. **Desconexión en orquestador**: 
   - Verifica que la sesión esté conectada (`status: 'connected'`)
   - Envía petición POST al orquestador: `/sessions/{session_id}/disconnect`
4. **Eliminación en cascada**:
   - Elimina todos los mensajes de los chats
   - Elimina todos los chats de la sesión
   - Elimina la `whatsapp_session` de la base de datos
   - Elimina la sesión principal

### Para Otros Tipos de Sesión

- Elimina directamente chats, mensajes y la sesión (sin desconexión)

## Respuestas

### Éxito (200) - Sesión WhatsApp QR

```json
{
  "success": true,
  "data": {
    "message": "Sesión 47 eliminada exitosamente",
    "deletedChats": 5,
    "deletedMessages": "Todos los mensajes de los chats fueron eliminados",
    "deletedWhatsAppSession": true,
    "sessionType": "whatsapp_qr",
    "orchestratorDisconnect": {
      "success": true,
      "message": "Sesión desconectada correctamente"
    }
  }
}
```

### Éxito (200) - Otros Tipos de Sesión

```json
{
  "success": true,
  "data": {
    "message": "Sesión 48 eliminada exitosamente",
    "deletedChats": 3,
    "deletedMessages": "Todos los mensajes de los chats fueron eliminados",
    "deletedWhatsAppSession": false,
    "sessionType": "gmail",
    "orchestratorDisconnect": null
  }
}
```

### Error - ID inválido (400)

```json
{
  "success": false,
  "error": "ID de sesión inválido"
}
```

### Error - Sesión no encontrada (404)

```json
{
  "success": false,
  "error": "Sesión no encontrada"
}
```

## Logs del Servidor

### Desconexión Exitosa
```
✅ Sesión session_1234567890_abc123 desconectada del orquestador: { success: true, message: "Sesión desconectada correctamente" }
✅ WhatsApp session 15 eliminada de la base de datos
```

### Sesión No Conectada
```
ℹ️ Sesión WhatsApp 15 no está conectada o no tiene session_id, omitiendo desconexión
✅ WhatsApp session 15 eliminada de la base de datos
```

### Error en Desconexión
```
⚠️ Error al desconectar sesión session_1234567890_abc123 del orquestador: Error de conexión al orquestador
✅ WhatsApp session 15 eliminada de la base de datos
```

## Uso desde el Frontend

```typescript
import { sesionesServices } from '@/services/sesionesServices';

// Eliminar una sesión (con desconexión automática si es whatsapp_qr)
const deleteSession = async (sessionId: number) => {
  try {
    const result = await sesionesServices.deleteSesion(sessionId);
    
    if (result.success) {
      console.log('Sesión eliminada:', result.data);
      
      // Verificar si hubo desconexión en el orquestador
      if (result.data?.orchestratorDisconnect) {
        console.log('Desconexión del orquestador:', result.data.orchestratorDisconnect);
      }
    } else {
      console.error('Error al eliminar sesión:', result.error);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};
```

## Configuración del Orquestador

La funcionalidad utiliza la configuración del orquestador definida en `src/config/whatsapp_api.ts`:

```typescript
export const WHATSAPP_CONFIG = {
  ORCHESTRATOR_BASE_URL: process.env.WHATSAPP_ORCHESTRATOR_URL || 'http://localhost:3000',
  DISCONNECT_SESSION_ENDPOINT: '/sessions',
  REQUEST_TIMEOUT: 30000,
};
```

## Variables de Entorno

- `WHATSAPP_ORCHESTRATOR_URL`: URL base del orquestador de WhatsApp (opcional, por defecto: http://localhost:3000)

## Características Importantes

1. **Desconexión Automática**: Solo para sesiones `whatsapp_qr` conectadas
2. **Eliminación Robusta**: Continúa aunque falle la desconexión en el orquestador
3. **Logs Detallados**: Información completa sobre el proceso de eliminación
4. **Respuesta Informativa**: Incluye detalles sobre la desconexión del orquestador
5. **Manejo de Errores**: No falla la eliminación si el orquestador no está disponible

## Casos de Uso

### Caso 1: Sesión WhatsApp QR Conectada
- ✅ Desconecta en orquestador
- ✅ Elimina whatsapp_session
- ✅ Elimina chats y mensajes
- ✅ Elimina sesión principal

### Caso 2: Sesión WhatsApp QR Desconectada
- ⏭️ Omite desconexión (ya está desconectada)
- ✅ Elimina whatsapp_session
- ✅ Elimina chats y mensajes
- ✅ Elimina sesión principal

### Caso 3: Orquestador No Disponible
- ⚠️ Log de error de desconexión
- ✅ Elimina whatsapp_session
- ✅ Elimina chats y mensajes
- ✅ Elimina sesión principal

### Caso 4: Otros Tipos de Sesión
- ⏭️ Omite proceso de desconexión
- ✅ Elimina chats y mensajes
- ✅ Elimina sesión principal
