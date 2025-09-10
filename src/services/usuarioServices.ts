import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

// Tipos para autenticación
export interface LoginCredentials {
  correo_electronico: string;
  contrasena: string;
}

// Tipos para usuarios
export interface UsuarioData {
  id?: number;
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  contrasena: string;
  rol?: string;
  activo?: boolean;
  creado_por?: number; // ID del usuario que creó este usuario
}

export interface UsuarioResponse {
  id: number;
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  rol: string;
  activo: boolean; // true = activo, false = desactivado
  fecha_alta?: string;
  created_at?: string;
  creado_por: number; // ID del usuario que creó este usuario
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export class UsuarioService {
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

  /**
   * Crea un nuevo usuario
   */
  async createUsuario(userData: UsuarioData): Promise<ApiResponse> {
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
        nombre_agencia: userData.nombre_agencia,
        tipo_empresa: userData.tipo_empresa,
        nombre_usuario: userData.nombre_usuario,
        correo_electronico: userData.correo_electronico,
        telefono: userData.telefono,
        codigo_pais: userData.codigo_pais,
        contrasena: userData.contrasena,
        rol: userData.rol || 'Operador',
        activo: userData.activo !== undefined ? userData.activo : true,
        creado_por: currentUserId // Asignar el creador
      };

      const response = await fetch(apiEndpoints.usuarios, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error) {
      console.error('Error creating user:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los usuarios creados por el usuario logueado
   */
  async getAllUsuarios(): Promise<ApiResponse<UsuarioResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar usuarios por creado_por (usuarios creados por el usuario logueado)
      const response = await fetch(`${apiEndpoints.usuarios}?creado_por=eq.${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al obtener los usuarios'
        };
      }

      return {
        success: true,
        data: Array.isArray(responseData.data) ? responseData.data : []
      };

    } catch (error) {
      console.error('Error fetching users:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUsuarioById(id: number): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al obtener el usuario'
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error) {
      console.error('Error fetching user:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un usuario existente (solo los creados por el usuario logueado)
   */
  async updateUsuario(id: number, userData: Partial<UsuarioData>): Promise<ApiResponse> {
    try {
      // Obtener el ID del usuario logueado
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Actualizar solo si el usuario fue creado por el usuario logueado
      const response = await fetch(`${apiEndpoints.usuarios}/${id}?creado_por=eq.${currentUserId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      };
    }
  }

  /**
   * Elimina un usuario (solo los creados por el usuario logueado)
   */
  async deleteUsuario(id: number): Promise<ApiResponse> {
    try {
      // Obtener el ID del usuario logueado
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar solo si el usuario fue creado por el usuario logueado
      const response = await fetch(`${apiEndpoints.usuarios}/${id}?creado_por=eq.${currentUserId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error del servidor: ${response.status} ${response.statusText}`,
          details: responseData.details
        };
      }

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar usuario'
      };
    }
  }

  /**
   * Cambia el estado activo/inactivo de un usuario (solo los creados por el usuario logueado)
   */
  async toggleUsuarioStatus(id: number, activo: boolean): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      // Obtener el ID del usuario logueado
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Cambiar estado solo si el usuario fue creado por el usuario logueado
      const response = await fetch(`${apiEndpoints.usuarios}/${id}/toggle-status?creado_por=eq.${currentUserId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ activo }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || `Error ${response.status}: ${response.statusText}`
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar estado del usuario'
      };
    }
  }

  /**
   * Obtiene el conteo de usuarios creados por el usuario logueado
   */
  async getUsersCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar usuarios creados por el usuario logueado
      const response = await fetch(`${apiEndpoints.usuarios}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al obtener el conteo de usuarios'
        };
      }

      const count = Array.isArray(responseData.data) ? responseData.data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting users:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar usuarios',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica si un email ya existe en el sistema
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error al verificar el email'
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error) {
      console.error('Error checking email:', error);
      
      return {
        success: false,
        error: 'Error de conexión al verificar email',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Realiza el login de un usuario
   */
  async loginUsuario(credentials: LoginCredentials): Promise<ApiResponse<UsuarioData>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return {
          success: false,
          error: responseData.error || 'Error en las credenciales'
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error) {
      console.error('Error in login:', error);
      
      return {
        success: false,
        error: 'Error de conexión al iniciar sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const usuarioService = new UsuarioService();
