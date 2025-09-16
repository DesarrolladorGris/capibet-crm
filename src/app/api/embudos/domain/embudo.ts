// Tipos para embudos
export interface EmbudoData {
  nombre: string;
  descripcion?: string;
  creado_por: number;
  espacio_id: number;
  orden?: number;
}

export interface EmbudoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  creado_por: number;
  creado_en: string;
  actualizado_en: string;
  espacio_id: number;
  orden: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface UpdateOrderRequest {
  embudos: Array<{
    id: number;
    orden: number;
  }>;
}
