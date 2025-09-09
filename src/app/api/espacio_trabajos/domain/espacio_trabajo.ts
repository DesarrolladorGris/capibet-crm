// Tipos para espacios de trabajo
export interface EspacioTrabajoData {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string;
}

export interface EspacioTrabajoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}