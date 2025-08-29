-- 🏷️ Tabla de Etiquetas - Beast CRM
-- Ejecutar en Supabase SQL Editor

-- Crear tabla
CREATE TABLE etiquetas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas
CREATE INDEX idx_etiquetas_nombre ON etiquetas(nombre);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_etiquetas_updated_at 
    BEFORE UPDATE ON etiquetas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo
INSERT INTO etiquetas (nombre, color, descripcion) VALUES
('Cliente VIP', '#00b894', 'Clientes de alto valor'),
('Urgente', '#d63031', 'Tareas prioritarias'),
('Nuevo', '#0984e3', 'Elementos recientes'),
('Oferta', '#fd79a8', 'Promociones activas'),
('Completado', '#00b894', 'Tareas finalizadas');

-- Verificar
SELECT * FROM etiquetas;
