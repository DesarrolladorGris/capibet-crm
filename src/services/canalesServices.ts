import { CanalData, CanalResponse } from '../app/api/canales/domain/canal';

// Alias para compatibilidad con el código existente
export type Canal = CanalResponse;

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
  canales: `${API_BASE_URL}/api/canales`,
  canalesById: (id: number) => `${API_BASE_URL}/api/canales/${id}`
};

class CanalesServices {
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
   * Crea un nuevo canal
   */
  async createCanal(canalData: CanalData): Promise<ApiResponse<CanalResponse>> {
    try {
      const response = await fetch(apiEndpoints.canales, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(canalData)
      });

      const data = await this.handleResponse<ApiResponse<CanalResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating canal:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los canales
   */
  async getAllCanales(): Promise<ApiResponse<CanalResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.canales, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<CanalResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching canales:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener canales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un canal por ID
   */
  async getCanalById(id: number): Promise<ApiResponse<CanalResponse>> {
    try {
      const response = await fetch(apiEndpoints.canalesById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<CanalResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching canal:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un canal existente
   */
  async updateCanal(id: number, canalData: Partial<CanalData>): Promise<ApiResponse<CanalResponse>> {
    try {
      const response = await fetch(apiEndpoints.canalesById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(canalData)
      });

      const data = await this.handleResponse<ApiResponse<CanalResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating canal:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un canal
   */
  async deleteCanal(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.canalesById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting canal:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de canales (método auxiliar que puede ser útil)
   */
  async getCanalesCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllCanales();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de canales'
      };

    } catch (error) {
      console.error('Error counting canales:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar canales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const canalesServices = new CanalesServices();

// Exportar también la clase para casos especiales
export default CanalesServices;
