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
  embudo_id: number;
  description?: string;
  email?: string;
  given_name?: string;
  picture?: string;
  whatsapp_session?: string; // UUID para sesiones de WhatsApp
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
  embudo_id: number;
  description?: string;
  email?: string;
  given_name?: string;
  picture?: string;
  whatsapp_session?: string; // UUID para sesiones de WhatsApp
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
