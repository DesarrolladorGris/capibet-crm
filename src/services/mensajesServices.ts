import { MensajeData, MensajeResponse } from '../app/api/mensajes/domain/mensaje';

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
  mensajes: `${API_BASE_URL}/api/mensajes`,
  mensajesById: (id: number) => `${API_BASE_URL}/api/mensajes/${id}`
};

class MensajesServices {
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
      
      console.log('📋 Mensajes obtenidos del API:', data);
      
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
   * Obtiene un mensaje por ID
   */
  async getMensajeById(id: number): Promise<ApiResponse<MensajeResponse>> {
    try {
      const response = await fetch(apiEndpoints.mensajesById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<MensajeResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching message:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener mensaje',
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

      const response = await fetch(apiEndpoints.mensajesById(id), {
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

      const data = await this.handleResponse<ApiResponse<MensajeResponse>>(response);
      console.log('Mensaje actualizado exitosamente');

      return data;

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

      const response = await fetch(apiEndpoints.mensajesById(id), {
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

// Exportar una instancia singleton del servicio
export const mensajesServices = new MensajesServices();

// Exportar también la clase para casos especiales
export default MensajesServices;
