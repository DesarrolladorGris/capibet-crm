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
   * Obtiene las sesiones de un canal específico
   */
  async getSesionesByCanal(canalId: number): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?canal_id=eq.${canalId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<SesionResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching sesiones by canal:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener sesiones del canal',
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
}

// Exportar una instancia singleton del servicio
export const sesionesServices = new SesionesServices();

// Exportar también la clase para casos especiales
export default SesionesServices;
