export interface ChatData {
  id?: number;
  sesion_id: number;
  contact_id: number;
}

export interface ChatResponse {
  id: number;
  sesion_id: number;
  contact_id: number;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface IChat extends ChatData {}
