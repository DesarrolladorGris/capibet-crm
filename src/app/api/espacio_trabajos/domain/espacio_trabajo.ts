// Tipos para espacios de trabajo
export interface EspacioTrabajoData {
  id?: number;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}