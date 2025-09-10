import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// Tipos para respuestas rápidas
export interface RespuestaRapida {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at?: string;
  creado_por?: number; // ID del usuario que creó esta respuesta rápida
}

export interface RespuestaRapidaFormData {
  titulo: string;
  contenido: string;
  categoria: string;
}

export class RespuestasRapidasService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene el ID del usuario actualmente logueado
   */
  private getCurrentUserId(): number | null {
    return getCurrentUserId();
  }

  private async handleResponse(response: Response): Promise<Record<string, unknown> | null> {
    // Manejar respuesta JSON de forma segura
    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: 'Operation completed successfully' };
        }
      } else {
        data = { message: 'Operation completed successfully' };
      }
    } else {
      data = { message: 'Operation completed successfully' };
    }
    
    return data;
  }

  /**
   * Obtiene todas las respuestas rápidas del usuario logueado
   */
  async getAllRespuestasRapidas(): Promise<ApiResponse<RespuestaRapida[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar respuestas rápidas por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?creado_por=eq.${userId}&order=created_at.desc`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error al obtener respuestas rápidas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Obtiene una respuesta rápida por ID (solo del usuario logueado)
   */
  async getRespuestaRapidaById(id: number): Promise<ApiResponse<RespuestaRapida>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      return { success: true, data: Array.isArray(data) ? data[0] : null };
    } catch (error) {
      console.error('Error al obtener respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Crea una nueva respuesta rápida
   */
  async createRespuestaRapida(data: RespuestaRapidaFormData): Promise<ApiResponse> {
    try {
      // Obtener el ID del usuario logueado como creador
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const response = await fetch(apiEndpoints.respuestasRapidas, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          activa: true,
          creado_por: userId // Asignar el creador
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al crear respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Actualiza una respuesta rápida existente (solo del usuario logueado)
   */
  async updateRespuestaRapida(id: number, data: Partial<RespuestaRapida>): Promise<ApiResponse> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Actualizar solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Elimina una respuesta rápida (solo del usuario logueado)
   */
  async deleteRespuestaRapida(id: number): Promise<ApiResponse> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Cambia el estado activo/inactivo de una respuesta rápida (solo del usuario logueado)
   */
  async toggleRespuestaRapidaStatus(id: number, activa: boolean): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Cambiar estado solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ activa }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar estado de respuesta rápida:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al cambiar estado de respuesta rápida'
      };
    }
  }

  /**
   * Obtiene el conteo de respuestas rápidas del usuario logueado
   */
  async getRespuestasRapidasCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar respuestas rápidas del usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de respuestas rápidas'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting respuestas rápidas:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar respuestas rápidas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const respuestasRapidasService = new RespuestasRapidasService();
