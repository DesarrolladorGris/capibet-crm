import { ProductData, ProductResponse } from '../app/api/productos/domain/producto';

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
  productos: `${API_BASE_URL}/api/productos`,
  productosById: (id: number) => `${API_BASE_URL}/api/productos/${id}`,
  productosDelete: (id: number) => `${API_BASE_URL}/api/productos?id=${id}`
};

class ProductosServices {
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
   * Obtiene todos los productos
   */
  async getAllProductos(): Promise<ApiResponse<ProductResponse[]>> {
    try {
      const response = await fetch(apiEndpoints.productos, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<ProductResponse[]>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching products:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un producto por ID
   */
  async getProductoById(id: number): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await fetch(apiEndpoints.productosById(id), {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse<ProductResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error fetching product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al obtener producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo producto
   */
  async createProducto(productoData: ProductData): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await fetch(apiEndpoints.productos, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(productoData)
      });

      const data = await this.handleResponse<ApiResponse<ProductResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error creating product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al crear producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un producto existente (usando PATCH general)
   */
  async updateProducto(productoData: ProductData): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await fetch(apiEndpoints.productos, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(productoData)
      });

      const data = await this.handleResponse<ApiResponse<ProductResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un producto existente por ID
   */
  async updateProductoById(id: number, productoData: Partial<ProductData>): Promise<ApiResponse<ProductResponse>> {
    try {
      const response = await fetch(apiEndpoints.productosById(id), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(productoData)
      });

      const data = await this.handleResponse<ApiResponse<ProductResponse>>(response);
      return data;

    } catch (error) {
      console.error('Error updating product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al actualizar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un producto por ID (usando query parameter)
   */
  async deleteProducto(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.productosDelete(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un producto por ID (usando ruta directa)
   */
  async deleteProductoById(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(apiEndpoints.productosById(id), {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<ApiResponse>(response);
      return data;

    } catch (error) {
      console.error('Error deleting product:', error);
      
      return {
        success: false,
        error: 'Error de conexión al eliminar producto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene el conteo de productos (método auxiliar que puede ser útil)
   */
  async getProductosCount(): Promise<ApiResponse<number>> {
    try {
      const response = await this.getAllProductos();
      
      if (response.success && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data.length
        };
      }
      
      return {
        success: false,
        error: 'Error al obtener el conteo de productos'
      };

    } catch (error) {
      console.error('Error counting products:', error);
      
      return {
        success: false,
        error: 'Error de conexión al contar productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Busca productos por nombre (método auxiliar)
   */
  async searchProductosByNombre(nombre: string): Promise<ApiResponse<ProductResponse[]>> {
    try {
      const response = await this.getAllProductos();
      
      if (response.success && Array.isArray(response.data)) {
        const filteredProducts = response.data.filter(producto => 
          producto.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
        
        return {
          success: true,
          data: filteredProducts
        };
      }
      
      return {
        success: false,
        error: 'Error al buscar productos'
      };

    } catch (error) {
      console.error('Error searching products:', error);
      
      return {
        success: false,
        error: 'Error de conexión al buscar productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Exportar una instancia singleton del servicio
export const productosServices = new ProductosServices();

// Exportar también la clase para casos especiales
export default ProductosServices;
