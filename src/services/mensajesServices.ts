import { MensajeData, MensajeResponse } from '../app/api/mensajes/domain/mensaje';

// Tipos para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Tipos para filtros de mensajes
interface MensajeFilters {
  chat_id?: number;
  contacto_id?: number;
  remitente_id?: number;
  type?: string;
  limit?: number;
  offset?: number;
}

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Endpoints de la API
const apiEndpoints = {
  mensajes: `${API_BASE_URL}/api/mensajes`,
  mensajesById: (id: number) => `${API_BASE_URL}/api/mensajes/${id}`
};

class MensajesServices {
  /**
   * Obtiene los headers para las peticiones
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Maneja la respuesta de la API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error del servidor: ${response.status} ${response.statusText} - ${errorData}`);
    }
    
    return await response.json();
  }

  /**
   * Crea un nuevo mensaje
   */
  async createMensaje(mensajeData: MensajeData): Promise<ApiResponse<MensajeResponse>> {
    try {
      console.log('Datos recibidos para crear mensaje:', mensajeData);
      
      const dataToSend = {
        remitente_id: mensajeData.remitente_id,
        contacto_id: mensajeData.contacto_id,
        chat_id: mensajeData.chat_id,
        type: mensajeData.type,
        content: mensajeData.content,
        creado_en: mensajeData.creado_en || new Date().toISOString()
      };

      console.log('Datos a enviar:', dataToSend);
      console.log('URL:', apiEndpoints.mensajes);
      console.log('Headers:', this.getHeaders());

      const response = await fetch(apiEndpoints.mensajes, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      const data = await this.handleResponse<ApiResponse<MensajeResponse>>(response);
      
      // Log para debugging
      console.log('Mensaje creado exitosamente:', data);
      
      return data;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al crear mensaje',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  /**
   * Obtiene todos los mensajes con filtros opcionales
   */
  async getAllMensajes(filters?: MensajeFilters): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      // Construir query string para filtros
      let queryString = '';
      const filterParams = [];
      
      if (filters) {
        if (filters.chat_id) filterParams.push(`chat_id=${filters.chat_id}`);
        if (filters.contacto_id) filterParams.push(`contacto_id=${filters.contacto_id}`);
        if (filters.remitente_id) filterParams.push(`remitente_id=${filters.remitente_id}`);
        if (filters.type) filterParams.push(`type=${filters.type}`);
        if (filters.limit) filterParams.push(`limit=${filters.limit}`);
        if (filters.offset) filterParams.push(`offset=${filters.offset}`);
        
        if (filterParams.length > 0) {
          queryString = '?' + filterParams.join('&');
        }
      }

      const response = await fetch(`${apiEndpoints.mensajes}${queryString}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      const data = await this.handleResponse<ApiResponse<MensajeResponse[]>>(response);
      
      console.log('📋 Mensajes obtenidos del API:', data);
      
      return data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un mensaje por ID
   */
  async getMensajeById(id: number): Promise<ApiResponse<MensajeResponse>> {
    try {
      const response = await fetch(apiEndpoints.mensajesById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<MensajeResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching message:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un mensaje existente
   */
  async updateMensaje(id: number, mensajeData: Partial<MensajeData>): Promise<ApiResponse<MensajeResponse>> {
    try {
      console.log('Actualizando mensaje:', id, mensajeData);

      const response = await fetch(apiEndpoints.mensajesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(mensajeData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await this.handleResponse<ApiResponse<MensajeResponse>>(response);
      console.log('Mensaje actualizado exitosamente');

      return data;

    } catch (error) {
      console.error('Error al actualizar mensaje:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene mensajes por chat
   */
  async getMensajesByChat(chatId: number, limit?: number, offset?: number): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      return await this.getAllMensajes({
        chat_id: chatId,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error al obtener mensajes por chat:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes por chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene mensajes por contacto
   */
  async getMensajesByContacto(contactoId: number, limit?: number, offset?: number): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      return await this.getAllMensajes({
        contacto_id: contactoId,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error al obtener mensajes por contacto:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes por contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene mensajes por remitente
   */
  async getMensajesByRemitente(remitenteId: number, limit?: number, offset?: number): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      return await this.getAllMensajes({
        remitente_id: remitenteId,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error al obtener mensajes por remitente:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes por remitente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene mensajes por tipo
   */
  async getMensajesByType(type: string, limit?: number, offset?: number): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      return await this.getAllMensajes({
        type,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error al obtener mensajes por tipo:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes por tipo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el historial de mensajes de un chat con paginación
   */
  async getHistorialChat(chatId: number, page: number = 1, pageSize: number = 50): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      const offset = (page - 1) * pageSize;
      return await this.getMensajesByChat(chatId, pageSize, offset);
    } catch (error) {
      console.error('Error al obtener historial de chat:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener historial de chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un mensaje por ID
   */
  async deleteMensaje(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('Eliminando mensaje con ID:', id);

      const response = await fetch(apiEndpoints.mensajesById(id), {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      console.log('Mensaje eliminado exitosamente');

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un mensaje de texto
   */
  async enviarMensajeTexto(
    remitenteId: number, 
    contactoId: number, 
    chatId: number, 
    texto: string,
    tipoSesion: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook'
  ): Promise<ApiResponse<MensajeResponse>> {
    try {
      const mensajeData: MensajeData = {
        remitente_id: remitenteId,
        contacto_id: contactoId,
        chat_id: chatId,
        type: tipoSesion,
        content: {
          text: texto,
          message_type: 'text'
        }
      };

      return await this.createMensaje(mensajeData);
    } catch (error) {
      console.error('Error al enviar mensaje de texto:', error);
      return { 
        success: false, 
        error: 'Error al enviar mensaje de texto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un mensaje con archivo multimedia
   */
  async enviarMensajeMultimedia(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    tipoSesion: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook',
    messageType: 'image' | 'video' | 'audio' | 'document',
    mediaUrl: string,
    fileName?: string,
    fileSize?: number,
    mediaType?: string
  ): Promise<ApiResponse<MensajeResponse>> {
    try {
      const mensajeData: MensajeData = {
        remitente_id: remitenteId,
        contacto_id: contactoId,
        chat_id: chatId,
        type: tipoSesion,
        content: {
          message_type: messageType,
          media_url: mediaUrl,
          media_type: mediaType,
          file_name: fileName,
          file_size: fileSize
        }
      };

      return await this.createMensaje(mensajeData);
    } catch (error) {
      console.error('Error al enviar mensaje multimedia:', error);
      return { 
        success: false, 
        error: 'Error al enviar mensaje multimedia',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un mensaje de ubicación
   */
  async enviarMensajeUbicacion(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    tipoSesion: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook',
    latitude: number,
    longitude: number,
    address?: string
  ): Promise<ApiResponse<MensajeResponse>> {
    try {
      const mensajeData: MensajeData = {
        remitente_id: remitenteId,
        contacto_id: contactoId,
        chat_id: chatId,
        type: tipoSesion,
        content: {
          message_type: 'location',
          location: {
            latitude,
            longitude,
            address
          }
        }
      };

      return await this.createMensaje(mensajeData);
    } catch (error) {
      console.error('Error al enviar mensaje de ubicación:', error);
      return { 
        success: false, 
        error: 'Error al enviar mensaje de ubicación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un mensaje de contacto
   */
  async enviarMensajeContacto(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    tipoSesion: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook',
    contactName: string,
    contactPhone?: string,
    contactEmail?: string
  ): Promise<ApiResponse<MensajeResponse>> {
    try {
      const mensajeData: MensajeData = {
        remitente_id: remitenteId,
        contacto_id: contactoId,
        chat_id: chatId,
        type: tipoSesion,
        content: {
          message_type: 'contact',
          contact: {
            name: contactName,
            phone: contactPhone,
            email: contactEmail
          }
        }
      };

      return await this.createMensaje(mensajeData);
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error);
      return { 
        success: false, 
        error: 'Error al enviar mensaje de contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Envía un mensaje de texto por WhatsApp QR
   */
  async enviarMensajeWhatsAppQR(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'whatsapp_qr');
  }

  /**
   * Envía un mensaje de texto por WhatsApp API
   */
  async enviarMensajeWhatsAppAPI(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'whatsapp_api');
  }

  /**
   * Envía un mensaje de texto por Messenger
   */
  async enviarMensajeMessenger(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'messenger');
  }

  /**
   * Envía un mensaje de texto por Instagram
   */
  async enviarMensajeInstagram(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'instagram');
  }

  /**
   * Envía un mensaje de texto por Telegram
   */
  async enviarMensajeTelegram(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'telegram');
  }

  /**
   * Envía un mensaje de texto por Telegram Bot
   */
  async enviarMensajeTelegramBot(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'telegram_bot');
  }

  /**
   * Envía un mensaje de texto por Gmail
   */
  async enviarMensajeGmail(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'gmail');
  }

  /**
   * Envía un mensaje de texto por Outlook
   */
  async enviarMensajeOutlook(
    remitenteId: number,
    contactoId: number,
    chatId: number,
    texto: string
  ): Promise<ApiResponse<MensajeResponse>> {
    return this.enviarMensajeTexto(remitenteId, contactoId, chatId, texto, 'outlook');
  }
}

// Exportar una instancia singleton del servicio
export const mensajesServices = new MensajesServices();

// Exportar también la clase para casos especiales
export default MensajesServices;
