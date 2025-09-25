import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, downloadMediaMessage } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

/**
 * Gestor de múltiples sesiones de WhatsApp
 */
export class SessionManager {
    constructor(options = {}) {
        this.sessions = new Map(); // Map<sessionId, SessionData>
        this.options = {
            downloadMedia: false,
            onStatusChange: null,
            onMessage: null,
            onQRUpdate: null,
            baseAuthPath: './auth_sessions',
            autoRestoreSessions: true, // Nueva opción para restaurar sesiones automáticamente
            ...options
        };
        
        // Crear directorio base de autenticación si no existe
        if (!fs.existsSync(this.options.baseAuthPath)) {
            fs.mkdirSync(this.options.baseAuthPath, { recursive: true });
        }
    }

    /**
     * Crea una nueva sesión de WhatsApp
     * @param {Object} sessionConfig - Configuración de la sesión
     * @param {string} sessionConfig.sessionId - ID único de la sesión
     * @param {string} sessionConfig.phoneNumber - Número de teléfono
     * @param {string} sessionConfig.authFolderPath - Ruta de la carpeta de autenticación
     * @param {number} sessionConfig.serverPort - Puerto del servidor (opcional)
     * @returns {Promise<Object>} Resultado de la creación
     */
    async createSession(sessionConfig) {
        const { sessionId, phoneNumber, authFolderPath, serverPort } = sessionConfig;

        if (this.sessions.has(sessionId)) {
            throw new Error(`La sesión ${sessionId} ya existe`);
        }

        console.log(`=== CREANDO NUEVA SESIÓN ===`);
        console.log(`Session ID: ${sessionId}`);
        console.log(`Phone Number: ${phoneNumber}`);
        console.log(`Auth Path: ${authFolderPath}`);

        const sessionData = {
            sessionId,
            phoneNumber,
            authFolderPath,
            serverPort,
            sock: null,
            qrCodeData: null,
            status: 'disconnected', // 'connected', 'disconnected', 'connecting', 'error'
            lastSeen: null,
            whatsappUserId: null,
            connectedUserPhoneNumber: null, // Número del usuario que se conectó
            createdAt: new Date(),
            reconnectAttempts: 0,
            maxReconnectAttempts: 5
        };

        this.sessions.set(sessionId, sessionData);

        try {
            await this.connectSession(sessionId);
            return {
                success: true,
                sessionId,
                message: 'Sesión creada exitosamente'
            };
        } catch (error) {
            this.sessions.delete(sessionId);
            throw error;
        }
    }

    /**
     * Conecta una sesión específica a WhatsApp
     * @param {string} sessionId - ID de la sesión
     */
    async connectSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Sesión ${sessionId} no encontrada`);
        }

        console.log(`=== CONECTANDO SESIÓN ${sessionId} ===`);
        
        // Actualizar estado
        sessionData.status = 'connecting';
        this._notifyStatusChange(sessionId, 'connecting');

        try {
            // Crear directorio de autenticación si no existe
            const authPath = sessionData.authFolderPath;
            if (!fs.existsSync(authPath)) {
                fs.mkdirSync(authPath, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(authPath);
            const { version, isLatest } = await fetchLatestBaileysVersion();
            
            console.log(`[${sessionId}] Usando WhatsApp v${version.join('.')}, es la última: ${isLatest}`);

            const sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false // Deshabilitamos QR en terminal para múltiples sesiones
            });

            sessionData.sock = sock;

            // Event: Actualización de conexión
            sock.ev.on('connection.update', async (update) => {
                await this._handleConnectionUpdate(sessionId, update);
            });

            // Event: Actualización de credenciales
            sock.ev.on('creds.update', async () => {
                console.log(`[${sessionId}] === CREDENCIALES ACTUALIZADAS ===`);
                await saveCreds();
                console.log(`[${sessionId}] Credenciales guardadas correctamente`);
            });

            // Event: Mensajes recibidos
            sock.ev.on('messages.upsert', async (m) => {
                await this._handleMessage(sessionId, m);
            });

            // Event: Presencia actualizada
            sock.ev.on('presence.update', (presence) => {
                console.log(`[${sessionId}] === ACTUALIZACIÓN DE PRESENCIA ===`);
                console.log(`[${sessionId}] Información de presencia:`, presence);
            });

        } catch (error) {
            console.log(`[${sessionId}] Error al conectar:`, error);
            sessionData.status = 'error';
            this._notifyStatusChange(sessionId, 'error', error.message);
            throw error;
        }
    }

    /**
     * Maneja las actualizaciones de conexión de una sesión
     */
    async _handleConnectionUpdate(sessionId, update) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) return;

        const { connection, lastDisconnect, qr } = update;
        
        console.log(`[${sessionId}] === ACTUALIZACIÓN DE CONEXIÓN ===`);
        console.log(`[${sessionId}] Estado de conexión:`, connection);
        
        if (qr) {
            console.log(`[${sessionId}] === NUEVO QR GENERADO ===`);
            sessionData.qrCodeData = qr;
            console.log(`[${sessionId}] QR Code data:`, qr);
            
            // Notificar QR actualizado
            this._notifyQRUpdate(sessionId, qr);
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`[${sessionId}] === CONEXIÓN CERRADA ===`);
            console.log(`[${sessionId}] ¿Debería reconectar?`, shouldReconnect);
            console.log(`[${sessionId}] Información del último desconectado:`, lastDisconnect);
            
            sessionData.status = 'disconnected';
            sessionData.lastSeen = new Date();
            this._notifyStatusChange(sessionId, 'disconnected');
            
            if (shouldReconnect && sessionData.reconnectAttempts < sessionData.maxReconnectAttempts) {
                console.log(`[${sessionId}] Reconectando... (intento ${sessionData.reconnectAttempts + 1})`);
                sessionData.reconnectAttempts++;
                setTimeout(() => {
                    this.connectSession(sessionId).catch(console.error);
                }, 5000); // Esperar 5 segundos antes de reconectar
            } else {
                console.log(`[${sessionId}] No se reconectará automáticamente`);
                sessionData.qrCodeData = null;
                // Mantener el estado como 'disconnected' en lugar de cambiarlo a 'error'
                console.log(`[${sessionId}] Estado mantenido como: disconnected`);
            }
        } else if (connection === 'open') {
            console.log(`[${sessionId}] === CONEXIÓN ESTABLECIDA ===`);
            console.log(`[${sessionId}] WhatsApp conectado exitosamente!`);
            console.log(`[${sessionId}] Información del socket:`, {
                user: sessionData.sock.user,
                authState: sessionData.sock.authState
            });
            
            // Extraer número de teléfono del usuario conectado
            const userInfo = sessionData.sock.user;
            let connectedUserPhoneNumber = null;
            if (userInfo?.id) {
                // El ID viene en formato como "5491234567890:1@s.whatsapp.net"
                connectedUserPhoneNumber = userInfo.id.split(':')[0];
                console.log(`[${sessionId}] Número de teléfono del usuario conectado: ${connectedUserPhoneNumber}`);
                console.log(`[${sessionId}] Número configurado para la sesión: ${sessionData.phoneNumber}`);
                
                // Actualizar el phoneNumber de la sesión con el número real del usuario conectado
                // Esto es importante para que no se envíe null al backend
                if (connectedUserPhoneNumber) {
                    sessionData.phoneNumber = connectedUserPhoneNumber;
                    console.log(`[${sessionId}] Phone number actualizado: ${sessionData.phoneNumber}`);
                }
            }
            
            sessionData.status = 'connected';
            sessionData.lastSeen = new Date();
            sessionData.qrCodeData = null;
            sessionData.reconnectAttempts = 0;
            sessionData.whatsappUserId = userInfo?.id || null;
            sessionData.connectedUserPhoneNumber = connectedUserPhoneNumber;
            
            // Notificar conexión exitosa con datos completos
            this._notifyNewSessionConnected(sessionId);
        }
    }

    /**
     * Maneja los mensajes recibidos en una sesión
     */
    async _handleMessage(sessionId, m) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) return;
        
        const message = m.messages[0];
        
        // FILTRO: Solo procesar mensajes entrantes
        if (!this._isValidIncomingMessage(message)) {
            console.log(`[${sessionId}] === MENSAJE FILTRADO (NO ES MENSAJE ENTRANTE) ===`);
            console.log(`[${sessionId}] Tipo de mensaje filtrado:`, this._getMessageType(message));
            return;
        }

        console.log(`[${sessionId}] === MENSAJE PROCESADO ===`);
        console.log(`[${sessionId}] Información completa del mensaje:`, JSON.stringify(m, null, 2));
        
        console.log(`[${sessionId}] === DETALLES DEL MENSAJE ===`);
        
        // Extraer información del remitente y destinatario
        const remoteJid = message.key.remoteJid;
        const participant = message.key.participant || remoteJid;
        const fromMe = message.key.fromMe;
        
        // === INFORMACIÓN DEL REMITENTE Y DESTINATARIO ===
        let senderName = 'Desconocido';
        let senderPhoneNumber = null;
        let senderAccountType = 'unknown';
        let recipientInfo = null;
        
        if (fromMe) {
            // MENSAJE ENVIADO POR NOSOTROS (fromMe: true)
            // Remitente: Nuestra sesión
            // Destinatario: El remoteJid (a quien le enviamos)
            
            senderName = sessionData.sock?.user?.name || sessionData.sock?.user?.pushName || 'Usuario Sesión';
            senderPhoneNumber = sessionData.phoneNumber;
            senderAccountType = 'session';
            
            // El destinatario es el remoteJid
            const recipientPhoneNumber = this._extractPhoneNumberFromJid(remoteJid);
            recipientInfo = {
                name: null, // Se obtendrá más abajo
                phoneNumber: recipientPhoneNumber,
                whatsappId: remoteJid,
                accountType: 'external',
                sessionId: null
            };
            
            console.log(`[${sessionId}] MENSAJE ENVIADO POR SESIÓN: ${senderPhoneNumber} -> ${recipientPhoneNumber}`);
            
        } else {
            // MENSAJE RECIBIDO (fromMe: false) 
            // Remitente: El participant o remoteJid (quien nos envía)
            // Destinatario: Nuestra sesión
            
            senderPhoneNumber = this._extractPhoneNumberFromJid(participant);
            
            if (remoteJid.includes('@lid')) {
                senderAccountType = 'lid_account';
            } else if (remoteJid.includes('@s.whatsapp.net')) {
                senderAccountType = 'personal';
            } else if (remoteJid.includes('@g.us')) {
                senderAccountType = 'group';
            } else {
                senderAccountType = 'other';
            }
            
            // El destinatario es nuestra sesión
            recipientInfo = this._extractRecipientInfo(sessionId, message);
            
            console.log(`[${sessionId}] MENSAJE RECIBIDO: ${senderPhoneNumber} -> ${recipientInfo.phoneNumber}`);
        }
        
        try {
            if (fromMe) {
                // Para mensajes enviados por nosotros, intentar obtener info del destinatario
                if (recipientInfo.phoneNumber && this._isValidPhoneNumber(recipientInfo.phoneNumber)) {
                    try {
                        const contact = await sessionData.sock.onWhatsApp(recipientInfo.phoneNumber);
                        console.log(`[${sessionId}] Información del contacto destinatario:`, contact);
                        
                        // Intentar obtener el nombre del contacto desde la libreta
                        if (contact && contact.length > 0) {
                            // También intentar obtener el nombre desde los contactos
                            try {
                                const contactInfo = await sessionData.sock.getBusinessProfile(recipientInfo.whatsappId);
                                if (contactInfo?.profile?.description) {
                                    recipientInfo.name = contactInfo.profile.description;
                                }
                            } catch (profileError) {
                                // No pasa nada si no se puede obtener el perfil
                            }
                        }
                        
                        // Si aún no tenemos nombre, usar el número
                        if (!recipientInfo.name) {
                            recipientInfo.name = recipientInfo.phoneNumber;
                        }
                    } catch (contactError) {
                        console.log(`[${sessionId}] Error obteniendo info del contacto destinatario ${recipientInfo.phoneNumber}:`, contactError.message);
                        recipientInfo.name = recipientInfo.phoneNumber; // Usar número como fallback
                    }
                }
            } else {
                // Para mensajes recibidos, obtener info del remitente  
                if (message.pushName) {
                    senderName = message.pushName;
                }
                
                if (senderPhoneNumber && this._isValidPhoneNumber(senderPhoneNumber)) {
                    try {
                        const contact = await sessionData.sock.onWhatsApp(senderPhoneNumber);
                        console.log(`[${sessionId}] Información del contacto remitente:`, contact);
                    } catch (contactError) {
                        console.log(`[${sessionId}] Error obteniendo info del contacto remitente ${senderPhoneNumber}:`, contactError.message);
                    }
                }
            }
        } catch (error) {
            console.log(`[${sessionId}] Error al obtener información del contacto:`, error);
            // Asegurar que tenemos un nombre para el destinatario en caso de error
            if (fromMe && !recipientInfo.name) {
                recipientInfo.name = recipientInfo.phoneNumber;
            }
        }
        
        // Procesar contenido del mensaje
        const messageInfo = this._processMessageContent(message);
        
        // Crear objeto de datos del mensaje con información completa
        const messageData = {
            // Información de la sesión (destinatario)
            sessionId,
            recipientPhoneNumber: sessionData.phoneNumber,
            recipientWhatsappId: sessionData.whatsappUserId,
            
            // Información del remitente (quien envía el mensaje)
            senderName,
            senderPhoneNumber,
            senderAccountType,
            senderJid: participant, // El JID del remitente
            senderParticipant: participant,
            
            // Información del destinatario (a quién se envía)
            recipientInfo,
            
            // Información del chat/conversación
            chatJid: remoteJid,
            
            // Contenido del mensaje
            messageContent: messageInfo.content,
            messageType: messageInfo.type,
            mediaInfo: messageInfo.mediaInfo,
            
            // Metadatos
            timestamp: new Date(),
            rawMessage: message
        };

        console.log(`[${sessionId}] === DATOS DEL MENSAJE ===`);
        console.log(`[${sessionId}] Dirección: ${fromMe ? 'SALIENTE' : 'ENTRANTE'} (fromMe: ${fromMe})`);
        console.log(`[${sessionId}] Remitente: ${senderName} (${senderPhoneNumber}) - Tipo: ${senderAccountType}`);
        console.log(`[${sessionId}] Destinatario: ${recipientInfo.name} (${recipientInfo.phoneNumber})`);
        console.log(`[${sessionId}] Contenido: ${messageInfo.content}`);
        console.log(`[${sessionId}] Tipo de mensaje: ${messageInfo.type}`);

        // Notificar mensaje recibido
        this._notifyMessage(sessionId, messageData);

        // Opcional: Descargar archivo multimedia si está habilitado
        if (this.options.downloadMedia && ['image', 'video', 'audio', 'sticker', 'document'].includes(messageInfo.type)) {
            await this._downloadMediaFile(sessionId, message, messageInfo, senderPhoneNumber);
        }
    }

    /**
     * Extrae el número de teléfono de cualquier tipo de JID
     */
    _extractPhoneNumberFromJid(jid) {
        if (!jid) return null;
        
        // Para JIDs que contienen números de teléfono
        // Ejemplos:
        // "5491234567890@s.whatsapp.net" -> "5491234567890"
        // "126224911302675@lid" -> "126224911302675"
        // "5491234567890:1@s.whatsapp.net" -> "5491234567890"
        
        // Dividir por '@' para separar el identificador del dominio
        const parts = jid.split('@');
        if (parts.length < 2) return null;
        
        const identifier = parts[0];
        
        // Si contiene ':' (como en "5491234567890:1"), tomar solo la parte antes del ':'
        if (identifier.includes(':')) {
            return identifier.split(':')[0];
        }
        
        return identifier;
    }

    /**
     * Valida si un string es un número de teléfono válido
     */
    _isValidPhoneNumber(phoneNumber) {
        if (!phoneNumber) return false;
        
        // Verificar que sea un string que contenga solo dígitos
        // Los números de teléfono pueden tener prefijos como +54, 54, etc.
        const phoneRegex = /^[\d+]+$/;
        return phoneRegex.test(phoneNumber) && phoneNumber.length >= 7 && phoneNumber.length <= 20;
    }

    /**
     * Extrae información del destinatario del mensaje
     */
    _extractRecipientInfo(sessionId, message) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            return {
                name: 'Sesión no encontrada',
                phoneNumber: null,
                whatsappId: null,
                accountType: 'unknown'
            };
        }

        // El destinatario es la cuenta de la sesión actual
        const recipientInfo = {
            name: sessionData.sock?.user?.name || 'Usuario',
            phoneNumber: sessionData.connectedUserPhoneNumber || sessionData.phoneNumber,
            whatsappId: sessionData.whatsappUserId,
            accountType: 'session', // Tipo especial para indicar que es la sesión receptora
            sessionId: sessionId,
            authPath: sessionData.authFolderPath,
            status: sessionData.status,
            configuredPhoneNumber: sessionData.phoneNumber // Número original configurado
        };

        // Intentar obtener más información del usuario de la sesión
        if (sessionData.sock?.user) {
            const user = sessionData.sock.user;
            recipientInfo.pushName = user.pushName;
            
            // Usar el nombre real del usuario de la sesión, no del remitente
            recipientInfo.name = user.name || user.pushName || 'Usuario';
            
            // NO sobrescribir el phoneNumber - mantener el original de la sesión
            // El phoneNumber ya está correctamente asignado desde sessionData.phoneNumber
        }

        return recipientInfo;
    }

    /**
     * Valida si un mensaje debe procesarse (solo conversaciones individuales, excluye grupos)
     */
    _isValidIncomingMessage(message) {
        // Verificar que el mensaje tenga la estructura básica
        if (!message || !message.key || !message.message) {
            return false;
        }

        // Verificar que tenga un remoteJid válido (conversación real)
        if (!message.key.remoteJid || message.key.remoteJid === 'status@broadcast') {
            return false;
        }

        // Verificar que el remoteJid sea de una conversación individual solamente
        // Excluir grupos, estados de contactos y otros tipos de mensajes del sistema
        const remoteJid = message.key.remoteJid;
        
        // Excluir mensajes de grupos
        if (remoteJid.includes('@g.us')) {
            return false;
        }
        
        // Excluir mensajes de estado de contactos
        if (remoteJid.includes('@broadcast') || 
            remoteJid.includes('@newsletter') ||
            remoteJid === 'status@broadcast') {
            return false;
        }

        // Verificar que el mensaje tenga contenido real
        const messageContent = message.message;
        if (!messageContent || Object.keys(messageContent).length === 0) {
            return false;
        }

        // Verificar que no sea un mensaje de protocolo interno
        if (messageContent.protocolMessage || 
            messageContent.senderKeyDistributionMessage ||
            messageContent.deviceSentMessage) {
            return false;
        }

        return true;
    }

    /**
     * Obtiene el tipo de mensaje para logging
     */
    _getMessageType(message) {
        if (!message || !message.message) {
            return 'sin_contenido';
        }

        const messageContent = message.message;
        const types = Object.keys(messageContent);
        
        if (types.length === 0) {
            return 'vacío';
        }

        // Identificar tipos específicos que queremos filtrar
        if (messageContent.protocolMessage) {
            return 'protocolo_interno';
        }
        
        if (messageContent.senderKeyDistributionMessage) {
            return 'distribucion_clave';
        }
        
        if (messageContent.deviceSentMessage) {
            return 'dispositivo_enviado';
        }

        return types.join(', ');
    }

    /**
     * Procesa el contenido de un mensaje y extrae la información relevante
     */
    _processMessageContent(message) {
        let messageContent = '';
        let messageType = 'text';
        let mediaInfo = {};
        
        if (message.message) {
            if (message.message.conversation) {
                messageContent = message.message.conversation;
                messageType = 'text';
            } else if (message.message.extendedTextMessage) {
                messageContent = message.message.extendedTextMessage.text;
                messageType = 'text';
            } else if (message.message.imageMessage) {
                const imageMsg = message.message.imageMessage;
                messageContent = imageMsg.caption || '[Imagen]';
                messageType = 'image';
                mediaInfo = {
                    url: imageMsg.url,
                    mimetype: imageMsg.mimetype,
                    fileLength: imageMsg.fileLength,
                    width: imageMsg.width,
                    height: imageMsg.height,
                    fileSha256: imageMsg.fileSha256,
                    mediaKey: imageMsg.mediaKey,
                    directPath: imageMsg.directPath,
                    jpegThumbnail: imageMsg.jpegThumbnail ? '[Thumbnail Base64]' : null
                };
            } else if (message.message.videoMessage) {
                const videoMsg = message.message.videoMessage;
                messageContent = videoMsg.caption || '[Video]';
                messageType = 'video';
                mediaInfo = {
                    url: videoMsg.url,
                    mimetype: videoMsg.mimetype,
                    fileLength: videoMsg.fileLength,
                    seconds: videoMsg.seconds,
                    fileSha256: videoMsg.fileSha256,
                    mediaKey: videoMsg.mediaKey,
                    directPath: videoMsg.directPath
                };
            } else if (message.message.audioMessage) {
                const audioMsg = message.message.audioMessage;
                messageContent = '[Audio]';
                messageType = 'audio';
                mediaInfo = {
                    url: audioMsg.url,
                    mimetype: audioMsg.mimetype,
                    fileLength: audioMsg.fileLength,
                    seconds: audioMsg.seconds,
                    ptt: audioMsg.ptt,
                    fileSha256: audioMsg.fileSha256,
                    mediaKey: audioMsg.mediaKey,
                    directPath: audioMsg.directPath,
                    waveform: audioMsg.waveform
                };
            } else if (message.message.stickerMessage) {
                const stickerMsg = message.message.stickerMessage;
                messageContent = '[Sticker]';
                messageType = 'sticker';
                mediaInfo = {
                    url: stickerMsg.url,
                    mimetype: stickerMsg.mimetype,
                    fileLength: stickerMsg.fileLength,
                    fileSha256: stickerMsg.fileSha256,
                    mediaKey: stickerMsg.mediaKey,
                    directPath: stickerMsg.directPath,
                    isAnimated: stickerMsg.isAnimated,
                    isAvatar: stickerMsg.isAvatar,
                    isAiSticker: stickerMsg.isAiSticker,
                    isLottie: stickerMsg.isLottie,
                    firstFrameLength: stickerMsg.firstFrameLength
                };
            } else if (message.message.documentMessage) {
                const docMsg = message.message.documentMessage;
                messageContent = `[Documento: ${docMsg.fileName || 'Sin nombre'}]`;
                messageType = 'document';
                mediaInfo = {
                    url: docMsg.url,
                    mimetype: docMsg.mimetype,
                    fileLength: docMsg.fileLength,
                    fileName: docMsg.fileName,
                    fileSha256: docMsg.fileSha256,
                    mediaKey: docMsg.mediaKey,
                    directPath: docMsg.directPath
                };
            } else if (message.message.contactMessage) {
                const contactMsg = message.message.contactMessage;
                messageContent = `[Contacto: ${contactMsg.displayName}]`;
                messageType = 'contact';
                mediaInfo = {
                    displayName: contactMsg.displayName,
                    vcard: contactMsg.vcard
                };
            } else if (message.message.locationMessage) {
                const locationMsg = message.message.locationMessage;
                messageContent = '[Ubicación]';
                messageType = 'location';
                mediaInfo = {
                    latitude: locationMsg.degreesLatitude,
                    longitude: locationMsg.degreesLongitude,
                    name: locationMsg.name,
                    address: locationMsg.address
                };
            } else {
                messageContent = '[Mensaje no soportado]';
                messageType = 'unknown';
                console.log('=== TIPO DE MENSAJE NO RECONOCIDO ===');
                console.log('Tipos disponibles en message:', Object.keys(message.message));
            }
        }

        return {
            content: messageContent,
            type: messageType,
            mediaInfo
        };
    }

    /**
     * Descarga archivos multimedia
     */
    async _downloadMediaFile(sessionId, message, messageInfo, senderNumber) {
        try {
            console.log(`[${sessionId}] === INICIANDO DESCARGA DE ARCHIVO ===`);
            
            // Crear directorio de descargas específico para la sesión
            const downloadsDir = `./downloads/${sessionId}`;
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }
            
            // Descargar el archivo
            const buffer = await downloadMediaMessage(message, 'buffer', {});
            
            if (buffer) {
                // Generar nombre único para el archivo
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const extension = this._getFileExtension(messageInfo.mediaInfo.mimetype || 'application/octet-stream');
                const fileName = `${messageInfo.type}_${timestamp}_${senderNumber}${extension}`;
                const filePath = path.join(downloadsDir, fileName);
                
                // Guardar archivo
                fs.writeFileSync(filePath, buffer);
                
                console.log(`[${sessionId}] === ARCHIVO DESCARGADO ===`);
                console.log(`[${sessionId}] Archivo guardado en:`, filePath);
                console.log(`[${sessionId}] Tamaño descargado:`, buffer.length, 'bytes');
                console.log(`[${sessionId}] Tamaño esperado:`, messageInfo.mediaInfo.fileLength, 'bytes');
            } else {
                console.log(`[${sessionId}] No se pudo descargar el archivo - buffer vacío`);
            }
            
        } catch (error) {
            console.log(`[${sessionId}] Error al descargar archivo:`, error.message);
            console.log(`[${sessionId}] Stack trace:`, error.stack);
        }
    }

    /**
     * Obtiene la extensión de archivo basada en el MIME type
     */
    _getFileExtension(mimeType) {
        const mimeToExt = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'video/mp4': '.mp4',
            'video/3gpp': '.3gp',
            'video/quicktime': '.mov',
            'audio/ogg': '.ogg',
            'audio/mpeg': '.mp3',
            'audio/mp4': '.m4a',
            'audio/aac': '.aac',
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/zip': '.zip',
            'text/plain': '.txt'
        };
        
        return mimeToExt[mimeType] || '.bin';
    }

    /**
     * Envía un mensaje desde una sesión específica
     */
    async sendMessage(sessionId, number, message) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Sesión ${sessionId} no encontrada`);
        }

        if (sessionData.status !== 'connected' || !sessionData.sock) {
            throw new Error(`Sesión ${sessionId} no está conectada`);
        }

        // Formatear número
        const formattedNumber = number.includes('@') ? number : `${number}@s.whatsapp.net`;
        
        console.log(`[${sessionId}] === ENVIANDO MENSAJE ===`);
        console.log(`[${sessionId}] Número destino:`, formattedNumber);
        console.log(`[${sessionId}] Mensaje:`, message);
        
        // Verificar si el número existe en WhatsApp
        const [result] = await sessionData.sock.onWhatsApp(number);
        if (!result?.exists) {
            throw new Error('El número no tiene WhatsApp');
        }
        
        // Enviar mensaje
        const sent = await sessionData.sock.sendMessage(formattedNumber, { text: message });
        
        console.log(`[${sessionId}] === MENSAJE ENVIADO ===`);
        console.log(`[${sessionId}] Respuesta del envío:`, sent);
        
        return {
            messageId: sent.key.id,
            timestamp: sent.messageTimestamp,
            to: formattedNumber
        };
    }

    /**
     * Obtiene el código QR de una sesión
     */
    async getQRCode(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Sesión ${sessionId} no encontrada`);
        }

        if (sessionData.status === 'connected') {
            throw new Error('WhatsApp ya está conectado en esta sesión');
        }
        
        if (!sessionData.qrCodeData) {
            throw new Error('No hay código QR disponible. La sesión puede necesitar reiniciarse.');
        }
        
        // Generar QR como imagen base64
        const qrImage = await QRCode.toDataURL(sessionData.qrCodeData);
        
        return {
            qr: qrImage,
            qrText: sessionData.qrCodeData
        };
    }

    /**
     * Reinicia una sesión específica
     */
    async restartSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            throw new Error(`Sesión ${sessionId} no encontrada`);
        }

        console.log(`[${sessionId}] === REINICIANDO SESIÓN ===`);
        
        if (sessionData.sock) {
            sessionData.sock.end();
        }
        
        sessionData.status = 'disconnected';
        sessionData.qrCodeData = null;
        sessionData.reconnectAttempts = 0;
        
        this._notifyStatusChange(sessionId, 'disconnected');
        
        // Esperar un momento antes de reconectar
        setTimeout(() => {
            this.connectSession(sessionId).catch(console.error);
        }, 2000);
    }

    /**
     * Elimina una sesión
     */
    async removeSession(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            return false;
        }

        console.log(`[${sessionId}] === ELIMINANDO SESIÓN ===`);
        
        if (sessionData.sock) {
            sessionData.sock.end();
        }
        
        this.sessions.delete(sessionId);
        this._notifyStatusChange(sessionId, 'disconnected');
        
        return true;
    }

    /**
     * Obtiene el estado de una sesión específica
     */
    getSessionStatus(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData) {
            return null;
        }

        return {
            sessionId: sessionData.sessionId,
            phoneNumber: sessionData.phoneNumber,
            status: sessionData.status,
            lastSeen: sessionData.lastSeen,
            whatsappUserId: sessionData.whatsappUserId,
            hasQR: !!sessionData.qrCodeData,
            user: sessionData.sock?.user || null,
            createdAt: sessionData.createdAt,
            reconnectAttempts: sessionData.reconnectAttempts
        };
    }

    /**
     * Obtiene el estado de todas las sesiones
     */
    getAllSessionsStatus() {
        const sessionsStatus = [];
        for (const [sessionId, sessionData] of this.sessions) {
            sessionsStatus.push(this.getSessionStatus(sessionId));
        }
        return sessionsStatus;
    }

    /**
     * Notifica cambios de estado a través del callback
     */
    _notifyStatusChange(sessionId, status, error = null) {
        if (this.options.onStatusChange) {
            this.options.onStatusChange(sessionId, status, error);
        }
    }

    /**
     * Notifica mensajes recibidos a través del callback
     */
    _notifyMessage(sessionId, messageData) {
        if (this.options.onMessage) {
            this.options.onMessage(sessionId, messageData);
        }
    }

    /**
     * Notifica actualizaciones de QR a través del callback
     */
    _notifyQRUpdate(sessionId, qrData) {
        if (this.options.onQRUpdate) {
            this.options.onQRUpdate(sessionId, qrData);
        }
    }

    /**
     * Notifica nueva sesión conectada con datos completos
     */
    _notifyNewSessionConnected(sessionId) {
        if (this.options.onNewSessionConnected) {
            const sessionData = this.sessions.get(sessionId);
            if (sessionData) {
                this.options.onNewSessionConnected(sessionId, sessionData);
            }
        }
    }

    /**
     * Activa/desactiva la descarga automática de archivos
     */
    setDownloadMedia(enabled) {
        this.options.downloadMedia = enabled;
        console.log('=== CONFIGURACIÓN GLOBAL DE DESCARGA ===');
        console.log('Descarga automática:', enabled ? 'ACTIVADA' : 'DESACTIVADA');
    }

    /**
     * Verifica si una sesión está conectada
     */
    isSessionConnected(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        return sessionData?.status === 'connected';
    }

    /**
     * Obtiene la información del usuario de una sesión conectada
     */
    getSessionUser(sessionId) {
        const sessionData = this.sessions.get(sessionId);
        if (!sessionData || sessionData.status !== 'connected') {
            return null;
        }
        return sessionData.sock?.user || null;
    }

    /**
     * Detecta sesiones existentes en el directorio de autenticación
     * @returns {Array} Lista de sessionIds encontrados
     */
    detectExistingSessions() {
        const existingSessions = [];
        
        try {
            if (!fs.existsSync(this.options.baseAuthPath)) {
                console.log('[SESSION RESTORE] No existe directorio de autenticación');
                return existingSessions;
            }

            const authDirs = fs.readdirSync(this.options.baseAuthPath, { withFileTypes: true });
            
            for (const dir of authDirs) {
                if (dir.isDirectory()) {
                    const sessionId = dir.name;
                    const sessionPath = path.join(this.options.baseAuthPath, sessionId);
                    
                    // Verificar si tiene archivos de autenticación válidos
                    if (this._hasValidAuthFiles(sessionPath)) {
                        existingSessions.push(sessionId);
                        console.log(`[SESSION RESTORE] Sesión detectada: ${sessionId}`);
                    }
                }
            }
            
            console.log(`[SESSION RESTORE] Total de sesiones detectadas: ${existingSessions.length}`);
            return existingSessions;
            
        } catch (error) {
            console.error('[SESSION RESTORE] Error detectando sesiones existentes:', error.message);
            return existingSessions;
        }
    }

    /**
     * Verifica si un directorio de sesión tiene archivos de autenticación válidos
     * @param {string} sessionPath - Ruta del directorio de la sesión
     * @returns {boolean} True si tiene archivos válidos
     */
    _hasValidAuthFiles(sessionPath) {
        try {
            const files = fs.readdirSync(sessionPath);
            
            // Verificar archivos esenciales de autenticación de Baileys
            const requiredFiles = ['creds.json'];
            const hasRequiredFiles = requiredFiles.some(file => files.includes(file));
            
            // Verificar que tenga al menos algunos archivos de sesión
            const hasSessionFiles = files.some(file => 
                file.startsWith('session-') || 
                file.startsWith('pre-key-') || 
                file.startsWith('app-state-sync-key-')
            );
            
            return hasRequiredFiles && hasSessionFiles;
            
        } catch (error) {
            console.log(`[SESSION RESTORE] Error verificando archivos en ${sessionPath}:`, error.message);
            return false;
        }
    }

    /**
     * Restaura una sesión existente desde archivos de autenticación
     * @param {string} sessionId - ID de la sesión a restaurar
     * @returns {Promise<Object>} Resultado de la restauración
     */
    async restoreSession(sessionId) {
        try {
            console.log(`[SESSION RESTORE] Restaurando sesión: ${sessionId}`);
            
            const authFolderPath = path.join(this.options.baseAuthPath, sessionId);
            
            // Verificar que el directorio existe y tiene archivos válidos
            if (!fs.existsSync(authFolderPath) || !this._hasValidAuthFiles(authFolderPath)) {
                throw new Error(`Sesión ${sessionId} no tiene archivos de autenticación válidos`);
            }

            // Crear objeto de datos de sesión para restauración
            const sessionData = {
                sessionId,
                phoneNumber: null, // Se detectará al conectar
                authFolderPath,
                serverPort: null,
                sock: null,
                qrCodeData: null,
                status: 'disconnected',
                lastSeen: null,
                whatsappUserId: null,
                connectedUserPhoneNumber: null, // Número del usuario que se conectó
                createdAt: new Date(), // Usar fecha actual para sesiones restauradas
                reconnectAttempts: 0,
                maxReconnectAttempts: 5
            };

            // Agregar a la colección de sesiones
            this.sessions.set(sessionId, sessionData);
            
            // Intentar conectar la sesión
            await this.connectSession(sessionId);
            
            console.log(`[SESSION RESTORE] Sesión ${sessionId} restaurada exitosamente`);
            return {
                success: true,
                sessionId,
                message: 'Sesión restaurada exitosamente'
            };
            
        } catch (error) {
            console.error(`[SESSION RESTORE] Error restaurando sesión ${sessionId}:`, error.message);
            
            // Limpiar la sesión si falló la restauración
            this.sessions.delete(sessionId);
            
            return {
                success: false,
                sessionId,
                error: error.message
            };
        }
    }

    /**
     * Restaura todas las sesiones existentes automáticamente
     * @returns {Promise<Object>} Resultado de la restauración masiva
     */
    async restoreAllSessions() {
        if (!this.options.autoRestoreSessions) {
            console.log('[SESSION RESTORE] Restauración automática deshabilitada');
            return { success: true, restored: 0, failed: 0 };
        }

        console.log('[SESSION RESTORE] === INICIANDO RESTAURACIÓN DE SESIONES ===');
        
        const existingSessions = this.detectExistingSessions();
        
        if (existingSessions.length === 0) {
            console.log('[SESSION RESTORE] No se encontraron sesiones para restaurar');
            return { success: true, restored: 0, failed: 0 };
        }

        const results = {
            success: true,
            restored: 0,
            failed: 0,
            details: []
        };

        // Restaurar sesiones en paralelo (con límite de concurrencia)
        const concurrencyLimit = 3;
        const chunks = [];
        
        for (let i = 0; i < existingSessions.length; i += concurrencyLimit) {
            chunks.push(existingSessions.slice(i, i + concurrencyLimit));
        }

        for (const chunk of chunks) {
            const promises = chunk.map(async (sessionId) => {
                const result = await this.restoreSession(sessionId);
                return { sessionId, result };
            });

            const chunkResults = await Promise.all(promises);
            
            for (const { sessionId, result } of chunkResults) {
                if (result.success) {
                    results.restored++;
                    console.log(`[SESSION RESTORE] ✅ ${sessionId} restaurada`);
                } else {
                    results.failed++;
                    console.log(`[SESSION RESTORE] ❌ ${sessionId} falló: ${result.error}`);
                }
                results.details.push({ sessionId, ...result });
            }
        }

        console.log(`[SESSION RESTORE] === RESTAURACIÓN COMPLETADA ===`);
        console.log(`[SESSION RESTORE] Restauradas: ${results.restored}`);
        console.log(`[SESSION RESTORE] Fallidas: ${results.failed}`);
        
        return results;
    }

    /**
     * Inicializa el SessionManager y restaura sesiones existentes
     * @returns {Promise<Object>} Resultado de la inicialización
     */
    async initialize() {
        console.log('[SESSION MANAGER] === INICIALIZANDO SESSION MANAGER ===');
        
        try {
            const restoreResult = await this.restoreAllSessions();
            
            console.log('[SESSION MANAGER] === INICIALIZACIÓN COMPLETADA ===');
            return {
                success: true,
                message: 'SessionManager inicializado correctamente',
                restoreResult
            };
            
        } catch (error) {
            console.error('[SESSION MANAGER] Error durante inicialización:', error.message);
            return {
                success: false,
                message: 'Error durante inicialización',
                error: error.message
            };
        }
    }
}
