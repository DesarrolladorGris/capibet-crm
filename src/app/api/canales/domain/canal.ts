// Tipos para canales
export interface CanalData {
  id?: number;
  usuario_id: number;
  espacio_id: number;
  tipo: string;
  descripcion: string;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: number;
}

export interface CanalResponse {
  id: number;
  usuario_id: number;
  espacio_id: number;
  tipo: string;
  descripcion: string;
  creado_en: string;
  actualizado_en: string;
  creado_por: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
