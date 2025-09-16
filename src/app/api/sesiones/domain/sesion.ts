// Tipos para sesiones
export interface SesionData {
  id?: number;
  canal_id: number;
  usuario_id: number;
  nombre: string;
  api_key?: string;
  access_token?: string;
  phone_number?: string;
  email_user?: string;
  email_password?: string;
  smtp_host?: string;
  smtp_port?: number;
  imap_host?: string;
  imap_port?: number;
  estado?: string;
  creado_en?: string;
  actualizado_en?: string;
  creado_por?: number;
}

export interface SesionResponse {
  id: number;
  canal_id: number;
  usuario_id: number;
  nombre: string;
  api_key: string;
  access_token: string;
  phone_number: string;
  email_user: string;
  email_password: string;
  smtp_host: string;
  smtp_port: number;
  imap_host: string;
  imap_port: number;
  estado: string;
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
