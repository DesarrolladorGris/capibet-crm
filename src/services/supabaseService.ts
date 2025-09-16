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

// Tipos para productos
export interface ProductoData {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad: number;
  moneda: 'USD' | 'PESO' | 'DOLAR';
  creado_por?: number;
}

export interface ProductoResponse {
  id: number;
  created_at: string;
  creado_por: number;
  nombre: string;
  moneda: 'USD' | 'PESO' | 'DOLAR';
  precio: number;
  cantidad: number;
  descripcion?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// Tipos para ventas de fichas digitales
export interface VentaFichasDigitales {
  id: number;
  cliente_id: number;
  vendedor_id: number;
  monto_compra: number;
  fichas_otorgadas: number;
  valor_ficha: number;
  metodo_pago: 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA' | 'CRIPTO';
  estado: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  codigo_venta: string;
  fecha_venta: string;
}

export interface VentaFichasDigitalesData {
  id?: number;
  cliente_id: number;
  vendedor_id: number;
  monto_compra: number;
  fichas_otorgadas: number;
  valor_ficha: number;
  metodo_pago: 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA' | 'CRIPTO';
  estado?: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  codigo_venta: string;
  fecha_venta?: string;
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
  configuracion?: Record<string, any>;
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
  configuracion?: Record<string, any>;
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

  // ===== MÉTODOS PARA VENTAS DE FICHAS DIGITALES =====

  /**
   * Obtiene todas las ventas de fichas digitales
   */
  async getAllVentasFichasDigitales(): Promise<ApiResponse<VentaFichasDigitales[]>> {
    try {
      console.log('▶ Obteniendo todas las ventas de fichas digitales...');
      
      const response = await fetch(`${apiEndpoints.ventasFichasDigitales}?select=*&order=fecha_venta.desc`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data: VentaFichasDigitales[] = await response.json();
      console.log('✓ Ventas de fichas digitales obtenidas:', data.length);

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('✗ Error al obtener ventas de fichas digitales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener ventas de fichas digitales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene una venta específica por ID
   */
  async getVentaFichasDigitalesById(id: number): Promise<ApiResponse<VentaFichasDigitales>> {
    try {
      console.log('▶ Obteniendo venta de fichas digitales por ID:', id);
      
      const response = await fetch(`${apiEndpoints.ventasFichasDigitales}?id=eq.${id}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      const data: VentaFichasDigitales[] = await response.json();
      
      if (data.length === 0) {
        return {
          success: false,
          error: 'Venta no encontrada'
        };
      }

      console.log('✓ Venta de fichas digitales obtenida:', data[0]);

      return {
        success: true,
        data: data[0]
      };
    } catch (error) {
      console.error('✗ Error al obtener venta de fichas digitales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al obtener venta de fichas digitales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea una nueva venta de fichas digitales
   */
  async createVentaFichasDigitales(ventaData: VentaFichasDigitalesData): Promise<ApiResponse<VentaFichasDigitales>> {
    try {
      console.log('▶ Creando nueva venta de fichas digitales:', ventaData);
      
      const response = await fetch(apiEndpoints.ventasFichasDigitales, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response body:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      // Verificar si hay contenido en la respuesta
      const responseText = await response.text();
      console.log('📄 Respuesta del servidor:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('✓ Venta creada exitosamente (sin contenido en respuesta)');
        return {
          success: true,
          data: null
        };
      }

      const data: VentaFichasDigitales = JSON.parse(responseText);
      console.log('✓ Venta de fichas digitales creada:', data);

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('✗ Error al crear venta de fichas digitales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al crear venta de fichas digitales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza una venta de fichas digitales por ID
   */
  async updateVentaFichasDigitales(id: number, data: VentaFichasDigitalesData): Promise<ApiResponse<VentaFichasDigitales>> {
    try {
      console.log('📄 Actualizando venta de fichas digitales:', id, data);
      
      const response = await fetch(`${apiEndpoints.ventasFichasDigitales}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('✗ Error del servidor al actualizar venta:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      // Verificar si hay contenido en la respuesta
      const responseText = await response.text();
      console.log('📄 Respuesta del servidor (actualización):', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('✓ Venta actualizada exitosamente (sin contenido en respuesta)');
        return {
          success: true,
          data: null
        };
      }

      const updatedData: VentaFichasDigitales[] = JSON.parse(responseText);
      console.log('✓ Venta de fichas digitales actualizada:', updatedData[0]);

      return {
        success: true,
        data: updatedData[0]
      };
    } catch (error) {
      console.error('✗ Error al actualizar venta de fichas digitales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al actualizar venta de fichas digitales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina una venta de fichas digitales por ID
   */
  async deleteVentaFichasDigitales(id: number): Promise<ApiResponse<null>> {
    try {
      console.log('🗑 Eliminando venta de fichas digitales:', id);
      
      const response = await fetch(`${apiEndpoints.ventasFichasDigitales}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseConfig.serviceRoleKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('✗ Error del servidor al eliminar venta:', errorData);
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`,
          details: errorData
        };
      }

      console.log('✓ Venta de fichas digitales eliminada:', id);

      return {
        success: true,
        data: null
      };
    } catch (error) {
      console.error('✗ Error al eliminar venta de fichas digitales:', error);
      return { 
        success: false, 
        error: 'Error de conexión al eliminar venta de fichas digitales',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const supabaseService = new SupabaseService();
