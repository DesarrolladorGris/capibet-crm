import express from 'express';
import cors from 'cors';
import { SessionManager } from './src/SessionManager.js';
import { createBackendNotifier } from './src/BackendNotifier.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar notificador de backend según el entorno
const environment = process.env.NODE_ENV || 'development';
const backendNotifier = createBackendNotifier(environment);

console.log(`=== CONFIGURACIÓN DE BACKEND NOTIFIER ===`);
console.log(`Entorno: ${environment}`);
console.log(`Backend URL: ${backendNotifier.backendBaseUrl}`);

// Instancia del gestor de sesiones
const sessionManager = new SessionManager({
    downloadMedia: false, // Controlado por endpoint
    baseAuthPath: './auth_sessions',
    autoRestoreSessions: true, // Habilitar restauración automática de sesiones
    onStatusChange: async (sessionId, status, error) => {
        console.log(`[CALLBACK] Sesión ${sessionId} cambió estado a: ${status}`);
        if (error) {
            console.log(`[CALLBACK] Error: ${error}`);
        }
        
        // Solo notificar cambios de estado significativos:
        // - Desconexiones (disconnected)
        // - Errores (error) 
        // - Reconexiones de sesiones existentes (connected con phoneNumber ya conocido)
        // NO notificar el estado 'connecting' inicial ni primeras conexiones
        const sessionData = sessionManager.getSessionStatus(sessionId);
        const isExistingSession = sessionData?.phoneNumber !== null && sessionData?.phoneNumber !== undefined;
        
        const shouldNotify = (
            status === 'disconnected' || 
            status === 'error' || 
            (status === 'connected' && isExistingSession)
        );
        
        if (shouldNotify) {
            try {
                console.log(`[CALLBACK] Notificando cambio de estado: ${status} para sesión ${sessionId}`);
                await backendNotifier.notifyStatusChange(sessionId, status, error);
            } catch (err) {
                console.error(`[CALLBACK] Error notificando cambio de estado:`, err.message);
            }
        } else {
            console.log(`[CALLBACK] Omitiendo notificación de estado ${status} para sesión nueva ${sessionId}`);
        }
    },
    onMessage: async (sessionId, messageData) => {
        console.log(`[CALLBACK] Mensaje recibido en sesión ${sessionId}`);
        
        // Incrementar contador de mensajes
        messageCountLastHour++;
        
        // Notificar mensaje al backend principal
        try {
            await backendNotifier.notifyMessageReceived(sessionId, messageData);
        } catch (err) {
            console.error(`[CALLBACK] Error notificando mensaje:`, err.message);
        }
    },
    onQRUpdate: async (sessionId, qrData) => {
        console.log(`[CALLBACK] QR actualizado para sesión ${sessionId}`);
        
        // Solo notificar QR si es una REgeneración (no la primera vez)
        // La primera vez que se genera QR no necesita notificación al backend
        const sessionData = sessionManager.getSessionStatus(sessionId);
        const isRegeneration = sessionData?.phoneNumber !== null && sessionData?.phoneNumber !== undefined;
        
        if (isRegeneration) {
            try {
                console.log(`[CALLBACK] Notificando QR regenerado para sesión existente ${sessionId}`);
                await backendNotifier.notifyQRUpdate(sessionId, qrData);
            } catch (err) {
                console.error(`[CALLBACK] Error notificando QR:`, err.message);
            }
        } else {
            console.log(`[CALLBACK] Omitiendo notificación de QR inicial para sesión nueva ${sessionId}`);
        }
    },
    onNewSessionConnected: async (sessionId, sessionData) => {
        console.log(`[CALLBACK] Nueva sesión conectada: ${sessionId}`);
        console.log(`[CALLBACK] Número de teléfono: ${sessionData.phoneNumber}`);
        
        // Notificar al backend principal con todos los datos necesarios
        try {
            await backendNotifier.notifyNewSessionConnected(sessionId, sessionData);
        } catch (err) {
            console.error(`[CALLBACK] Error notificando nueva sesión conectada:`, err.message);
        }
    }
});

// Métricas para reportar al backend
let messageCountLastHour = 0;
let lastMetricsReport = new Date();

// Resetear contador de mensajes cada hora
setInterval(() => {
    messageCountLastHour = 0;
    lastMetricsReport = new Date();
}, 60 * 60 * 1000); // 1 hora

// Reportar métricas al backend cada 5 minutos
setInterval(async () => {
    try {
        const sessions = sessionManager.getAllSessionsStatus();
        const connectedCount = sessions.filter(s => s.status === 'connected').length;
        
        const metrics = {
            totalSessions: sessions.length,
            connectedSessions: connectedCount,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            messageCountLastHour
        };
        
        await backendNotifier.reportMetrics(metrics);
    } catch (error) {
        console.error('[METRICS] Error reportando métricas:', error.message);
    }
}, 5 * 60 * 1000); // 5 minutos

// =============================================================================
// ENDPOINTS PARA GESTIÓN DE SESIONES
// =============================================================================

/**
 * POST /sessions - Crear una nueva sesión de WhatsApp
 * Body: {
 *   sessionId: string,
 *   phoneNumber: string,
 *   authFolderPath: string,
 *   serverPort?: number
 * }
 */
app.post('/sessions', async (req, res) => {
    try {
        const { sessionId, phoneNumber, authFolderPath, serverPort } = req.body;
        
        if (!sessionId || !phoneNumber || !authFolderPath) {
            return res.status(400).json({
                success: false,
                message: 'sessionId, phoneNumber y authFolderPath son requeridos'
            });
        }

        const result = await sessionManager.createSession({
            sessionId,
            phoneNumber,
            authFolderPath,
            serverPort
        });

        res.json({
            success: true,
            message: 'Sesión creada exitosamente',
            data: result
        });
                
            } catch (error) {
        console.log('Error al crear sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear sesión',
            error: error.message
        });
    }
});

/**
 * GET /sessions - Obtener estado de todas las sesiones
 */
app.get('/sessions', (req, res) => {
    try {
        const sessions = sessionManager.getAllSessionsStatus();
        
    res.json({
            success: true,
            data: sessions,
            count: sessions.length
        });

    } catch (error) {
        console.log('Error al obtener sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener sesiones',
            error: error.message
        });
    }
});

/**
 * GET /sessions/:sessionId - Obtener estado de una sesión específica
 */
app.get('/sessions/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionStatus = sessionManager.getSessionStatus(sessionId);
        
        if (!sessionStatus) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        res.json({
            success: true,
            data: sessionStatus
        });

    } catch (error) {
        console.log('Error al obtener sesión:', error);
        res.status(500).json({
                success: false,
            message: 'Error al obtener sesión',
            error: error.message
        });
    }
});

/**
 * GET /sessions/:sessionId/qr - Obtener código QR de una sesión específica
 */
app.get('/sessions/:sessionId/qr', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const qrData = await sessionManager.getQRCode(sessionId);
        
        res.json({
            success: true,
            data: qrData
        });

    } catch (error) {
        console.log('Error al obtener QR:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener código QR',
            error: error.message
        });
    }
});

/**
 * POST /sessions/:sessionId/send-message - Enviar mensaje desde una sesión específica
 * Body: { number: "5491234567890", message: "Hola mundo" }
 */
app.post('/sessions/:sessionId/send-message', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { number, message } = req.body;
        
        if (!number || !message) {
            return res.status(400).json({
                success: false,
                message: 'Número y mensaje son requeridos'
            });
        }
        
        const result = await sessionManager.sendMessage(sessionId, number, message);

        res.json({
            success: true,
            message: 'Mensaje enviado correctamente',
            data: result
        });

    } catch (error) {
        console.log('Error al enviar mensaje:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar mensaje',
            error: error.message
        });
    }
});

/**
 * POST /sessions/:sessionId/restart - Reiniciar una sesión específica
 */
app.post('/sessions/:sessionId/restart', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        await sessionManager.restartSession(sessionId);

        res.json({
            success: true,
            message: 'Sesión reiniciada exitosamente'
        });

    } catch (error) {
        console.log('Error al reiniciar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reiniciar sesión',
            error: error.message
        });
    }
});

/**
 * DELETE /sessions/:sessionId - Eliminar una sesión específica
 */
app.delete('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const removed = await sessionManager.removeSession(sessionId);
        
        if (!removed) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Sesión eliminada exitosamente'
        });

    } catch (error) {
        console.log('Error al eliminar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar sesión',
            error: error.message
        });
    }
});

// =============================================================================
// ENDPOINT PRINCIPAL: GENERAR QR
// =============================================================================

/**
 * GET /generate-qr - Generar nuevo QR para vincular cuenta de WhatsApp
 * Este endpoint crea automáticamente una sesión temporal y devuelve el QR
 * Cuando el usuario escanea el QR, se notifica al backend con todos los datos
 */
app.get('/generate-qr', async (req, res) => {
    try {
        console.log('=== GENERANDO NUEVO QR ===');
        
        // Generar sessionId único basado en timestamp
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Crear sesión temporal para generar QR
        const authFolderPath = `./auth_sessions/${sessionId}`;
        
        console.log(`Creando sesión temporal: ${sessionId}`);
        console.log(`Auth folder: ${authFolderPath}`);
        
        const result = await sessionManager.createSession({
            sessionId,
            phoneNumber: null, // Se obtiene al conectarse
            authFolderPath,
            serverPort: null
        });

        // Esperar un momento para que se genere el QR
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            try {
                const qrData = await sessionManager.getQRCode(sessionId);
                
                console.log('=== QR GENERADO EXITOSAMENTE ===');
                console.log(`Session ID: ${sessionId}`);
                
                res.json({
                    success: true,
                    sessionId: sessionId,
                    qr: qrData.qr,
                    qrText: qrData.qrText,
                    message: 'QR generado. Escanea con WhatsApp para conectar.'
                });
                
                return;
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    throw error;
                }
                // Esperar 500ms antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

    } catch (error) {
        console.log('Error al generar QR:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar código QR',
            error: error.message
        });
    }
});

// =============================================================================
// ENDPOINTS DE CONFIGURACIÓN GLOBAL
// =============================================================================

/**
 * POST /config/download-media - Activar/desactivar descarga automática global
 * Body: { enabled: boolean }
 */
app.post('/config/download-media', (req, res) => {
    try {
        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'El campo "enabled" debe ser un booleano'
            });
        }

        sessionManager.setDownloadMedia(enabled);

        res.json({
            success: true,
            message: `Descarga automática ${enabled ? 'activada' : 'desactivada'}`,
            downloadEnabled: enabled
        });

    } catch (error) {
        console.log('Error al configurar descarga:', error);
        res.status(500).json({
            success: false,
            message: 'Error al configurar descarga',
            error: error.message
        });
    }
});

/**
 * POST /sessions/restore - Restaurar todas las sesiones existentes manualmente
 */
app.post('/sessions/restore', async (req, res) => {
    try {
        console.log('=== RESTAURACIÓN MANUAL DE SESIONES ===');
        
        const result = await sessionManager.restoreAllSessions();
        
        res.json({
            success: true,
            message: 'Restauración de sesiones completada',
            data: result
        });
        
    } catch (error) {
        console.log('Error al restaurar sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restaurar sesiones',
            error: error.message
        });
    }
});

/**
 * GET /sessions/detect - Detectar sesiones existentes sin restaurarlas
 */
app.get('/sessions/detect', (req, res) => {
    try {
        const existingSessions = sessionManager.detectExistingSessions();
        
        res.json({
            success: true,
            message: 'Detección de sesiones completada',
            data: {
                detectedSessions: existingSessions,
                count: existingSessions.length
            }
        });
        
    } catch (error) {
        console.log('Error al detectar sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al detectar sesiones',
            error: error.message
        });
    }
});

/**
 * GET /health - Endpoint de salud del servicio
 */
app.get('/health', (req, res) => {
    const sessions = sessionManager.getAllSessionsStatus();
    const connectedCount = sessions.filter(s => s.status === 'connected').length;
    
    res.json({
        success: true,
        service: 'WhatsApp Multi-Session Service',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        totalSessions: sessions.length,
        connectedSessions: connectedCount,
        timestamp: new Date().toISOString()
    });
});

// Función para inicializar el servidor
async function initializeServer() {
    try {
        console.log('=== INICIALIZANDO SISTEMA ===');
        
        // Inicializar SessionManager y restaurar sesiones existentes
        const initResult = await sessionManager.initialize();
        
        if (initResult.success) {
            console.log('✅ SessionManager inicializado correctamente');
            if (initResult.restoreResult) {
                console.log(`📊 Sesiones restauradas: ${initResult.restoreResult.restored}`);
                console.log(`❌ Sesiones fallidas: ${initResult.restoreResult.failed}`);
            }
        } else {
            console.error('❌ Error inicializando SessionManager:', initResult.error);
        }
        
        // Iniciar servidor HTTP
        app.listen(PORT, () => {
            console.log(`=== SERVIDOR ORQUESTADOR WHATSAPP INICIADO ===`);
            console.log(`Servidor corriendo en puerto ${PORT}`);
            console.log('');
            console.log('=== ENDPOINT PRINCIPAL ===');
            console.log(`🎯 Generar QR: GET http://localhost:${PORT}/generate-qr`);
            console.log('');
            console.log('=== GESTIÓN DE SESIONES ===');
            console.log(`📊 Listar sesiones: GET http://localhost:${PORT}/sessions`);
            console.log(`📱 Estado sesión: GET http://localhost:${PORT}/sessions/:sessionId`);
            console.log(`📤 Enviar mensaje: POST http://localhost:${PORT}/sessions/:sessionId/send-message`);
            console.log(`🔄 Reiniciar sesión: POST http://localhost:${PORT}/sessions/:sessionId/restart`);
            console.log(`🗑️ Eliminar sesión: DELETE http://localhost:${PORT}/sessions/:sessionId`);
            console.log(`🔍 Detectar sesiones: GET http://localhost:${PORT}/sessions/detect`);
            console.log(`♻️ Restaurar sesiones: POST http://localhost:${PORT}/sessions/restore`);
            console.log('');
            console.log('=== CONFIGURACIÓN Y MONITOREO ===');
            console.log(`⚙️ Health Check: http://localhost:${PORT}/health`);
            console.log(`📥 Configurar descarga: POST http://localhost:${PORT}/config/download-media`);
            console.log('');
            console.log('=== FLUJO SIMPLIFICADO ===');
            console.log('1. GET /generate-qr → Devuelve QR para escanear');
            console.log('2. Usuario escanea QR con WhatsApp');
            console.log('3. Sistema notifica automáticamente datos completos al backend');
            console.log('4. Backend almacena información en tabla whatsapp_sessions');
            console.log('===================================================');
        });
        
    } catch (error) {
        console.error('❌ Error crítico durante inicialización:', error.message);
        process.exit(1);
    }
}

// Inicializar servidor
initializeServer();