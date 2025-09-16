// Tipos de datos para contactos
export interface ContactData {
  nombre: string;
  apellido: string;
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
  apellido: string;
  nombre_completo: string;
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
  created_at: string;
  updated_at: string;
}

export interface ImportResponse {
  message: string;
  errores?: string[];
}

// Tipos para las respuestas de la API
interface ApiResponse<T = unknown> {
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
  contactos: `${API_BASE_URL}/api/contactos`,
  contactosById: (id: number) => `${API_BASE_URL}/api/contactos/${id}`,
  contactosImportar: `${API_BASE_URL}/api/contactos/importar`,
  contactosExportar: `${API_BASE_URL}/api/contactos/exportar`
};

class ContactoServices {
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
   * Obtiene todos los contactos del usuario logueado
   */
  async getAllContactos(): Promise<ApiResponse<ContactResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.contactos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<ContactResponse[]>>(response);
      return data;

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

      const data = await this.handleResponse<ApiResponse<ContactResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating contact:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContacto(contactData: Partial<ContactData> & { id: number }): Promise<ApiResponse<ContactResponse>> {
    try {
      const response = await fetch(apiEndpoints.contactos, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(contactData)
      });

      const data = await this.handleResponse<ApiResponse<ContactResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating contact:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un contacto
   */
  async deleteContacto(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${apiEndpoints.contactos}?id=${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting contact:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar contacto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Importa contactos desde un archivo CSV
   */
  async importarContactos(file: File): Promise<ApiResponse<ImportResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(apiEndpoints.contactosImportar, {
        method: 'POST',
        body: formData
      });

      const data = await this.handleResponse<ApiResponse<ImportResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error importing contacts:', error);
      
      return {
        success: false,
        error: 'Error de conexión al importar contactos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Exporta todos los contactos a CSV
   */
  async exportarContactos(): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(apiEndpoints.contactosExportar, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error del servidor: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const blob = await response.blob();
      
      return {
        success: true,
        data: blob
      };

    } catch (error) {
      console.error('Error exporting contacts:', error);
      
      return {
        success: false,
        error: 'Error de conexión al exportar contactos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de contactos del usuario logueado
   */
  async getContactosCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllContactos();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de contactos'
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

// Exportar una instancia singleton del servicio
export const contactoServices = new ContactoServices();

// Exportar también la clase para casos especiales
export default ContactoServices;
