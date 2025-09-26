import { supabaseConfig } from '@/config/supabase';

// Tipos para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Tipos para chat interno (basados en la nueva estructura)
interface ChatInternoData {
  id?: number;
  emisor_id: number;
  receptor_id: number;
  estado: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO';
  tema: string;
  created_at?: string;
  updated_at?: string;
}

interface ChatInternoResponse {
  id: number;
  emisor_id: number;
  receptor_id: number;
  estado: string;
  tema: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para mensajes internos
interface MensajeInternoData {
  id?: number;
  chat_interno_id: number;
  mensaje: string;
  emisor: 'emisor' | 'receptor';
  leido?: boolean;
  created_at?: string;
}

interface MensajeInternoResponse {
  id: number;
  created_at: string;
  chat_interno_id: number;
  mensaje: string;
  leido: boolean;
  emisor_id: number;
  receptor_id: number;
}

class ChatInternoServices {
  /**
   * Obtiene los headers para las peticiones directas a Supabase
   */
  private getSupabaseHeaders(): HeadersInit {
    return {
      'apikey': supabaseConfig.serviceRoleKey,
      'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ================================
  // MÉTODOS PARA CHAT_INTERNO
  // ================================

  /**
   * Crea una nueva conversación de chat interno
   * Usa conexión directa a Supabase siguiendo el cURL especificado
   */
  async createChatInterno(data: { emisor_id: number; receptor_id: number; tema: string; estado?: string }): Promise<ApiResponse<ChatInternoResponse>> {
    try {
      // Preparar los datos exactamente como en el cURL
      const chatData = {
        emisor_id: data.emisor_id,
        receptor_id: data.receptor_id,
        estado: data.estado || 'PENDIENTE',
        tema: data.tema
      };

      console.log('🧹 Creando chat interno con datos:', chatData);

      // Realizar la petición POST directa a Supabase
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno`, {
        method: 'POST',
        headers: this.getSupabaseHeaders(),
        body: JSON.stringify(chatData)
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

      // Manejar respuesta exitosa
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          responseData = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          responseData = { success: true, message: 'Conversación creada exitosamente' };
        }
      } else if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { success: true, message: 'Conversación creada exitosamente' };
        }
      } else {
        responseData = { success: true, message: 'Conversación creada exitosamente' };
      }

      console.log('✅ Conversación de chat interno creada exitosamente:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Conversación de chat interno creada exitosamente'
      };

    } catch (error) {
      console.error('❌ Error creating chat interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todas las conversaciones de chat interno
   * Usa conexión directa a Supabase
   */
  async getAllChatInterno(): Promise<ApiResponse<ChatInternoResponse[]>> {
    try {
      console.log('🔍 Obteniendo todas las conversaciones de chat interno...');
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
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

      const data = await response.json();
      console.log('📋 Conversaciones de chat interno obtenidas:', data);

      return {
        success: true,
        data: data as ChatInternoResponse[]
      };

    } catch (error) {
      console.error('❌ Error fetching chat interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener conversaciones de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene una conversación de chat interno por ID
   * Usa conexión directa a Supabase
   */
  async getChatInternoById(id: number): Promise<ApiResponse<ChatInternoResponse>> {
    try {
      console.log(`🔍 Obteniendo conversación ${id}...`);
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno?id=eq.${id}`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await response.json() as ChatInternoResponse[];
      const result = Array.isArray(data) && data.length > 0 ? data[0] : null;
      
      if (!result) {
        return {
          success: false,
          error: 'Conversación no encontrada'
        };
      }

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('❌ Error fetching chat interno by id:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene conversaciones donde el usuario participa (como emisor o receptor)
   * Usa conexión directa a Supabase
   */
  async getChatInternoByUsuario(usuarioId: number): Promise<ApiResponse<ChatInternoResponse[]>> {
    try {
      console.log(`🔍 Obteniendo conversaciones para usuario ${usuarioId}...`);
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno?or=(emisor_id.eq.${usuarioId},receptor_id.eq.${usuarioId})`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await response.json() as ChatInternoResponse[];
      console.log(`📋 Se encontraron ${data.length} conversaciones para el usuario`);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ Error fetching chat interno by usuario:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener conversaciones del usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una conversación de chat interno
   * Usa conexión directa a Supabase
   */
  async updateChatInternoById(id: number, updateData: Partial<ChatInternoData>): Promise<ApiResponse<ChatInternoResponse>> {
    try {
      console.log(`📝 Actualizando conversación ${id} con datos:`, updateData);
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getSupabaseHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      // Para PATCH, Supabase devuelve 204 No Content (sin JSON)
      if (response.status === 204) {
        console.log('✅ Chat interno actualizado exitosamente (204 No Content)');
        return {
          success: true,
          data: updateData as ChatInternoResponse,
          message: 'Chat interno actualizado exitosamente'
        };
      }

      // Si hay respuesta con contenido, procesarla
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json() as ChatInternoResponse[];
        const result = Array.isArray(data) && data.length > 0 ? data[0] : null;
        
        return {
          success: true,
          data: result || updateData as ChatInternoResponse
        };
      } else {
        // Respuesta exitosa sin JSON (casos raros)
        console.log('✅ Chat interno actualizado exitosamente');
        return {
          success: true,
          data: updateData as ChatInternoResponse,
          message: 'Chat interno actualizado exitosamente'
        };
      }

    } catch (error) {
      console.error('❌ Error updating chat interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Finaliza una conversación de chat interno
   * Usa conexión directa a Supabase
   */
  async finalizarChatInterno(id: number): Promise<ApiResponse<ChatInternoResponse>> {
    try {
      console.log(`🔒 Finalizando conversación ${id}...`);
      
      const updateData = {
        estado: 'FINALIZADO' as const
      };

      return await this.updateChatInternoById(id, updateData);

    } catch (error) {
      console.error('❌ Error finalizando chat interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al finalizar conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ================================
  // MÉTODOS PARA MENSAJES_INTERNOS
  // ================================

  /**
   * Crea un nuevo mensaje interno
   * Usa conexión directa a Supabase siguiendo el cURL especificado
   */
  async createMensajeInterno(data: { chat_interno_id: number; mensaje: string; emisor_id: number; receptor_id: number }): Promise<ApiResponse<MensajeInternoResponse>> {
    try {
      console.log('💬 Creando mensaje interno:', data);
      
      // Preparar los datos exactamente como en el cURL especificado
      const mensajeData = {
        chat_interno_id: data.chat_interno_id,
        mensaje: data.mensaje,
        leido: false,
        emisor_id: data.emisor_id,
        receptor_id: data.receptor_id
      };

      // Realizar la petición POST directa a Supabase
      const response = await fetch(`${supabaseConfig.restUrl}/mensajes_internos`, {
        method: 'POST',
        headers: this.getSupabaseHeaders(),
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

      // Manejar respuesta exitosa
      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          responseData = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          responseData = { success: true, message: 'Mensaje creado exitosamente' };
        }
      } else if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { success: true, message: 'Mensaje creado exitosamente' };
        }
      } else {
        responseData = { success: true, message: 'Mensaje creado exitosamente' };
      }

      console.log('✅ Mensaje interno creado exitosamente:', responseData);

      return {
        success: true,
        data: responseData,
        message: 'Mensaje interno creado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error creating mensaje interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear mensaje interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los mensajes de una conversación
   * Usa conexión directa a Supabase
   */
  async getMensajesByChat(chatId: number): Promise<ApiResponse<MensajeInternoResponse[]>> {
    try {
      console.log(`💬 Obteniendo mensajes para conversación ${chatId}...`);
      
      const response = await fetch(`${supabaseConfig.restUrl}/mensajes_internos?chat_interno_id=eq.${chatId}&order=created_at.asc`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await response.json() as MensajeInternoResponse[];
      console.log(`📋 Se encontraron ${data.length} mensajes en la conversación`);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ Error fetching mensajes by chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener mensajes de la conversación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Marca mensajes como leídos en una conversación
   * Usa conexión directa a Supabase
   */
  async marcarMensajesComoLeidos(chatId: number): Promise<ApiResponse<void>> {
    try {
      console.log(`👀 Marcando mensajes como leídos para conversación ${chatId}...`);
      
      const updateData = {
        leido: true
      };

      const response = await fetch(`${supabaseConfig.restUrl}/mensajes_internos?chat_interno_id=eq.${chatId}`, {
        method: 'PATCH',
        headers: this.getSupabaseHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      console.log('✅ Mensajes marcados como leídos exitosamente');

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      console.error('❌ Error marcando mensajes como leídos:', error);
      
      return {
        success: false,
        error: 'Error de conexión al marcar mensajes como leídos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Busca conversaciones por tema
   * Usa conexión directa a Supabase
   */
  async searchChatInternoByTema(tema: string): Promise<ApiResponse<ChatInternoResponse[]>> {
    try {
      console.log(`🔍 Buscando conversaciones por tema: "${tema}"...`);
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno?tema=ilike.*${tema}*`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await response.json() as ChatInternoResponse[];
      console.log(`📋 Se encontraron ${data.length} conversaciones con tema "${tema}"`);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ Error searching chat interno by tema:', error);
      
      return {
        success: false,
        error: 'Error de conexión al buscar conversaciones por tema',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Busca conversaciones por estado
   * Usa conexión directa a Supabase
   */
  async searchChatInternoByEstado(estado: string): Promise<ApiResponse<ChatInternoResponse[]>> {
    try {
      console.log(`🔍 Buscando conversaciones por estado: "${estado}"...`);
      
      const response = await fetch(`${supabaseConfig.restUrl}/chat_interno?estado=eq.${estado}`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await response.json() as ChatInternoResponse[];
      console.log(`📋 Se encontraron ${data.length} conversaciones con estado "${estado}"`);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('❌ Error searching chat interno by estado:', error);
      
      return {
        success: false,
        error: 'Error de conexión al buscar conversaciones por estado',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un chat interno de la base de datos
   * Solo permite eliminar chats PENDIENTE que no tengan mensajes
   */
  async deleteChatInterno(id: number): Promise<ApiResponse<boolean>> {
    try {
      console.log(`🗑️ Eliminando chat interno con ID: ${id}...`);
      
      // Primero verificamos que el chat esté en estado PENDIENTE y no tenga mensajes
      const mensajesCheck = await this.getMensajesByChat(id);
      
      if (!mensajesCheck.success) {
        return {
          success: false,
          error: 'Error al verificar mensajes del chat',
          details: mensajesCheck.error
        };
      }

      if (mensajesCheck.data && mensajesCheck.data.length > 0) {
        return {
          success: false,
          error: 'No se puede eliminar: el chat tiene mensajes',
        };
      }

      // Verificar estado PENDIENTE
      const chatResponse = await fetch(`${supabaseConfig.restUrl}/chat_interno?id=eq.${id}`, {
        method: 'GET',
        headers: this.getSupabaseHeaders()
      });

      if (!chatResponse.ok) {
        return {
          success: false,
          error: `Error del servidor al verificar estado: ${chatResponse.status} ${chatResponse.statusText}`,
        };
      }

      const chatData = await chatResponse.json() as ChatInternoResponse[];
      
      if (!chatData || chatData.length === 0) {
        return {
          success: false,
          error: 'Chat no encontrado',
        };
      }

      if (chatData[0].estado !== 'PENDIENTE') {
        return {
          success: false,
          error: 'Solo se pueden eliminar chats con estado PENDIENTE y sin mensajes',
        };
      }

      // Eliminar el chat
      const deleteResponse = await fetch(`${supabaseConfig.restUrl}/chat_interno?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getSupabaseHeaders()
      });

      console.log('Delete response status:', deleteResponse.status);

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${deleteResponse.status} ${deleteResponse.statusText}`,
          details: errorData
        };
      }

      console.log('✅ Chat interno eliminado exitosamente');

      return {
        success: true,
        data: true,
        message: 'Chat eliminado exitosamente'
      };

    } catch (error) {
      console.error('❌ Error eliminando chat interno:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const chatInternoServices = new ChatInternoServices();

// Exportar también la clase para casos especiales
export default ChatInternoServices;

// Exportar tipos para uso externo
export type { ChatInternoData, ChatInternoResponse, MensajeInternoData, MensajeInternoResponse, ApiResponse };