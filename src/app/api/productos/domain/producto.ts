export interface ProductData {
  id?: number;
  nombre: string;
  moneda: string;
  precio: number;
  cantidad: number;
  descripcion?: string;
  creado_por: number;
}

export interface ProductResponse {
  id: number;
  nombre: string;
  moneda: string;
  precio: number;
  cantidad: number;
  descripcion?: string;
  creado_por: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface IProducto extends ProductData {}
