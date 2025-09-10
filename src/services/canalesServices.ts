import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface Canal {
  id?: number;
  usuario_id: number;
  espacio_id: number;
  tipo: 'whatsapp' | 'whatsappApi' | 'email' | 'instagram' | 'messenger' | 'telegram' | 'telegramBot' | 'webChat';
  descripcion: string;
  configuracion?: Record<string, unknown>;
  activo?: boolean;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: number; // ID del usuario que creó este canal
}

export interface CanalData {
  usuario_id: number;
  espacio_id: number;
  tipo: Canal['tipo'];
  descripcion: string;
  configuracion?: Record<string, unknown>;
  activo?: boolean;
  creado_por?: number; // ID del usuario que creó este canal
}

export class CanalesService {
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

  // ==================== MÉTODOS PARA CANALES ====================

  /**
   * Obtiene todos los canales del usuario logueado
   */
  async getAllCanales(): Promise<ApiResponse<Canal[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar canales por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.canales}?creado_por=eq.${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      const data = await response.json();
      
      // Log para debugging
      console.log('Canales obtenidos (filtrados por usuario):', data);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error al obtener canales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener canales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo canal
   */
  async createCanal(canalData: CanalData): Promise<ApiResponse<Canal>> {
    try {
      // Obtener el ID del usuario logueado como creador
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Preparar los datos con valores por defecto
      const dataToSend = {
        usuario_id: canalData.usuario_id,
        espacio_id: canalData.espacio_id,
        tipo: canalData.tipo,
        descripcion: canalData.descripcion,
        creado_por: currentUserId // Asignar el creador
      };

      // Log detallado para debugging
      console.log('=== DEBUG CREATE CANAL ===');
      console.log('Datos recibidos:', canalData);
      console.log('Datos a enviar:', dataToSend);
      console.log('URL:', apiEndpoints.canales);
      console.log('Headers:', this.getHeaders());

      const response = await fetch(apiEndpoints.canales, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      // Manejar respuesta vacía o JSON inválido
      let responseData = null;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const responseText = await response.text();
          console.log('Response text:', responseText);
          
          if (responseText.trim()) {
            responseData = JSON.parse(responseText);
          } else {
            console.log('Respuesta vacía del servidor - Canal creado exitosamente');
            responseData = { success: true, message: 'Canal creado exitosamente' };
          }
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          // Si no se puede parsear el JSON, asumimos que fue exitoso
          responseData = { success: true, message: 'Canal creado exitosamente' };
        }
      } else {
        // Si no es JSON, asumimos que fue exitoso (respuesta vacía típica de Supabase)
        console.log('Respuesta no-JSON - Canal creado exitosamente');
        responseData = { success: true, message: 'Canal creado exitosamente' };
      }
      
      // Log para debugging
      console.log('Canal creado exitosamente:', responseData);
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error al crear canal:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un canal existente (solo del usuario logueado)
   */
  async updateCanal(id: number, data: Partial<Canal>): Promise<ApiResponse<Canal>> {
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
      const response = await fetch(`${apiEndpoints.canales}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error al actualizar canal:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar canal' };
    }
  }

  /**
   * Elimina un canal (solo del usuario logueado)
   */
  async deleteCanal(id: number): Promise<ApiResponse<void>> {
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
      const response = await fetch(`${apiEndpoints.canales}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      // Log para debugging
      console.log(`Canal ${id} eliminado exitosamente`);
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar canal:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar canal',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de canales del usuario logueado
   */
  async getCanalesCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar canales del usuario logueado
      const response = await fetch(`${apiEndpoints.canales}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de canales'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
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

export const canalesService = new CanalesService();
