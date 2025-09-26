import { 
  WhatsAppSessionData, 
  WhatsAppSessionResponse,
  CreateWhatsAppSessionData,
  ApiResponse
} from '../app/api/whatsapp_sessions/domain/whatsapp_session';

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Endpoints de la API
const apiEndpoints = {
  whatsappSessions: `${API_BASE_URL}/api/whatsapp_sessions`,
  whatsappSessionsById: (id: number) => `${API_BASE_URL}/api/whatsapp_sessions/${id}`,
  newSessionConnected: `${API_BASE_URL}/api/whatsapp_sessions/new-session-connected`,
  disconnectSession: (id: number) => `${API_BASE_URL}/api/whatsapp_sessions/${id}/disconnect`,
};

class WhatsAppSessionsServices {
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
   * Obtiene todas las sesiones de WhatsApp
   */
  async getAllWhatsAppSessions(): Promise<ApiResponse<WhatsAppSessionResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessions, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching WhatsApp sessions:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones de WhatsApp',
        data: []
      };
    }
  }

  /**
   * Crea una nueva sesión de WhatsApp en estado pending
   */
  async createWhatsAppSession(sessionData: CreateWhatsAppSessionData): Promise<ApiResponse<WhatsAppSessionResponse>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessions, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sessionData)
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear sesión de WhatsApp'
      };
    }
  }

  /**
   * Obtiene una sesión de WhatsApp por ID
   */
  async getWhatsAppSessionById(id: number): Promise<ApiResponse<WhatsAppSessionResponse>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessionsById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesión de WhatsApp'
      };
    }
  }

  /**
   * Obtiene sesiones de WhatsApp por sesion_id
   */
  async getWhatsAppSessionsBySesionId(sesionId: number): Promise<ApiResponse<WhatsAppSessionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.whatsappSessions}?sesion_id=eq.${sesionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching WhatsApp sessions by sesion_id:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones de WhatsApp',
        data: []
      };
    }
  }

  /**
   * Obtiene sesiones de WhatsApp por session_id del orquestador
   */
  async getWhatsAppSessionBySessionId(sessionId: string): Promise<ApiResponse<WhatsAppSessionResponse>> {
    try {
      const response = await fetch(`${apiEndpoints.whatsappSessions}?session_id=eq.${sessionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse[]>>(response);
      
      if (data.success && data.data && data.data.length > 0) {
        return {
          success: true,
          data: data.data[0]
        };
      }

      return {
        success: false,
        error: 'Sesión de WhatsApp no encontrada'
      };

    } catch (error) {
      console.error('Error fetching WhatsApp session by session_id:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesión de WhatsApp'
      };
    }
  }

  /**
   * Actualiza una sesión de WhatsApp
   */
  async updateWhatsAppSession(id: number, data: Partial<WhatsAppSessionData>): Promise<ApiResponse<WhatsAppSessionResponse>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessionsById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const result = await this.handleResponse<ApiResponse<WhatsAppSessionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar sesión de WhatsApp'
      };
    }
  }

  /**
   * Elimina una sesión de WhatsApp
   */
  async deleteWhatsAppSession(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessionsById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<void>>(response);
      return data;

    } catch (error) {
      console.error('Error deleting WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar sesión de WhatsApp'
      };
    }
  }

  /**
   * Actualiza el estado de una sesión de WhatsApp
   */
  async updateStatus(id: number, status: 'connected' | 'disconnected' | 'expired' | 'pending'): Promise<ApiResponse<WhatsAppSessionResponse>> {
    try {
      const response = await fetch(apiEndpoints.whatsappSessionsById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          status,
          updated_at: new Date().toISOString()
        })
      });

      const result = await this.handleResponse<ApiResponse<WhatsAppSessionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating WhatsApp session status:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar estado de sesión de WhatsApp'
      };
    }
  }

  /**
   * Obtiene el conteo de sesiones de WhatsApp activas
   */
  async getActiveSessions(): Promise<ApiResponse<WhatsAppSessionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.whatsappSessions}?status=eq.connected`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching active WhatsApp sessions:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones activas de WhatsApp',
        data: []
      };
    }
  }

  /**
   * Obtiene sesiones de WhatsApp por estado
   */
  async getSessionsByStatus(status: 'connected' | 'disconnected' | 'expired' | 'pending'): Promise<ApiResponse<WhatsAppSessionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.whatsappSessions}?status=eq.${status}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<WhatsAppSessionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error(`Error fetching WhatsApp sessions with status ${status}:`, error);
      
      return {
        success: false,
        error: `Error de conexión al obtener sesiones de WhatsApp con estado ${status}`,
        data: []
      };
    }
  }

  /**
   * Desconecta una sesión de WhatsApp QR
   */
  async disconnectSession(id: number): Promise<ApiResponse<{
    session_id: string;
    orchestrator_disconnect: {
      success: boolean;
      message: string;
    };
    updated_session?: WhatsAppSessionResponse;
  }>> {
    try {
      const response = await fetch(apiEndpoints.disconnectSession(id), {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<{
        session_id: string;
        orchestrator_disconnect: {
          success: boolean;
          message: string;
        };
        updated_session?: WhatsAppSessionResponse;
      }>>(response);
      return data;

    } catch (error) {
      console.error('Error disconnecting WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al desconectar sesión de WhatsApp'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const whatsappSessionsServices = new WhatsAppSessionsServices();

// Exportar también la clase para casos especiales
export default WhatsAppSessionsServices;
