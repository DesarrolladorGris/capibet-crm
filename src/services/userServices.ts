import { UsuarioData, UsuarioResponse, LoginCredentials } from '../app/api/usuarios/domain/usuario';

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
  usuarios: `${API_BASE_URL}/api/usuarios`,
  usuariosById: (id: number) => `${API_BASE_URL}/api/usuarios/${id}`,
  usuariosToggleStatus: (id: number) => `${API_BASE_URL}/api/usuarios/${id}/toggle-status`,
  usuariosCheckEmail: `${API_BASE_URL}/api/usuarios/check-email`,
  usuariosLogin: `${API_BASE_URL}/api/usuarios/login`
};

class UserServices {
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
   * Crea un nuevo usuario
   */
  async createUsuario(userData: UsuarioData): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(apiEndpoints.usuarios, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse>>(response);
      return data;

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
   * Registra un nuevo usuario externamente (sin autenticación requerida)
   */
  async registerExternalUser(userData: UsuarioData): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(apiEndpoints.usuarios, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error registering external user:', error);
      return {
        success: false,
        error: 'Error de conexión al registrar usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los usuarios del sistema
   */
  async getAllUsuarios(): Promise<ApiResponse<UsuarioResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.usuarios, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse[]>>(response);
      return data;

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
      const response = await fetch(apiEndpoints.usuariosById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse>>(response);
      return data;

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
   * Actualiza un usuario existente
   */
  async updateUsuario(id: number, userData: Partial<UsuarioData>): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(apiEndpoints.usuariosById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating user:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUsuario(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.usuariosById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting user:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Cambia el estado activo/inactivo de un usuario
   */
  async toggleUsuarioStatus(id: number, activo: boolean): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.usuariosToggleStatus(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ activo })
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error toggling user status:', error);
      
      return {
        success: false,
        error: 'Error de conexión al cambiar estado del usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica si un email ya existe en el sistema
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${apiEndpoints.usuariosCheckEmail}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<boolean>>(response);
      return data;

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
  async loginUsuario(credentials: LoginCredentials): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(apiEndpoints.usuariosLogin, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });

      const data = await this.handleResponse<ApiResponse<UsuarioResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error in login:', error);
      
      return {
        success: false,
        error: 'Error de conexión al iniciar sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de usuarios (método auxiliar que puede ser útil)
   */
  async getUsersCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllUsuarios();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de usuarios'
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
}

// Exportar una instancia singleton del servicio
export const userServices = new UserServices();

// Exportar también la clase para casos especiales
export default UserServices;
