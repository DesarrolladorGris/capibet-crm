// Tipos para autenticación
export interface LoginCredentials {
  correo_electronico: string;
  contrasena: string;
}

// Tipos para usuarios
export interface UsuarioData {
  id?: number;
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  contrasena: string;
  rol?: string;
  activo?: boolean;
}

export interface UsuarioResponse {
  id: number;
  nombre_agencia: string;
  tipo_empresa: string;
  nombre_usuario: string;
  correo_electronico: string;
  telefono: string;
  codigo_pais: string;
  rol: string;
  activo: boolean;
  fecha_alta?: string;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface ToggleStatusRequest {
  activo: boolean;
}
