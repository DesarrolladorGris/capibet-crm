import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';
import { EmbUpdoResponse } from '@/services/embudoServices';
import { EspacioTrabajoData, EspacioTrabajoResponse, ApiResponse } from '@/app/api/espacio_trabajos/domain/espacio_trabajo';

export interface EspacioConEmbudos extends EspacioTrabajoResponse {
  embudos: EmbUpdoResponse[];
}

export class EspacioTrabajoService {
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

  /**
   * Obtiene todos los espacios de trabajo del usuario logueado
   */
  async getAllEspaciosTrabajo(): Promise<ApiResponse<EspacioTrabajoResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar espacios de trabajo por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?creado_por=eq.${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al obtener los espacios de trabajo'
        };
      }

      return {
        success: true,
        data: Array.isArray(responseData.data) ? responseData.data : []
      };

    } catch (error) {
      console.error('Error fetching espacios de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener espacios de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo espacio de trabajo
   */
  async createEspacioTrabajo(espacioData: EspacioTrabajoData): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      const response = await fetch(apiEndpoints.espacios_de_trabajo, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error) {
      console.error('Error creating espacio de trabajo:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un espacio de trabajo existente (solo del usuario logueado)
   */
  async updateEspacioTrabajo(id: number, espacioData: Partial<EspacioTrabajoData>): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Actualizar solo si el espacio pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}/${id}?creado_por=eq.${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar espacio de trabajo'
      };
    }
  }

  /**
   * Elimina un espacio de trabajo (solo del usuario logueado)
   */
  async deleteEspacioTrabajo(id: number): Promise<ApiResponse<void>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar solo si el espacio pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}/${id}?creado_por=eq.${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar espacio de trabajo'
      };
    }
  }

  /**
   * Obtiene el conteo de espacios de trabajo del usuario logueado
   */
  async getEspaciosTrabajoCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar espacios de trabajo del usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al obtener el conteo de espacios de trabajo'
        };
      }

      const count = Array.isArray(responseData.data) ? responseData.data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting espacios de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar espacios de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const espacioTrabajoService = new EspacioTrabajoService();
