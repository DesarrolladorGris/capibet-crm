import { supabaseConfig, apiEndpoints } from '@/config/supabase';
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
  activa?: boolean;
  creado_por?: number;
  creado_en?: string;
  created_at?: string;
}

export interface RespuestaRapida {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at?: string;
  creado_por?: number; // ID del usuario que creó esta respuesta rápida
}

// Tipos para sesiones y canales
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

// Tipos para mensajes
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
  tipo?: string; // Tipo de canal (whatsapp, email, telegram, etc.) - viene del API
  estado?: string;
}

export class SupabaseService {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': supabaseConfig.serviceRoleKey,
      'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
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

  /**
   * Registra un nuevo usuario externamente (sin autenticación requerida)
   */
  async registerExternalUser(userData: UsuarioData): Promise<ApiResponse> {
    try {
      // Preparar los datos con valores por defecto para registro externo
      const dataToSend = {
        nombre_agencia: userData.nombre_agencia || 'N/A',
        tipo_empresa: userData.tipo_empresa || 'N/A',
        nombre_usuario: userData.nombre_usuario,
        correo_electronico: userData.correo_electronico,
        telefono: userData.telefono,
        codigo_pais: userData.codigo_pais,
        contrasena: userData.contrasena,
        rol: userData.rol || 'Cliente',
        activo: userData.activo !== undefined ? userData.activo : true
      };

      const response = await fetch(apiEndpoints.usuarios, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
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
      console.error('Error registering external user:', error);
      return {
        success: false,
        error: 'Error de conexión al registrar usuario',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los usuarios del sistema (incluyendo clientes registrados externamente)
   */
  async getAllUsuarios(): Promise<ApiResponse<UsuarioResponse[]>> {
    try {
      // Obtener el ID del usuario logueado para verificar autenticación
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener TODOS los usuarios sin filtrar por creado_por
      const response = await fetch(`${apiEndpoints.usuarios}`, {
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
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}&creado_por=eq.${currentUserId}`, {
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
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}&creado_por=eq.${currentUserId}`, {
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
      const response = await fetch(`${apiEndpoints.usuarios}?id=eq.${id}&creado_por=eq.${currentUserId}`, {
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

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de usuarios'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
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
   * Obtiene todos los contactos del usuario logueado
   */
  async getAllContactos(): Promise<ApiResponse<ContactResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar contactos por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.contactos}?creado_por=eq.${userId}`, {
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
   * Actualiza un contacto existente (solo del usuario logueado)
   */
  async updateContacto(id: number, contactData: Partial<ContactData>): Promise<ApiResponse<ContactResponse>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Actualizar solo si el contacto pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.contactos}?id=eq.${id}&creado_por=eq.${userId}`, {
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
   * Elimina un contacto (solo del usuario logueado)
   */
  async deleteContacto(id: number): Promise<ApiResponse<void>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar solo si el contacto pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.contactos}?id=eq.${id}&creado_por=eq.${userId}`, {
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

  /**
   * Obtiene el conteo de contactos del usuario logueado
   */
  async getContactosCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar contactos del usuario logueado
      const response = await fetch(`${apiEndpoints.contactos}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de contactos'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting contacts:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar contactos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ===== MÉTODOS PARA ESPACIOS DE TRABAJO =====

  /**
   * Obtiene todos los espacios de trabajo del usuario logueado
   */
  async getAllEspaciosTrabajo(): Promise<ApiResponse<EspacioTrabajoResponse[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar espacios de trabajo por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?creado_por=eq.${userId}`, {
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
   * Actualiza un espacio de trabajo existente (solo del usuario logueado)
   */
  async updateEspacioTrabajo(id: number, espacioData: Partial<EspacioTrabajoData>): Promise<ApiResponse<EspacioTrabajoResponse>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Actualizar solo si el espacio pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?id=eq.${id}&creado_por=eq.${userId}`, {
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
   * Elimina un espacio de trabajo (solo del usuario logueado)
   */
  async deleteEspacioTrabajo(id: number): Promise<ApiResponse<void>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar solo si el espacio pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?id=eq.${id}&creado_por=eq.${userId}`, {
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

  /**
   * Obtiene el conteo de espacios de trabajo del usuario logueado
   */
  async getEspaciosTrabajoCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar espacios de trabajo del usuario logueado
      const response = await fetch(`${apiEndpoints.espacios_de_trabajo}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de espacios de trabajo'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting espacios de trabajo:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar espacios de trabajo',
        details: error instanceof Error ? error.message : 'Error desconocido'
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

  // ===== MÉTODOS PARA RESPUESTAS RÁPIDAS =====

  /**
   * Obtiene todas las respuestas rápidas del usuario logueado
   */
  async getAllRespuestasRapidas(): Promise<ApiResponse<RespuestaRapida[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Filtrar respuestas rápidas por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?creado_por=eq.${userId}&order=created_at.desc`, {
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
   * Obtiene una respuesta rápida por ID (solo del usuario logueado)
   */
  async getRespuestaRapidaById(id: number): Promise<ApiResponse<RespuestaRapida>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
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
      // Obtener el ID del usuario logueado como creador
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const response = await fetch(apiEndpoints.respuestasRapidas, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...data,
          activa: true,
          creado_por: userId // Asignar el creador
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
   * Actualiza una respuesta rápida existente (solo del usuario logueado)
   */
  async updateRespuestaRapida(id: number, data: Partial<RespuestaRapida>): Promise<ApiResponse> {
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
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
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
   * Elimina una respuesta rápida (solo del usuario logueado)
   */
  async deleteRespuestaRapida(id: number): Promise<ApiResponse> {
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
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
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
   * Cambia el estado activo/inactivo de una respuesta rápida (solo del usuario logueado)
   */
  async toggleRespuestaRapidaStatus(id: number, activa: boolean): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Cambiar estado solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?id=eq.${id}&creado_por=eq.${userId}`, {
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

  /**
   * Obtiene el conteo de respuestas rápidas del usuario logueado
   */
  async getRespuestasRapidasCount(): Promise<ApiResponse<number>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Contar respuestas rápidas del usuario logueado
      const response = await fetch(`${apiEndpoints.respuestasRapidas}?creado_por=eq.${userId}&select=id`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de respuestas rápidas'
        };
      }

      const data = await this.handleResponse(response);
      const count = Array.isArray(data) ? data.length : 0;
      
      return {
        success: true,
        data: count
      };

    } catch (error) {
      console.error('Error counting respuestas rápidas:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar respuestas rápidas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ===== MÉTODOS PARA ETIQUETAS =====

  /**
   * Obtiene todas las etiquetas del usuario logueado
   */
  async getAllEtiquetas(): Promise<ApiResponse<Etiqueta[]>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Obtener etiquetas filtradas por creado_por (usuario logueado)
      const response = await fetch(`${apiEndpoints.etiquetas}?creado_por=eq.${userId}&order=creado_en.desc`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await this.handleResponse(response);
      
      // Transformar los datos para mantener compatibilidad con la interfaz existente
      const etiquetas = Array.isArray(data) ? data.map((etiqueta: any) => ({
        id: etiqueta.id,
        nombre: etiqueta.nombre || '', // Asegurar que siempre tenga nombre
        color: etiqueta.color || '#00b894', // Color por defecto si no existe
        descripcion: etiqueta.descripcion || '', // Descripción vacía si no existe
        activa: true, // Por defecto las etiquetas están activas
        creado_por: etiqueta.creado_por,
        creado_en: etiqueta.creado_en,
        created_at: etiqueta.creado_en // Mapear fecha para compatibilidad
      })).filter(etiqueta => etiqueta.nombre && etiqueta.id) : []; // Filtrar etiquetas inválidas
      
      return { success: true, data: etiquetas };
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Crea una nueva etiqueta
   */
  async createEtiqueta(etiquetaData: Omit<Etiqueta, 'id' | 'creado_por' | 'creado_en' | 'created_at'>): Promise<ApiResponse<Etiqueta>> {
    try {
      // Obtener el ID del usuario logueado como creador
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const dataToSend = {
        nombre: etiquetaData.nombre,
        color: etiquetaData.color,
        descripcion: etiquetaData.descripcion || '',
        creado_por: currentUserId
      };

      const response = await fetch(apiEndpoints.etiquetas, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend),
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
      
      // Asegurar que la respuesta tenga la estructura correcta
      const etiquetaCreada: Etiqueta = {
        id: data.id,
        nombre: data.nombre || '',
        color: data.color || '#00b894',
        descripcion: data.descripcion || '',
        activa: true,
        creado_por: data.creado_por,
        creado_en: data.creado_en,
        created_at: data.creado_en
      };
      
      return {
        success: true,
        data: etiquetaCreada
      };

    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una etiqueta existente
   */
  async updateEtiqueta(id: number, etiquetaData: Partial<Omit<Etiqueta, 'id' | 'creado_por' | 'creado_en' | 'created_at'>>): Promise<ApiResponse<Etiqueta>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      const dataToSend: any = {};
      if (etiquetaData.nombre) dataToSend.nombre = etiquetaData.nombre;
      if (etiquetaData.color) dataToSend.color = etiquetaData.color;
      if (etiquetaData.descripcion !== undefined) dataToSend.descripcion = etiquetaData.descripcion;

      // Actualizar solo si pertenece al usuario logueado
      const response = await fetch(`${apiEndpoints.etiquetas}?id=eq.${id}&creado_por=eq.${userId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(dataToSend),
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
      
      // Asegurar que la respuesta tenga la estructura correcta
      const etiquetaActualizada: Etiqueta = {
        id: data.id,
        nombre: data.nombre || '',
        color: data.color || '#00b894',
        descripcion: data.descripcion || '',
        activa: true,
        creado_por: data.creado_por,
        creado_en: data.creado_en,
        created_at: data.creado_en
      };
      
      return {
        success: true,
        data: etiquetaActualizada
      };

    } catch (error) {
      console.error('Error al actualizar etiqueta:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina una etiqueta por ID
   */
  async deleteEtiqueta(id: number): Promise<ApiResponse<void>> {
    try {
      // Obtener el ID del usuario logueado
      const userId = this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }

      // Eliminar etiqueta por ID
      const response = await fetch(`${apiEndpoints.etiquetas}?id=eq.${id}`, {
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

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
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
   * Obtiene todos los mensajes con información de tipo de canal
   * El tipo de canal debe venir directamente desde el backend mediante JOIN con tabla canales
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
      
      console.log('📦 Mensajes obtenidos del API:', data);
      
      // Los mensajes vienen sin tipo de canal, se enriquecerá en el frontend
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

  // ================================
  // MÉTODOS PARA TAREAS
  // ================================

  /**
   * Obtiene todas las tareas
   */
  async getAllTareas(): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo todas las tareas');

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/tareas', {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Tareas obtenidas:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener tareas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTarea(tareaData: any): Promise<ApiResponse<any>> {
    try {
      console.log('Creando nueva tarea:', tareaData);

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/tareas', {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tareaData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Tarea creada exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Tarea creada exitosamente' };
      }

      console.log('Tarea creada exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al crear tarea:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear tarea',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTarea(tareaId: number, tareaData: any): Promise<ApiResponse<any>> {
    try {
      console.log('Actualizando tarea:', tareaId, tareaData);

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/tareas?id=eq.${tareaId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tareaData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Tarea actualizada exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Tarea actualizada exitosamente' };
      }

      console.log('Tarea actualizada exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar tarea',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina una tarea
   */
  async deleteTarea(tareaId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Eliminando tarea:', tareaId);

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/tareas?id=eq.${tareaId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      console.log('Tarea eliminada exitosamente');

      return { 
        success: true, 
        data: { message: 'Tarea eliminada exitosamente' }
      };
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar tarea',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ================================
  // MÉTODOS PARA CHAT INTERNO
  // ================================

  /**
   * Crea una nueva conversación de chat interno para soporte al cliente
   */
  async createChatInternoConversation(clienteId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Creando conversación de chat interno para cliente:', clienteId);

      const conversationData = {
        cliente_id: clienteId,
        estado: 'PENDIENTE'
      };

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno', {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversationData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Conversación creada exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Conversación creada exitosamente' };
      }

      console.log('Conversación de chat interno creada exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al crear conversación de chat interno:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica si ya existe una conversación de chat interno para un cliente
   */
  async checkExistingChatInternoConversation(clienteId: number): Promise<ApiResponse<boolean>> {
    try {
      console.log('Verificando conversación existente para cliente:', clienteId);

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno?cliente_id=eq.${clienteId}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Conversaciones existentes:', data);

      // Si hay conversaciones existentes, retorna true
      const hasExistingConversation = Array.isArray(data) && data.length > 0;

      return { 
        success: true, 
        data: hasExistingConversation 
      };
    } catch (error) {
      console.error('Error al verificar conversación existente:', error);
      return { 
        success: false, 
        error: 'Error de conexión al verificar conversación existente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la conversación de chat interno para un cliente específico
   */
  async getChatInternoConversation(clienteId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Obteniendo conversación de chat interno para cliente:', clienteId);

      // Buscar solo conversaciones activas (no FINALIZADAS) ordenadas por fecha de creación descendente
      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno?cliente_id=eq.${clienteId}&estado=neq.FINALIZADO&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Conversaciones activas encontradas:', data);

      // Retorna la conversación más reciente (primera en el array ordenado)
      const conversation = Array.isArray(data) && data.length > 0 ? data[0] : null;

      return { 
        success: true, 
        data: conversation 
      };
    } catch (error) {
      console.error('Error al obtener conversación:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener conversación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todas las conversaciones de chat interno
   */
  async getAllChatInternoConversations(): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo todas las conversaciones de chat interno');

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno', {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Conversaciones de chat interno obtenidas:', data);

      return { 
        success: true, 
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Error al obtener conversaciones de chat interno:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener conversaciones de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los mensajes de una conversación de chat interno específica
   */
  async getMensajesInternosByConversation(chatInternoId: number): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo mensajes para conversación:', chatInternoId);

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?chat_interno_id=eq.${chatInternoId}&order=created_at.asc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Mensajes obtenidos para conversación:', data);

      return { 
        success: true, 
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Error al obtener mensajes de conversación:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes de conversación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una conversación de chat interno (asigna operador)
   */
  async updateChatInternoConversation(chatInternoId: number, operadorId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Actualizando conversación de chat interno:', { chatInternoId, operadorId });

      const updateData = {
        operador_id: operadorId,
        estado: 'EN CURSO'
      };

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno?id=eq.${chatInternoId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Conversación actualizada exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Conversación actualizada exitosamente' };
      }

      console.log('Conversación de chat interno actualizada exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al actualizar conversación de chat interno:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar conversación de chat interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Marca los mensajes del cliente como leídos cuando el operador responde
   */
  async markMensajesInternosAsRead(chatInternoId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Marcando mensajes como leídos para conversación:', chatInternoId);

      const updateData = {
        leido: true
      };

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?chat_interno_id=eq.${chatInternoId}&emisor=eq.cliente`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Mensajes marcados como leídos exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Mensajes marcados como leídos exitosamente' };
      }

      console.log('Mensajes marcados como leídos exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      return { 
        success: false, 
        error: 'Error de conexión al marcar mensajes como leídos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo total de mensajes por conversación
   */
  async getTotalMessagesCounts(): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo conteo total de mensajes por conversación');

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?select=chat_interno_id', {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Mensajes totales obtenidos:', data);

      // Contar mensajes por conversación
      const counts: { [key: number]: number } = {};
      if (Array.isArray(data)) {
        data.forEach((message: any) => {
          const chatId = message.chat_interno_id;
          counts[chatId] = (counts[chatId] || 0) + 1;
        });
      }

      return { 
        success: true, 
        data: counts 
      };
    } catch (error) {
      console.error('Error al obtener conteo total de mensajes:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener conteo total de mensajes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de mensajes no leídos por conversación
   */
  async getUnreadMessagesCounts(): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo conteo de mensajes no leídos');

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?select=chat_interno_id&emisor=eq.cliente&leido=eq.false', {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Mensajes no leídos obtenidos:', data);

      // Contar mensajes por conversación
      const counts: { [key: number]: number } = {};
      if (Array.isArray(data)) {
        data.forEach((message: any) => {
          const chatId = message.chat_interno_id;
          counts[chatId] = (counts[chatId] || 0) + 1;
        });
      }

      return { 
        success: true, 
        data: counts 
      };
    } catch (error) {
      console.error('Error al obtener conteo de mensajes no leídos:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener conteo de mensajes no leídos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Verifica si el cliente tiene una conversación de chat interno activa
   */
  async checkClientChatInternoConversation(clienteId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Verificando conversación de chat interno para cliente:', clienteId);

      // Buscar todas las conversaciones ordenadas por fecha de creación descendente (más reciente primero)
      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno?cliente_id=eq.${clienteId}&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Conversaciones de cliente obtenidas (ordenadas por fecha):', data);

      // Retorna la conversación más reciente (primera en el array ordenado) o null
      const conversation = Array.isArray(data) && data.length > 0 ? data[0] : null;

      return { 
        success: true, 
        data: conversation 
      };
    } catch (error) {
      console.error('Error al verificar conversación del cliente:', error);
      return { 
        success: false, 
        error: 'Error de conexión al verificar conversación del cliente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los mensajes de una conversación de chat interno para el cliente
   */
  async getClientMensajesInternos(chatInternoId: number): Promise<ApiResponse<any[]>> {
    try {
      console.log('Obteniendo mensajes de chat interno para conversación:', chatInternoId);

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?chat_interno_id=eq.${chatInternoId}&order=created_at.asc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
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

      const data = await response.json();
      console.log('Mensajes del cliente obtenidos:', data);

      return { 
        success: true, 
        data: Array.isArray(data) ? data : []
      };
    } catch (error) {
      console.error('Error al obtener mensajes del cliente:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener mensajes del cliente',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Marca los mensajes del operador como leídos cuando el cliente los ve
   */
  async markOperatorMessagesAsRead(chatInternoId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Marcando mensajes del operador como leídos para conversación:', chatInternoId);

      const updateData = {
        leido: true
      };

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?chat_interno_id=eq.${chatInternoId}&emisor=eq.operador&leido=eq.false`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Mensajes del operador marcados como leídos exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Mensajes del operador marcados como leídos exitosamente' };
      }

      console.log('Mensajes del operador marcados como leídos exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al marcar mensajes del operador como leídos:', error);
      return { 
        success: false, 
        error: 'Error de conexión al marcar mensajes del operador como leídos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Finaliza una conversación de chat interno cambiando su estado a FINALIZADO
   */
  async finalizeChatInternoConversation(chatInternoId: number): Promise<ApiResponse<any>> {
    try {
      console.log('Finalizando conversación de chat interno:', chatInternoId);

      const updateData = {
        estado: 'FINALIZADO'
      };

      const response = await fetch(`https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/chat_interno?id=eq.${chatInternoId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Conversación finalizada exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Conversación finalizada exitosamente' };
      }

      console.log('Conversación finalizada exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al finalizar conversación:', error);
      return { 
        success: false, 
        error: 'Error de conexión al finalizar conversación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un mensaje interno en una conversación de chat interno
   */
  async createMensajeInterno(chatInternoId: number, mensaje: string, emisor: 'cliente' | 'operador' = 'cliente'): Promise<ApiResponse<any>> {
    try {
      console.log('Creando mensaje interno para conversación:', chatInternoId);

      const messageData = {
        chat_interno_id: chatInternoId,
        mensaje: mensaje,
        leido: false,
        emisor: emisor
      };

      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos', {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
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

      // Manejar respuesta vacía o no-JSON
      let data = null;
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      if (responseText && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.warn('No se pudo parsear JSON, pero la operación fue exitosa:', responseText);
          data = { success: true, message: 'Mensaje interno creado exitosamente' };
        }
      } else {
        console.log('Respuesta exitosa sin JSON:', responseText);
        data = { success: true, message: 'Mensaje interno creado exitosamente' };
      }

      console.log('Mensaje interno creado exitosamente:', data);

      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      console.error('Error al crear mensaje interno:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear mensaje interno',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const supabaseService = new SupabaseService();
