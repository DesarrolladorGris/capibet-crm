-- Sistema de Emails - BeastCRM
-- Base de datos para gestión de múltiples cuentas de email

-- Tabla para almacenar las cuentas de email
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'custom')),
  is_connected BOOLEAN DEFAULT FALSE,
  unread_count INTEGER DEFAULT 0,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  imap_settings JSONB,
  smtp_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar los emails
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  message_id VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  labels TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  thread_id VARCHAR(255),
  folder VARCHAR(100) DEFAULT 'INBOX',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar borradores de email
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  to_emails TEXT[],
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT,
  content TEXT,
  html_content TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar etiquetas personalizadas
CREATE TABLE IF NOT EXISTS email_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#00b894',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar la relación entre emails y etiquetas
CREATE TABLE IF NOT EXISTS email_label_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES email_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email_id, label_id)
);

-- Tabla para almacenar plantillas de email
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  html_content TEXT,
  is_global BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar la configuración de sincronización
CREATE TABLE IF NOT EXISTS email_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  sync_interval INTEGER DEFAULT 300, -- en segundos
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'idle',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_emails_account_id ON emails(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date DESC);
CREATE INDEX IF NOT EXISTS idx_emails_subject ON emails USING gin(to_tsvector('spanish', subject));
CREATE INDEX IF NOT EXISTS idx_emails_content ON emails USING gin(to_tsvector('spanish', content));
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_is_starred ON emails(is_starred);

CREATE INDEX IF NOT EXISTS idx_email_drafts_account_id ON email_drafts(account_id);
CREATE INDEX IF NOT EXISTS idx_email_labels_account_id ON email_labels(account_id);
CREATE INDEX IF NOT EXISTS idx_email_sync_config_account_id ON email_sync_config(account_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_accounts_updated_at 
  BEFORE UPDATE ON email_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at 
  BEFORE UPDATE ON emails 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_drafts_updated_at 
  BEFORE UPDATE ON email_drafts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sync_config_updated_at 
  BEFORE UPDATE ON email_sync_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener estadísticas de emails por cuenta
CREATE OR REPLACE FUNCTION get_email_stats(account_uuid UUID)
RETURNS TABLE(
  total_emails BIGINT,
  unread_emails BIGINT,
  starred_emails BIGINT,
  sent_emails BIGINT,
  drafts_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_emails,
    COUNT(*) FILTER (WHERE NOT is_read)::BIGINT as unread_emails,
    COUNT(*) FILTER (WHERE is_starred)::BIGINT as starred_emails,
    COUNT(*) FILTER (WHERE folder = 'SENT')::BIGINT as sent_emails,
    (SELECT COUNT(*) FROM email_drafts WHERE account_id = account_uuid)::BIGINT as drafts_count
  FROM emails 
  WHERE account_id = account_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar emails con texto completo
CREATE OR REPLACE FUNCTION search_emails(
  account_uuid UUID,
  search_query TEXT,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  subject TEXT,
  from_email VARCHAR(255),
  preview TEXT,
  date TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN,
  is_starred BOOLEAN,
  labels TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.subject,
    e.from_email,
    LEFT(e.content, 200) as preview,
    e.date,
    e.is_read,
    e.is_starred,
    e.labels
  FROM emails e
  WHERE e.account_id = account_uuid
    AND (
      to_tsvector('spanish', e.subject) @@ plainto_tsquery('spanish', search_query)
      OR to_tsvector('spanish', e.content) @@ plainto_tsquery('spanish', search_query)
      OR e.from_email ILIKE '%' || search_query || '%'
    )
  ORDER BY e.date DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Datos de ejemplo para pruebas
INSERT INTO email_accounts (name, email, provider, is_connected, unread_count) VALUES
('Cuenta Principal', 'admin@capibet.com', 'gmail', true, 12),
('Soporte', 'soporte@capibet.com', 'outlook', true, 5),
('Ventas', 'ventas@capibet.com', 'gmail', false, 0)
ON CONFLICT (email) DO NOTHING;

-- Etiquetas del sistema
INSERT INTO email_labels (account_id, name, color, is_system) VALUES
((SELECT id FROM email_accounts WHERE email = 'admin@capibet.com'), 'Importante', '#ff6b6b', true),
((SELECT id FROM email_accounts WHERE email = 'admin@capibet.com'), 'Cliente', '#4ecdc4', true),
((SELECT id FROM email_accounts WHERE email = 'admin@capibet.com'), 'Cotización', '#45b7d1', true),
((SELECT id FROM email_accounts WHERE email = 'soporte@capibet.com'), 'Urgente', '#ffa726', true),
((SELECT id FROM email_accounts WHERE email = 'soporte@capibet.com'), 'Consulta', '#66bb6a', true)
ON CONFLICT DO NOTHING;

-- Plantillas de email globales
INSERT INTO email_templates (name, subject, content, is_global) VALUES
('Respuesta Estándar', 'Re: {subject}', 'Gracias por tu mensaje.\n\n{content}\n\nSaludos cordiales,\nEquipo de Capibet Casino', true),
('Confirmación de Cita', 'Confirmación de cita programada', 'Hola,\n\nTe confirmamos tu cita programada para el {fecha} a las {hora}.\n\nLugar: {lugar}\n\nPor favor confirma tu asistencia respondiendo a este email.\n\nSaludos,\nEquipo de Capibet Casino', true),
('Seguimiento de Cliente', 'Seguimiento - {nombre_cliente}', 'Hola {nombre_cliente},\n\nEsperamos que estés bien. Te contactamos para hacer seguimiento de tu consulta anterior.\n\n¿Hay algo en lo que podamos ayudarte?\n\nSaludos cordiales,\nEquipo de Capibet Casino', true)
ON CONFLICT DO NOTHING;

-- Comentarios de la base de datos
COMMENT ON TABLE email_accounts IS 'Almacena las cuentas de email configuradas en el sistema';
COMMENT ON TABLE emails IS 'Almacena todos los emails recibidos y enviados';
COMMENT ON TABLE email_drafts IS 'Almacena borradores de emails en proceso de composición';
COMMENT ON TABLE email_labels IS 'Almacena etiquetas personalizadas para organizar emails';
COMMENT ON TABLE email_label_relations IS 'Tabla de relación muchos a muchos entre emails y etiquetas';
COMMENT ON TABLE email_templates IS 'Almacena plantillas reutilizables para composición de emails';
COMMENT ON TABLE email_sync_config IS 'Configuración de sincronización para cada cuenta de email';

COMMENT ON COLUMN email_accounts.provider IS 'Proveedor de email: gmail, outlook, yahoo, custom';
COMMENT ON COLUMN email_accounts.access_token IS 'Token de acceso OAuth para la cuenta';
COMMENT ON COLUMN email_accounts.refresh_token IS 'Token de actualización OAuth para renovar el acceso';
COMMENT ON COLUMN email_accounts.imap_settings IS 'Configuración IMAP para cuentas personalizadas';
COMMENT ON COLUMN email_accounts.smtp_settings IS 'Configuración SMTP para cuentas personalizadas';

COMMENT ON COLUMN emails.message_id IS 'ID único del mensaje del proveedor de email';
COMMENT ON COLUMN emails.thread_id IS 'ID del hilo de conversación para agrupar emails relacionados';
COMMENT ON COLUMN emails.folder IS 'Carpeta donde se encuentra el email (INBOX, SENT, DRAFTS, etc.)';

-- Permisos RLS (Row Level Security) para Supabase
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_label_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sync_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (ajustar según el sistema de autenticación)
CREATE POLICY "Users can view their own email accounts" ON email_accounts
  FOR SELECT USING (true); -- Ajustar según el sistema de autenticación

CREATE POLICY "Users can view their own emails" ON emails
  FOR SELECT USING (true); -- Ajustar según el sistema de autenticación

CREATE POLICY "Users can insert their own emails" ON emails
  FOR INSERT WITH CHECK (true); -- Ajustar según el sistema de autenticación

CREATE POLICY "Users can update their own emails" ON emails
  FOR UPDATE USING (true); -- Ajustar según el sistema de autenticación

-- Vista para facilitar consultas comunes
CREATE VIEW email_summary AS
SELECT 
  ea.id as account_id,
  ea.name as account_name,
  ea.email as account_email,
  ea.provider,
  ea.is_connected,
  ea.unread_count,
  COUNT(e.id) as total_emails,
  COUNT(e.id) FILTER (WHERE NOT e.is_read) as unread_emails,
  COUNT(e.id) FILTER (WHERE e.is_starred) as starred_emails,
  MAX(e.date) as last_email_date
FROM email_accounts ea
LEFT JOIN emails e ON ea.id = e.account_id
GROUP BY ea.id, ea.name, ea.email, ea.provider, ea.is_connected, ea.unread_count;

-- Función para limpiar emails antiguos (mantener solo los últimos 2 años)
CREATE OR REPLACE FUNCTION cleanup_old_emails()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM emails 
  WHERE date < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Programar limpieza automática (ejecutar manualmente o con cron)
-- SELECT cleanup_old_emails();
