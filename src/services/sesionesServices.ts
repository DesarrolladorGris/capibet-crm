import { SesionData, SesionResponse } from '../app/api/sesiones/domain/sesion';

// Tipos para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Endpoints de la API
const apiEndpoints = {
  sesiones: `${API_BASE_URL}/api/sesiones`,
  sesionesById: (id: number) => `${API_BASE_URL}/api/sesiones/${id}`,
  whatsappSessions: `${API_BASE_URL}/api/whatsapp_sessions`,
};

class SesionesServices {
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
   * Obtiene todas las sesiones del usuario logueado
   */
  async getAllSesiones(): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.sesiones, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching sesiones:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una nueva sesión
   */
  async createSesion(sesionData: SesionData): Promise<ApiResponse<SesionResponse>> {
    try {
      const response = await fetch(apiEndpoints.sesiones, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(sesionData)
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating sesion:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene las sesiones de un embudo específico
   */
  async getSesionesByEmbudo(embudoId: number): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?embudo_id=eq.${embudoId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching sesiones by embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones del embudo',
        details: error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  }

  /**
   * Obtiene las sesiones por tipo
   */
  async getSesionesByType(type: string): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?type=eq.${type}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching sesiones by type:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones por tipo',
        details: error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  }

  /**
   * Obtiene una sesión por ID
   */
  async getSesionById(id: number): Promise<ApiResponse<SesionResponse>> {
    try {
      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching sesion:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una sesión existente
   */
  async updateSesion(id: number, data: Partial<SesionData>): Promise<ApiResponse<SesionResponse>> {
    try {
      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      const result = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating sesion:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina una sesión
   */
  async deleteSesion(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<void>>(response);
      return data;

    } catch (error) {
      console.error('Error deleting sesion:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de sesiones del usuario logueado
   */
  async getSesionesCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllSesiones();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de sesiones'
      };

    } catch (error) {
      console.error('Error counting sesiones:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar sesiones',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene sesiones de Gmail por email
   */
  async getSesionesGmailByEmail(email: string): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?type=eq.gmail&email=eq.${email}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching Gmail sesiones by email:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones de Gmail',
        details: error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  }

  /**
   * Obtiene sesiones de WhatsApp por session UUID
   * Primero busca en whatsapp_sessions por session_id, luego busca en sesiones por el id de whatsapp_session
   */
  async getSesionesWhatsAppBySession(whatsappSession: string): Promise<ApiResponse<SesionResponse[]>> {
    try {
      // Primero buscar la whatsapp_session por session_id para obtener su ID
      const whatsappResponse = await fetch(`${apiEndpoints.whatsappSessions}?session_id=eq.${whatsappSession}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!whatsappResponse.ok) {
        return {
          success: false,
          error: 'Error al buscar sesión de WhatsApp',
          data: []
        };
      }

      const whatsappData = await this.handleResponse<ApiResponse<{ id: number; session_id: string }[]>>(whatsappResponse);
      
      if (!whatsappData.success || !whatsappData.data || whatsappData.data.length === 0) {
        return {
          success: false,
          error: 'Sesión de WhatsApp no encontrada',
          data: []
        };
      }

      const whatsappSessionId = whatsappData.data[0].id;
      
      // Ahora buscar en sesiones usando el ID de la whatsapp_session
      const response = await fetch(`${apiEndpoints.sesiones}?whatsapp_session=eq.${whatsappSessionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching WhatsApp sesiones by session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones de WhatsApp',
        details: error instanceof Error ? error.message : 'Error desconocido',
        data: []
      };
    }
  }

  /**
   * Actualiza el estado de una sesión
   */
  async updateSesionEstado(id: number, estado: string): Promise<ApiResponse<SesionResponse>> {
    try {
      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ estado })
      });

      const result = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating sesion estado:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar estado de sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza la sesión de WhatsApp
   */
  async updateWhatsAppSession(id: number, whatsappSession: string): Promise<ApiResponse<SesionResponse>> {
    try {
      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          whatsapp_session: whatsappSession
        })
      });

      const result = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating WhatsApp session:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar sesión de WhatsApp',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza información de perfil (email, nombre, picture)
   */
  async updateProfileInfo(id: number, email?: string, givenName?: string, picture?: string): Promise<ApiResponse<SesionResponse>> {
    try {
      const updateData: any = {};
      if (email !== undefined) updateData.email = email;
      if (givenName !== undefined) updateData.given_name = givenName;
      if (picture !== undefined) updateData.picture = picture;

      const response = await fetch(apiEndpoints.sesionesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      });

      const result = await this.handleResponse<ApiResponse<SesionResponse>>(response);
      return result;

    } catch (error) {
      console.error('Error updating profile info:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar información de perfil',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const sesionesServices = new SesionesServices();

// Exportar también la clase para casos especiales
export default SesionesServices;
