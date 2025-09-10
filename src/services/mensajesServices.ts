import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface MensajeData {
  canal_id: number;
  remitente_id: number;
  contenido: string;
  contacto_id: number;
  sesion_id: number;
  destinatario_id: number;
  embudo_id: number;
}

export interface MensajeResponse {
  id: number;
  canal_id: number;
  remitente_id: number;
  contenido: string;
  contacto_id: number;
  sesion_id: number;
  destinatario_id: number;
  embudo_id: number;
  creado_en: string;
  enviado_en?: string;
  leido?: boolean;
  tipo?: string;
  estado?: string;
}

export class MensajesService {
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

  // ==================== MÉTODOS PARA MENSAJES ====================

  /**
   * Crea un nuevo mensaje
   */
  async createMensaje(mensajeData: MensajeData): Promise<ApiResponse<MensajeResponse>> {
    try {
      console.log('Datos recibidos para crear mensaje:', mensajeData);
      
      const dataToSend = {
        canal_id: mensajeData.canal_id,
        remitente_id: mensajeData.remitente_id,
        contenido: mensajeData.contenido,
        contacto_id: mensajeData.contacto_id,
        sesion_id: mensajeData.sesion_id,
        destinatario_id: mensajeData.destinatario_id,
        embudo_id: mensajeData.embudo_id
      };

      console.log('Datos a enviar:', dataToSend);
      console.log('URL:', apiEndpoints.mensajes);
      console.log('Headers:', this.getHeaders());

      const response = await fetch(apiEndpoints.mensajes, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
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
            console.log('Respuesta vacía pero exitosa');
            responseData = { success: true };
          }
        } catch (parseError) {
          console.warn('Error al parsear JSON, pero respuesta exitosa:', parseError);
          responseData = { success: true };
        }
      } else {
        console.log('Respuesta no-JSON pero exitosa');
        responseData = { success: true };
      }
      
      // Log para debugging
      console.log('Mensaje creado exitosamente:', responseData);
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al crear mensaje',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  /**
   * Obtiene todos los mensajes
   */
  async getAllMensajes(): Promise<ApiResponse<MensajeResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.mensajes, {
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
      
      console.log('Mensajes obtenidos:', data);
      
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un mensaje existente
   */
  async updateMensaje(id: number, mensajeData: Partial<MensajeData>): Promise<ApiResponse<MensajeResponse>> {
    try {
      console.log('Actualizando mensaje:', id, mensajeData);

      const response = await fetch(`${apiEndpoints.mensajes}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(mensajeData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await this.handleResponse(response);
      console.log('Mensaje actualizado exitosamente');

      return {
        success: true,
        data: data as unknown as MensajeResponse
      };

    } catch (error) {
      console.error('Error al actualizar mensaje:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Mueve un mensaje a otro embudo
   */
  async moveMensajeToEmbudo(mensajeId: number, nuevoEmbudoId: number): Promise<ApiResponse<MensajeResponse>> {
    try {
      console.log('Moviendo mensaje:', mensajeId, 'al embudo:', nuevoEmbudoId);

      const result = await this.updateMensaje(mensajeId, { embudo_id: nuevoEmbudoId });
      
      if (result.success) {
        console.log('Mensaje movido exitosamente');
      }

      return result;
    } catch (error) {
      console.error('Error al mover mensaje:', error);
      return { 
        success: false, 
        error: 'Error de conexión al mover mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un mensaje por ID
   */
  async deleteMensaje(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('Eliminando mensaje con ID:', id);

      const response = await fetch(`${apiEndpoints.mensajes}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      console.log('Mensaje eliminado exitosamente');

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar mensaje',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const mensajesService = new MensajesService();
