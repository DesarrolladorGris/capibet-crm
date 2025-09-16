// Tipos para respuestas rápidas
export interface RespuestaRapidaData {
  id?: number;
  titulo: string;
  contenido: string;
  categoria?: string;
  activa?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RespuestaRapidaResponse {
  id: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RespuestaRapidaFormData {
  titulo: string;
  contenido: string;
  categoria?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
}

export interface ToggleStatusRequest {
  activa: boolean;
}
