// Tipos para mensajes
export interface MensajeData {
  id?: number;
  remitente_id: number;
  contacto_id: number;
  creado_en?: string;
  chat_id: number;
  type: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook';
  content: Record<string, unknown>;
}

export interface MensajeResponse {
  id: number;
  remitente_id: number;
  contacto_id: number;
  creado_en: string;
  chat_id: number;
  type: 'whatsapp_qr' | 'whatsapp_api' | 'messenger' | 'instagram' | 'telegram' | 'telegram_bot' | 'gmail' | 'outlook';
  content: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
