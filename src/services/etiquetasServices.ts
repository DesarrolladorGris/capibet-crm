import { EtiquetaData, EtiquetaResponse } from '../app/api/etiquetas/domain/etiqueta';

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
  etiquetas: `${API_BASE_URL}/api/etiquetas`,
  etiquetasById: (id: number) => `${API_BASE_URL}/api/etiquetas/${id}`
};

class EtiquetasServices {
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
   * Obtiene todas las etiquetas del usuario logueado
   */
  async getAllEtiquetas(): Promise<ApiResponse<EtiquetaResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.etiquetas, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EtiquetaResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener etiquetas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una nueva etiqueta
   */
  async createEtiqueta(etiquetaData: EtiquetaData): Promise<ApiResponse<EtiquetaResponse>> {
    try {
      const response = await fetch(apiEndpoints.etiquetas, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(etiquetaData)
      });

      const data = await this.handleResponse<ApiResponse<EtiquetaResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene una etiqueta por ID
   */
  async getEtiquetaById(id: number): Promise<ApiResponse<EtiquetaResponse>> {
    try {
      const response = await fetch(apiEndpoints.etiquetasById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<EtiquetaResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error al obtener etiqueta:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una etiqueta existente
   */
  async updateEtiqueta(id: number, etiquetaData: Partial<EtiquetaData>): Promise<ApiResponse<EtiquetaResponse>> {
    try {
      const response = await fetch(apiEndpoints.etiquetasById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(etiquetaData)
      });

      const data = await this.handleResponse<ApiResponse<EtiquetaResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error al actualizar etiqueta:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina una etiqueta por ID
   */
  async deleteEtiqueta(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(apiEndpoints.etiquetasById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<void>>(response);
      return data;

    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de etiquetas (método auxiliar que puede ser útil)
   */
  async getEtiquetasCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllEtiquetas();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de etiquetas'
      };

    } catch (error) {
      console.error('Error counting etiquetas:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar etiquetas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const etiquetasServices = new EtiquetasServices();

// Exportar también la clase para casos especiales
export default EtiquetasServices;
