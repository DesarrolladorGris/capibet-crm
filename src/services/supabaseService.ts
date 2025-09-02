import { supabaseConfig, apiEndpoints } from '@/config/supabase';

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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface Etiqueta {
  id?: number;
  nombre: string;
  color: string;
  descripcion?: string;
  activa: boolean;
  created_at?: string;
}

export interface RespuestaRapida {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at?: string;
}

// Tipos para sesiones y canales
export interface Canal {
  id?: number;
  usuario_id: number;
  espacio_id: number;
  tipo: 'whatsapp' | 'whatsappApi' | 'email' | 'instagram' | 'messenger' | 'telegram' | 'telegramBot' | 'webChat';
  descripcion: string;
  configuracion?: Record<string, any>;
  activo?: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CanalData {
  usuario_id: number;
  espacio_id: number;
  tipo: Canal['tipo'];
  descripcion: string;
  configuracion?: Record<string, any>;
  activo?: boolean;
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
}

export interface RespuestaRapidaFormData {
  titulo: string;
  contenido: string;
  categoria: string;
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
  orden: number;
}

export interface EspacioConEmbudos extends EspacioTrabajoResponse {
  embudos: EmbUpdoResponse[];
}

export class SupabaseService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': supabaseConfig.serviceRoleKey,
      'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
    };
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
      console.error('Error creating user:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
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
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getUsuarioById(id: number): Promise<ApiResponse<UsuarioResponse>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el usuario'
        };
      }

      const data = await this.handleResponse(response);
      
      return {
        success: true,
        data: Array.isArray(data) ? data[0] : null
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

  async updateUsuario(id: number, userData: Partial<UsuarioData>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
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
        data: data as unknown as UsuarioResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar usuario'
      };
    }
  }

  async deleteUsuario(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
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

      await this.handleResponse(response);
      
      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar usuario'
      };
    }
  }

  async toggleUsuarioStatus(id: number, activo: boolean): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ activo }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
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
   * Verifica si un email ya existe en el sistema
   */
  async checkEmailExists(email: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${apiEndpoints.usuarios}?correo_electronico=eq.${encodeURIComponent(email)}`, {
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
      const exists = Array.isArray(data) && data.length > 0;
      
      return {
        success: true,
        data: exists
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
      const response = await fetch(`${apiEndpoints.usuarios}?correo_electronico=eq.${encodeURIComponent(credentials.correo_electronico)}&contrasena=eq.${encodeURIComponent(credentials.contrasena)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error en las credenciales'
        };
      }

      const data = await this.handleResponse(response);
      
      if (Array.isArray(data) && data.length > 0) {
        const usuario = data[0] as UsuarioData;
        return {
          success: true,
          data: usuario
        };
      } else {
        return {
          success: false,
          error: 'Credenciales incorrectas'
        };
      }

    } catch (error) {
      console.error('Error in login:', error);
      
      return {
        success: false,
        error: 'Error de conexión al iniciar sesión',
        details: error instanceof Error ? error.message : 'Error desconocido'
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
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo contacto
   */
  async createContacto(contactData: ContactData): Promise<ApiResponse<ContactResponse>> {
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
        data: data as unknown as ContactResponse
      };

    } catch (error) {
      console.error('Error creating contact:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContacto(id: number, contactData: Partial<ContactData>): Promise<ApiResponse<ContactResponse>> {
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
        data: data as unknown as ContactResponse
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
  async deleteContacto(id: number): Promise<ApiResponse<void>> {
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

      await this.handleResponse(response);
      
      return {
        success: true,
        data: undefined
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
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo espacio de trabajo
   */
  async createEspacioTrabajo(espacioData: EspacioTrabajoData): Promise<ApiResponse<EspacioTrabajoResponse>> {
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
        data: data as unknown as EspacioTrabajoResponse
      };

    } catch (error) {
      console.error('Error creating espacio de trabajo:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un espacio de trabajo existente
   */
  async updateEspacioTrabajo(id: number, espacioData: Partial<EspacioTrabajoData>): Promise<ApiResponse<EspacioTrabajoResponse>> {
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
        data: data as unknown as EspacioTrabajoResponse
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
  async deleteEspacioTrabajo(id: number): Promise<ApiResponse<void>> {
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

      await this.handleResponse(response);
      
      return {
        success: true,
        data: undefined
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
        details: error instanceof Error ? error.message : 'Error desconocido'
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

      const data = await this.handleResponse(response);
      console.log('Embudo creado exitosamente:', data);

      return {
        success: true,
        data: data as unknown as EmbUpdoResponse
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
        data: data as unknown as EmbUpdoResponse
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

      await this.handleResponse(response);
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
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ===== MÉTODOS PARA RESPUESTAS RÁPIDAS =====

  /**
   * Obtiene todas las respuestas rápidas
   */
  async getAllRespuestasRapidas(): Promise<ApiResponse<RespuestaRapida[]>> {
    try {
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?order=created_at.desc`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error al obtener respuestas rápidas:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Obtiene una respuesta rápida por ID
   */
  async getRespuestaRapidaById(id: number): Promise<ApiResponse<RespuestaRapida>> {
    try {
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      return { success: true, data: Array.isArray(data) ? data[0] : null };
    } catch (error) {
      console.error('Error al obtener respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Crea una nueva respuesta rápida
   */
  async createRespuestaRapida(data: RespuestaRapidaFormData): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.respuestasRapidas, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          activa: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al crear respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Actualiza una respuesta rápida existente
   */
  async updateRespuestaRapida(id: number, data: Partial<RespuestaRapida>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Elimina una respuesta rápida
   */
  async deleteRespuestaRapida(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar respuesta rápida:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  /**
   * Cambia el estado activo/inactivo de una respuesta rápida
   */
  async toggleRespuestaRapidaStatus(id: number, activa: boolean): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ activa }),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar estado de respuesta rápida:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al cambiar estado de respuesta rápida'
      };
    }
  }

  // ==================== MÉTODOS PARA CANALES ====================

  /**
   * Obtiene todos los canales
   */
  async getAllCanales(): Promise<ApiResponse<Canal[]>> {
    try {
      const response = await fetch(apiEndpoints.canales, {
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
      console.log('Canales obtenidos:', data);
      
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
      // Preparar los datos con valores por defecto
      const dataToSend = {
        usuario_id: canalData.usuario_id,
        espacio_id: canalData.espacio_id,
        tipo: canalData.tipo,
        descripcion: canalData.descripcion
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
   * Actualiza un canal existente
   */
  async updateCanal(id: number, data: Partial<Canal>): Promise<ApiResponse<Canal>> {
    try {
      const response = await fetch(`${apiEndpoints.canales}?id=eq.${id}`, {
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
   * Elimina un canal
   */
  async deleteCanal(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${apiEndpoints.canales}?id=eq.${id}`, {
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

  // ==================== MÉTODOS PARA SESIONES ====================

  /**
   * Obtiene todas las sesiones (simplificado para evitar errores de relaciones)
   */
  async getAllSesiones(): Promise<ApiResponse<SesionResponse[]>> {
    try {
      // Primero intentamos con una consulta simple
      const response = await fetch(apiEndpoints.sesiones, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.warn('Endpoint de sesiones no disponible:', errorData);
        // Retornamos una lista vacía en lugar de fallar
        return { success: true, data: [] };
      }
      
      const data = await response.json();
      
      // Log para debugging
      console.log('Sesiones obtenidas:', data);
      
      // Como las sesiones pueden no tener la estructura completa esperada,
      // devolvemos los datos tal como vienen o una lista vacía
      return { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      // En caso de error, retornamos lista vacía para no romper la interfaz
      return { 
        success: true, 
        data: [],
        error: 'Endpoint de sesiones no disponible'
      };
    }
  }

  /**
   * Crea una nueva sesión
   */
  async createSesion(sesionData: SesionData): Promise<ApiResponse<Sesion>> {
    try {
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
        estado: sesionData.estado
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
   * Obtiene las sesiones de un canal específico
   */
  async getSesionesByCanal(canalId: number): Promise<ApiResponse<SesionResponse[]>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?canal_id=eq.${canalId}`, {
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
   * Actualiza una sesión existente
   */
  async updateSesion(id: number, data: Partial<Sesion>): Promise<ApiResponse<Sesion>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?id=eq.${id}`, {
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
   * Elimina una sesión
   */
  async deleteSesion(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${apiEndpoints.sesiones}?id=eq.${id}`, {
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
}

export const supabaseService = new SupabaseService();
