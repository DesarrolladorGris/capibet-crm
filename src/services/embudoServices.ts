import { EmbudoData, EmbudoResponse, UpdateOrderRequest } from '../app/api/embudos/domain/embudo';

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
  embudos: `${API_BASE_URL}/api/embudos`,
  embudosById: (id: number) => `${API_BASE_URL}/api/embudos/${id}`,
  embudosUpdateOrder: `${API_BASE_URL}/api/embudos/update-order`
};

class EmbudoServices {
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
   * Crea un nuevo embudo
   */
  async createEmbudo(embudoData: EmbudoData): Promise<ApiResponse<EmbudoResponse>> {
    try {
      const response = await fetch(apiEndpoints.embudos, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(embudoData)
      });

      const data = await this.handleResponse<ApiResponse<EmbudoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear embudo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los embudos
   */
  async getAllEmbudos(): Promise<ApiResponse<EmbudoResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.embudos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EmbudoResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching embudos:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener embudos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene embudos por espacio de trabajo
   */
  async getEmbudosByEspacio(espacioId: number): Promise<ApiResponse<EmbudoResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.embudos}?espacio_id=${espacioId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EmbudoResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching embudos by espacio:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener embudos del espacio',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un embudo por ID
   */
  async getEmbudoById(id: number): Promise<ApiResponse<EmbudoResponse>> {
    try {
      const response = await fetch(apiEndpoints.embudosById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EmbudoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener embudo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un embudo existente
   */
  async updateEmbudo(id: number, embudoData: Partial<EmbudoData>): Promise<ApiResponse<EmbudoResponse>> {
    try {
      const response = await fetch(apiEndpoints.embudosById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(embudoData)
      });

      const data = await this.handleResponse<ApiResponse<EmbudoResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar embudo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un embudo
   */
  async deleteEmbudo(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.embudosById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar embudo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza el orden de múltiples embudos
   */
  async updateEmbudosOrder(embudosConOrden: Array<{id: number, orden: number}>): Promise<ApiResponse> {
    try {
      const updateOrderRequest: UpdateOrderRequest = {
        embudos: embudosConOrden
      };

      const response = await fetch(apiEndpoints.embudosUpdateOrder, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateOrderRequest)
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error updating embudos order:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar orden de embudos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de embudos (método auxiliar que puede ser útil)
   */
  async getEmbudosCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllEmbudos();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de embudos'
      };

    } catch (error) {
      console.error('Error counting embudos:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar embudos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de embudos por espacio (método auxiliar que puede ser útil)
   */
  async getEmbudosCountByEspacio(espacioId: number): Promise<ApiResponse<number>> {
    try {
      const response = await this.getEmbudosByEspacio(espacioId);
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de embudos del espacio'
      };

    } catch (error) {
      console.error('Error counting embudos by espacio:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar embudos del espacio',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const embudoServices = new EmbudoServices();

// Exportar también la clase para casos especiales
export default EmbudoServices;
