// Tipos para etiquetas
export interface EtiquetaData {
  id?: number;
  nombre: string;
  color: string;
  descripcion: string;
  creado_por: number;
  creado_en?: string;
}

export interface EtiquetaResponse {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
  creado_por: number;
  creado_en: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
