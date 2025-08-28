-- 💬 Tabla de Respuestas Rápidas - Beast CRM
-- Ejecutar en Supabase SQL Editor

-- Crear tabla
CREATE TABLE respuestas_rapidas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas
CREATE INDEX idx_respuestas_rapidas_titulo ON respuestas_rapidas(titulo);
CREATE INDEX idx_respuestas_rapidas_categoria ON respuestas_rapidas(categoria);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_respuestas_rapidas_updated_at 
    BEFORE UPDATE ON respuestas_rapidas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo
INSERT INTO respuestas_rapidas (titulo, contenido, categoria) VALUES
('Bienvenida', '¡Hola! Bienvenido a Capibet Casino. ¿En qué puedo ayudarte hoy?', 'General'),
('Problema de Pago', 'Entiendo que tienes un problema con el pago. Te ayudo a resolverlo paso a paso.', 'Soporte'),
('Promociones', 'Tenemos excelentes promociones disponibles. Te envío el enlace con todos los detalles.', 'Marketing'),
('Cierre de Sesión', 'Para cerrar sesión, haz clic en tu nombre en la esquina superior derecha y selecciona "Cerrar Sesión".', 'Cuenta');

-- Verificar
SELECT * FROM respuestas_rapidas;
