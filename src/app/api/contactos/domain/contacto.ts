export interface IContacto {
    id?: number;
    nombre: string;
    apellido?: string;
    nombre_completo?: string;
    correo: string;
    telefono: string;
    empresa?: string;
    cargo?: string;
    notas?: string;
    direccion?: string;
    cumpleaños?: string;
    sitio_web?: string;
    etiqueta?: string;
    empresa_id?: number;
    creado_por: number;
}