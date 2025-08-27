import { supabaseConfig, apiEndpoints } from '@/config/supabase';

// Tipos para el usuario
export interface UsuarioData {
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  contrasena: string;
  rol?: string;
  activo?: boolean;
}

export interface LoginCredentials {
  correo_electronico: string;
  contrasena: string;
}

export interface UsuarioResponse {
  id?: number;
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
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

class SupabaseService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': supabaseConfig.anonKey,
      'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
    };
  }

  private async handleResponse(response: Response): Promise<any> {
    // Manejar respuesta JSON de forma segura
    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
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

  private buildFilterUrl(filters: Record<string, string>, select?: string): string {
    const baseUrl = apiEndpoints.usuarios;
    const filterParams = Object.entries(filters)
      .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
      .join('&');
    
    let url = `${baseUrl}?${filterParams}`;
    
    if (select) {
      url += `&select=${select}`;
    }
    
    return url;
  }

  async createUsuario(userData: UsuarioData): Promise<ApiResponse> {
    try {
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
        activo: userData.activo !== undefined ? userData.activo : true
      };

      const response = await fetch(apiEndpoints.usuarios, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data
      };

    } catch (error) {
      console.error('Error creating usuario:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      };
    }
  }

  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const filters = { correo_electronico: email };
      const url = this.buildFilterUrl(filters, 'correo_electronico');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al verificar el email'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data.length > 0 : false
      };

    } catch (error) {
      console.error('Error checking email:', error);
      
      return {
        success: false,
        error: 'Error al verificar el email',
        details: error
      };
    }
  }

  async loginUsuario(credentials: LoginCredentials): Promise<ApiResponse<UsuarioResponse>> {
    try {
      // Construir la URL con filtros usando la sintaxis de PostgREST (eq. = equal)
      const filters = {
        correo_electronico: credentials.correo_electronico,
        contrasena: credentials.contrasena
      };
      
      const url = this.buildFilterUrl(filters);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error en el servidor al intentar iniciar sesión'
        };
      }

      const data = await this.handleResponse(response);

      // Si la respuesta es un array y tiene elementos, login exitoso
      if (Array.isArray(data) && data.length > 0) {
        const usuario = data[0] as UsuarioResponse;
        
        // Verificar que el usuario esté activo
        if (usuario.activo !== true) {
          return {
            success: false,
            error: 'Tu cuenta está desactivada. Contacta al administrador.'
          };
        }

        return {
          success: true,
          data: usuario
        };
      } else {
        // Si no hay datos o el array está vacío, credenciales incorrectas
        return {
          success: false,
          error: 'Email o contraseña incorrectos'
        };
      }

    } catch (error) {
      console.error('Error during login:', error);
      
      return {
        success: false,
        error: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.',
        details: error
      };
    }
  }

  async getAllUsuarios(): Promise<ApiResponse<UsuarioResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.usuarios, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los usuarios'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };

    } catch (error) {
      console.error('Error fetching users:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener usuarios',
        details: error
      };
    }
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(id: number, userData: Partial<UsuarioData>): Promise<ApiResponse<any>> {
    try {
      // Construir el payload solo con los campos que se van a actualizar
      const updatePayload: Partial<UsuarioData> = {
        nombre_agencia: userData.nombre_agencia,
        tipo_empresa: userData.tipo_empresa,
        nombre_usuario: userData.nombre_usuario,
        correo_electronico: userData.correo_electronico,
        telefono: userData.telefono,
        codigo_pais: userData.codigo_pais,
        rol: userData.rol,
        activo: userData.activo !== undefined ? userData.activo : true
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (userData.contrasena && userData.contrasena.trim() !== '') {
        updatePayload.contrasena = userData.contrasena;
      }

      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: data || { message: 'Usuario actualizado exitosamente' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      };
    }
  }

  /**
   * Activa o desactiva un usuario
   */
  async toggleUsuarioStatus(id: number, activo: boolean): Promise<ApiResponse<any>> {
    try {
      const updatePayload = {
        activo: activo
      };

      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: data || { message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente` }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cambiar estado del usuario'
      };
    }
  }
}

export const supabaseService = new SupabaseService();
