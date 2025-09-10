import { apiEndpoints } from '@/config/supabase';
import { getCurrentUserId } from '@/utils/auth';

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

export class ContactoService {
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
   * Obtiene todos los contactos del usuario logueado
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

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al obtener los contactos'
        };
      }

      return {
        success: true,
        data: Array.isArray(proxyResponse.data) ? proxyResponse.data : []
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
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al crear contacto',
          details: proxyResponse.details
        };
      }

      return {
        success: true,
        data: proxyResponse.data as ContactResponse
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
      const response = await fetch(apiEndpoints.contactos, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ id, ...contactData }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al actualizar contacto',
          details: proxyResponse.details
        };
      }

      return {
        success: true,
        data: proxyResponse.data as ContactResponse
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
      const response = await fetch(`${apiEndpoints.contactos}?id=${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al eliminar contacto',
          details: proxyResponse.details
        };
      }

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
   * Obtiene el conteo de contactos
   */
  async getContactosCount(): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(apiEndpoints.contactos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Error al obtener el conteo de contactos'
        };
      }

      const proxyResponse = await response.json();
      
      // El proxy ya devuelve el formato { success, data, error }
      if (!proxyResponse.success) {
        return {
          success: false,
          error: proxyResponse.error || 'Error al obtener el conteo de contactos'
        };
      }

      const count = Array.isArray(proxyResponse.data) ? proxyResponse.data.length : 0;
      
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
}

export const contactoService = new ContactoService();
