import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface Sesion {
  id?: number;
  canal_id: number;
  usuario_id: number;
  nombre: string;
  api_key?: string | null;
  access_token?: string | null;
  phone_number?: string | null;
  email_user?: string | null;
  email_password?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  imap_host?: string | null;
  imap_port?: number | null;
  estado: 'activo' | 'desconectado' | 'expirado';
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: number; // ID del usuario que creó esta sesión
}

export interface SesionData {
  canal_id: number;
  usuario_id: number;
  nombre: string;
  api_key?: string | null;
  access_token?: string | null;
  phone_number?: string | null;
  email_user?: string | null;
  email_password?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  imap_host?: string | null;
  imap_port?: number | null;
  estado: 'activo' | 'desconectado' | 'expirado';
  creado_por?: number; // ID del usuario que creó esta sesión
}

export interface SesionResponse {
  id: number;
  canal_id: number;
  usuario_id: number;
  nombre: string;
  api_key?: string | null;
  access_token?: string | null;
  phone_number?: string | null;
  email_user?: string | null;
  email_password?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  imap_host?: string | null;
  imap_port?: number | null;
  estado: 'activo' | 'desconectado' | 'expirado';
  creado_en: string;
  actualizado_en: string;
  creado_por: number; // ID del usuario que creó esta sesión
}

export class SesionesService {
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

  // ==================== MÉTODOS PARA SESIONES ====================

  /**
   * Obtiene todas las sesiones del usuario logueado
   */
  async getAllSesiones(): Promise<ApiResponse<SesionResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar sesiones por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.sesiones}?creado_por=eq.${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.warn('Error al obtener sesiones:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }
      
      const data = await response.json();
      
      // Log para debugging
      console.log('Sesiones obtenidas (filtradas por usuario):', data);
      
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
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
  async createSesion(sesionData: SesionData): Promise<ApiResponse<Sesion>> {
    try {
      // Obtener el ID del usuario logueado como creador
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Log para debugging
      console.log('Datos recibidos para crear sesión:', sesionData);
      
      const dataToSend = {
        canal_id: sesionData.canal_id,
        usuario_id: sesionData.usuario_id,
        nombre: sesionData.nombre,
        api_key: sesionData.api_key,
        access_token: sesionData.access_token,
        phone_number: sesionData.phone_number,
        email_user: sesionData.email_user,
        email_password: sesionData.email_password,
        smtp_host: sesionData.smtp_host,
        smtp_port: sesionData.smtp_port,
        imap_host: sesionData.imap_host,
        imap_port: sesionData.imap_port,
        estado: sesionData.estado,
        creado_por: currentUserId // Asignar el creador
      };

      console.log('Datos a enviar:', dataToSend);
      console.log('URL:', apiEndpoints.sesiones);
      console.log('Headers:', this.getHeaders());

      const response = await fetch(apiEndpoints.sesiones, {
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
      console.log('Sesión creada exitosamente:', responseData);
      
      return { success: true, data: responseData };
    } catch (error) {
      console.error('Error al crear sesión:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al crear sesión',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  /**
   * Obtiene las sesiones de un canal específico (solo del usuario logueado)
   */
  async getSesionesByCanal(canalId: number): Promise<ApiResponse<SesionResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar por canal Y por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.sesiones}?canal_id=eq.${canalId}&creado_por=eq.${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error al obtener sesiones del canal:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const result = await response.json();
      return { success: true, data: result || [] };
    } catch (error) {
      console.error('Error al obtener sesiones del canal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al obtener sesiones del canal',
        data: []
      };
    }
  }

  /**
   * Actualiza una sesión existente (solo del usuario logueado)
   */
  async updateSesion(id: number, data: Partial<Sesion>): Promise<ApiResponse<Sesion>> {
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
      const response = await fetch(`${apiEndpoints.sesiones}?id=eq.${id}&creado_por=eq.${userId}`, {
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
      console.error('Error al actualizar sesión:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar sesión' };
    }
  }

  /**
   * Elimina una sesión (solo del usuario logueado)
   */
  async deleteSesion(id: number): Promise<ApiResponse<void>> {
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
      const response = await fetch(`${apiEndpoints.sesiones}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar sesión' };
    }
  }

  /**
   * Obtiene el conteo de sesiones del usuario logueado
   */
  async getSesionesCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar sesiones del usuario logueado
      const response = await fetch(`${apiEndpoints.sesiones}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de sesiones'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
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

export const sesionesService = new SesionesService();
