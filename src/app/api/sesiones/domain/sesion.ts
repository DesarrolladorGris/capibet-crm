// Tipos para sesiones
export interface SesionData {
  id?: number;
  usuario_id: number;
  nombre: string;
  estado?: string;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: number;
  type: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook';
  facebook_access_token?: string;
  facebook_user_id?: string;
  espacio_de_trabajo_id: number;
  description?: string;
  gmail_access_token?: string;
  gmail_refresh_token?: string;
  email?: string;
  given_name?: string;
  picture?: string;
  gmail_user_id?: string;
}

export interface SesionResponse {
  id: number;
  usuario_id: number;
  nombre: string;
  estado: string;
  creado_en: string;
  actualizado_en: string;
  creado_por: number;
  type: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook';
  facebook_access_token?: string;
  facebook_user_id?: string;
  espacio_de_trabajo_id: number;
  description?: string;
  gmail_access_token?: string;
  gmail_refresh_token?: string;
  email?: string;
  given_name?: string;
  picture?: string;
  gmail_user_id?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
