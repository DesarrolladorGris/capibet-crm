import { apiEndpoints } from '@/config/supabase';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// Tipos para embudos
export interface EmbUpdoData {
  nombre: string;
  descripcion?: string;
  creado_por: number;
  espacio_id: number;
  orden?: number;
}

export interface EmbUpdoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  creado_por: number;
  creado_en: string;
  actualizado_en: string;
  espacio_id: number;
  orden: number;
}

export class EmbudoService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtiene todos los embudos
   */
  async getAllEmbudos(): Promise<ApiResponse<EmbUpdoResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.embudos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los embudos'
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al obtener los embudos'
        };
      }

      return {
        success: true,
        data: Array.isArray(proxyResponse.data) ? proxyResponse.data : []
      };

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
  async getEmbudosByEspacio(espacioId: number): Promise<ApiResponse<EmbUpdoResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.embudos}?espacio_id=${espacioId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los embudos del espacio'
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al obtener los embudos del espacio'
        };
      }

      return {
        success: true,
        data: Array.isArray(proxyResponse.data) ? proxyResponse.data : []
      };

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
   * Crea un nuevo embudo
   */
  async createEmbudo(embudoData: EmbUpdoData): Promise<ApiResponse<EmbUpdoResponse>> {
    try {
      console.log('Creando embudo:', embudoData);

      const response = await fetch(apiEndpoints.embudos, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(embudoData)
      });

      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        return {
          success: false,
          error: `Error al crear embudo: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al crear embudo',
          details: proxyResponse.details
        };
      }

      console.log('Embudo creado exitosamente:', proxyResponse.data);

      return {
        success: true,
        data: proxyResponse.data as EmbUpdoResponse
      };

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
   * Actualiza un embudo existente
   */
  async updateEmbudo(id: number, embudoData: Partial<EmbUpdoData>): Promise<ApiResponse<EmbUpdoResponse>> {
    try {
      console.log('Actualizando embudo:', id, embudoData);

      const response = await fetch(`${apiEndpoints.embudos}/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(embudoData)
      });

      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        return {
          success: false,
          error: `Error al actualizar embudo: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al actualizar embudo',
          details: proxyResponse.details
        };
      }

      console.log('Embudo actualizado exitosamente:', proxyResponse.data);

      return {
        success: true,
        data: proxyResponse.data as EmbUpdoResponse
      };

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
   * Elimina un embudo existente
   */
  async deleteEmbudo(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('Eliminando embudo:', id);

      const response = await fetch(`${apiEndpoints.embudos}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        return {
          success: false,
          error: `Error al eliminar embudo: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al eliminar embudo',
          details: proxyResponse.details
        };
      }

      console.log('Embudo eliminado exitosamente');

      return {
        success: true,
        data: undefined
      };

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
  async updateEmbudosOrder(embudosConOrden: Array<{id: number, orden: number}>): Promise<ApiResponse<void>> {
    try {
      console.log('Actualizando orden de embudos:', embudosConOrden);

      const response = await fetch(`${apiEndpoints.embudos}/update-order`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ embudos: embudosConOrden })
      });

      if (!response.ok) {
        console.error('Error response:', response.status, response.statusText);
        return {
          success: false,
          error: `Error al actualizar orden de embudos: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al actualizar orden de embudos',
          details: proxyResponse.details
        };
      }

      console.log('Orden de embudos actualizado exitosamente');

      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      console.error('Error updating embudos order:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar orden de embudos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const embudoService = new EmbudoService();
