// Tipos de datos para chats
export interface ChatData {
  sesion_id: number;
  contact_id: number;
}

export interface ChatResponse {
  id: number;
  sesion_id: number;
  contact_id: number;
  created_at: string;
}

// Tipos para las respuestas de la API
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Tipo específico para la respuesta de eliminación de chat
interface DeleteChatResponse {
  message: string;
  mensajesEliminados: number;
}

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Endpoints de la API
const apiEndpoints = {
  chats: `${API_BASE_URL}/api/chats`,
  chatsById: (id: number) => `${API_BASE_URL}/api/chats/${id}`
};

class ChatServices {
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
   * Obtiene todos los chats
   */
  async getAllChats(): Promise<ApiResponse<ChatResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.chats, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<ChatResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching chats:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener chats',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo chat
   */
  async createChat(chatData: ChatData): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await fetch(apiEndpoints.chats, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(chatData)
      });

      const data = await this.handleResponse<ApiResponse<ChatResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un chat existente
   */
  async updateChat(chatData: Partial<ChatData> & { id: number }): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await fetch(apiEndpoints.chats, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(chatData)
      });

      const data = await this.handleResponse<ApiResponse<ChatResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un chat
   */
  async deleteChat(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.chats}?id=${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un chat específico por ID
   */
  async getChatById(id: number): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await fetch(apiEndpoints.chatsById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<ChatResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un chat específico por ID
   */
  async updateChatById(id: number, chatData: Partial<ChatData>): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await fetch(apiEndpoints.chatsById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(chatData)
      });

      const data = await this.handleResponse<ApiResponse<ChatResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un chat específico por ID (incluye eliminación en cascada de mensajes)
   */
  async deleteChatById(id: number): Promise<ApiResponse<DeleteChatResponse>> {
    try {
      const response = await fetch(apiEndpoints.chatsById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<DeleteChatResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error deleting chat:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar chat',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de chats
   */
  async getChatsCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllChats();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de chats'
      };

    } catch (error) {
      console.error('Error counting chats:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar chats',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene chats por sesión
   */
  async getChatsBySesion(sesionId: number): Promise<ApiResponse<ChatResponse[]>> {
    try {
      const response = await this.getAllChats();
      
      if (response.success && Array.isArray(response.data)) {
        const chatsBySesion = response.data.filter(chat => chat.sesion_id === sesionId);
        return {
          success: true,
          data: chatsBySesion
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener chats por sesión'
      };

    } catch (error) {
      console.error('Error fetching chats by session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener chats por sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene chats por contacto
   */
  async getChatsByContact(contactId: number): Promise<ApiResponse<ChatResponse[]>> {
    try {
      const response = await this.getAllChats();
      
      if (response.success && Array.isArray(response.data)) {
        const chatsByContact = response.data.filter(chat => chat.contact_id === contactId);
        return {
          success: true,
          data: chatsByContact
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener chats por contacto'
      };

    } catch (error) {
      console.error('Error fetching chats by contact:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener chats por contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const chatServices = new ChatServices();

// Exportar también la clase para casos especiales
export default ChatServices;
