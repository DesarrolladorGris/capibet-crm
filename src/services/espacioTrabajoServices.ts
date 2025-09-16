import { EspacioTrabajoData, EspacioTrabajoResponse } from '../app/api/espacio_trabajos/domain/espacio_trabajo';

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
  espaciosTrabajo: `${API_BASE_URL}/api/espacio_trabajos`,
  espaciosTrabajoById: (id: number) => `${API_BASE_URL}/api/espacio_trabajos/${id}`
};

class EspacioTrabajoServices {
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
   * Crea un nuevo espacio de trabajo
   */
  async createEspacioTrabajo(espacioData: EspacioTrabajoData): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      const response = await fetch(apiEndpoints.espaciosTrabajo, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData)
      });

      const data = await this.handleResponse<ApiResponse<EspacioTrabajoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating espacio de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear espacio de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los espacios de trabajo
   */
  async getAllEspaciosTrabajo(): Promise<ApiResponse<EspacioTrabajoResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.espaciosTrabajo, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EspacioTrabajoResponse[]>>(response);
      return data;

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
   * Obtiene un espacio de trabajo por ID
   */
  async getEspacioTrabajoById(id: number): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      const response = await fetch(apiEndpoints.espaciosTrabajoById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EspacioTrabajoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching espacio de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener espacio de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un espacio de trabajo existente
   */
  async updateEspacioTrabajo(id: number, espacioData: Partial<EspacioTrabajoData>): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      const response = await fetch(apiEndpoints.espaciosTrabajoById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData)
      });

      const data = await this.handleResponse<ApiResponse<EspacioTrabajoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating espacio de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar espacio de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un espacio de trabajo
   */
  async deleteEspacioTrabajo(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.espaciosTrabajoById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting espacio de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar espacio de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de espacios de trabajo (método auxiliar que puede ser útil)
   */
  async getEspaciosTrabajoCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllEspaciosTrabajo();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de espacios de trabajo'
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

// Exportar una instancia singleton del servicio
export const espacioTrabajoServices = new EspacioTrabajoServices();

// Exportar también la clase para casos especiales
export default EspacioTrabajoServices;

// Re-exportar los tipos para facilitar el uso
export type { EspacioTrabajoData, EspacioTrabajoResponse } from '../app/api/espacio_trabajos/domain/espacio_trabajo';
