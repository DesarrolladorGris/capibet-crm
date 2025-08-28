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

// Tipos para contactos
export interface ContactData {
  id?: number;
  nombre: string;
  apellido?: string;
  nombre_completo?: string;
  correo: string;
  telefono: string;
  empresa?: string;
  cargo?: string;
  notas?: string;
  direccion?: string;
  cumpleaños?: string;
  sitio_web?: string;
  etiqueta?: string;
  empresa_id?: number;
  creado_por: number;
}

export interface ContactResponse {
  id: number;
  nombre: string;
  apellido: string | null;
  nombre_completo: string | null;
  correo: string;
  telefono: string;
  empresa: string | null;
  cargo: string | null;
  notas: string | null;
  direccion: string | null;
  cumpleaños: string | null;
  sitio_web: string | null;
  etiqueta: string | null;
  creado_por: number;
  creado_en: string;
  actualizado_en: string;
  empresa_id: number | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

// Tipos para espacios de trabajo
export interface EspacioTrabajoData {
  nombre: string;
  creado_por: number;
}

export interface EspacioTrabajoResponse {
  id: number;
  nombre: string;
  creado_por: number;
  creado_en: string;
  actualizado_en: string;
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
  orden?: number;
}

// Tipo extendido para espacios con sus embudos
export interface EspacioConEmbudos extends EspacioTrabajoResponse {
  embudos: EmbUpdoResponse[];
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

  // ===== MÉTODOS PARA USUARIOS =====

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

  // ===== MÉTODOS PARA CONTACTOS =====

  /**
   * Obtiene todos los contactos
   */
  async getAllContactos(): Promise<ApiResponse<ContactResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.contactos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los contactos'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };

    } catch (error) {
      console.error('Error fetching contacts:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener contactos',
        details: error
      };
    }
  }

  /**
   * Crea un nuevo contacto
   */
  async createContacto(contactData: ContactData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(apiEndpoints.contactos, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(contactData)
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
      console.error('Error creating contact:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      };
    }
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContacto(id: number, contactData: Partial<ContactData>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${apiEndpoints.contactos}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(contactData),
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
        data: data || { message: 'Contacto actualizado exitosamente' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar contacto'
      };
    }
  }

  /**
   * Elimina un contacto
   */
  async deleteContacto(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${apiEndpoints.contactos}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
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
        data: data || { message: 'Contacto eliminado exitosamente' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar contacto'
      };
    }
  }

  // ===== MÉTODOS PARA ESPACIOS DE TRABAJO =====

  /**
   * Obtiene todos los espacios de trabajo
   */
  async getAllEspaciosTrabajo(): Promise<ApiResponse<EspacioTrabajoResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.espacios_de_trabajo, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los espacios de trabajo'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };

    } catch (error) {
      console.error('Error fetching espacios de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener espacios de trabajo',
        details: error
      };
    }
  }

  /**
   * Crea un nuevo espacio de trabajo
   */
  async createEspacioTrabajo(espacioData: EspacioTrabajoData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(apiEndpoints.espacios_de_trabajo, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData)
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
      console.error('Error creating espacio de trabajo:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error
      };
    }
  }

  /**
   * Actualiza un espacio de trabajo existente
   */
  async updateEspacioTrabajo(id: number, espacioData: Partial<EspacioTrabajoData>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(espacioData),
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
        data: data || { message: 'Espacio de trabajo actualizado exitosamente' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar espacio de trabajo'
      };
    }
  }

  /**
   * Elimina un espacio de trabajo
   */
  async deleteEspacioTrabajo(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
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
        data: data || { message: 'Espacio de trabajo eliminado exitosamente' }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar espacio de trabajo'
      };
    }
  }

  // ===== MÉTODOS PARA EMBUDOS =====

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

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };

    } catch (error) {
      console.error('Error fetching embudos:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener embudos',
        details: error
      };
    }
  }

  /**
   * Obtiene embudos por espacio de trabajo
   */
  async getEmbudosByEspacio(espacioId: number): Promise<ApiResponse<EmbUpdoResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.embudos}?espacio_id=eq.${espacioId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener los embudos del espacio'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };

    } catch (error) {
      console.error('Error fetching embudos by espacio:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener embudos del espacio',
        details: error
      };
    }
  }

  /**
   * Crea un nuevo embudo
   */
  async createEmbudo(embudoData: EmbUpdoData): Promise<ApiResponse<any>> {
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

      const data = await this.handleResponse(response);
      console.log('Embudo creado exitosamente:', data);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Error creating embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear embudo',
        details: error
      };
    }
  }

  /**
   * Actualiza un embudo existente
   */
  async updateEmbudo(id: number, embudoData: Partial<EmbUpdoData>): Promise<ApiResponse<any>> {
    try {
      console.log('Actualizando embudo:', id, embudoData);

      const response = await fetch(`${apiEndpoints.embudos}?id=eq.${id}`, {
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

      const data = await this.handleResponse(response);
      console.log('Embudo actualizado exitosamente:', data);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Error updating embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar embudo',
        details: error
      };
    }
  }

  /**
   * Elimina un embudo existente
   */
  async deleteEmbudo(id: number): Promise<ApiResponse<any>> {
    try {
      console.log('Eliminando embudo:', id);

      const response = await fetch(`${apiEndpoints.embudos}?id=eq.${id}`, {
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

      const data = await this.handleResponse(response);
      console.log('Embudo eliminado exitosamente:', data);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error('Error deleting embudo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar embudo',
        details: error
      };
    }
  }

  /**
   * Actualiza el orden de múltiples embudos
   */
  async updateEmbudosOrder(embudosConOrden: Array<{id: number, orden: number}>): Promise<ApiResponse<any>> {
    try {
      console.log('Actualizando orden de embudos:', embudosConOrden);

      // Hacer múltiples PATCH requests para actualizar el orden
      const updatePromises = embudosConOrden.map(async ({ id, orden }) => {
        const response = await fetch(`${apiEndpoints.embudos}?id=eq.${id}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ orden })
        });

        if (!response.ok) {
          throw new Error(`Error updating embudo ${id}: ${response.status} ${response.statusText}`);
        }

        return this.handleResponse(response);
      });

      await Promise.all(updatePromises);
      console.log('Orden de embudos actualizado exitosamente');

      return {
        success: true,
        data: 'Orden actualizado correctamente'
      };

    } catch (error) {
      console.error('Error updating embudos order:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar orden de embudos',
        details: error
      };
    }
  }
}

export const supabaseService = new SupabaseService();
