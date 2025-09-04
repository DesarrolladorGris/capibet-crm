# Propuesta Técnica: Sistema de Métricas del Dashboard

## Resumen Ejecutivo

Esta propuesta describe la implementación de un sistema de métricas para el dashboard de mensajes, utilizando Supabase como backend principal. Se propone crear una tabla de métricas pre-calculadas que permita obtener todos los datos estadísticos desde un único endpoint, optimizando el rendimiento y la experiencia del usuario.

## Análisis de Métricas Requeridas

### Métricas necesarias según las que tenemos en el Dashboard
1. Nuevos prospectos
2. Clientes recurrentes  
3. Chats totales
4. Total de chats por etiqueta
5. Total de mensajes
6. Total de mensajes mandados
7. Total de mensajes de nuevos prospectos
8. Total de mensajes hacia nuevos prospectos
9. Mensajes hacia clientes recurrentes
10. Mensajes de clientes recurrentes
11. Mensajes totales de clientes recurrentes
12. Clientes activos
13. Tiempo de respuesta promedio
14. Tiempo de respuesta medio
15. Tiempo de respuesta promedio (equipo)
16. Tiempo de respuesta medio (equipo)
17. Cantidad de mensajes enviados (equipo)

## Estrategia de Implementación

### Tabla de Métricas Pre-calculadas

#### Diseño de la Tabla `dashboard_metrics`

```sql
CREATE TABLE dashboard_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key VARCHAR(100) NOT NULL UNIQUE,
  metric_name VARCHAR(200) NOT NULL,
  current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  previous_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  change_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  change_type VARCHAR(10) NOT NULL DEFAULT 'neutral', -- 'positive', 'negative', 'neutral'
  period_type VARCHAR(20) NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  agent_id UUID REFERENCES agents(id), -- NULL para métricas globales
  session_type VARCHAR(50), -- 'chat', 'whatsapp', 'all'
  date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_dashboard_metrics_period ON dashboard_metrics(period_type, date_range_start);
CREATE INDEX idx_dashboard_metrics_agent ON dashboard_metrics(agent_id);
CREATE INDEX idx_dashboard_metrics_session ON dashboard_metrics(session_type);
CREATE INDEX idx_dashboard_metrics_key ON dashboard_metrics(metric_key);
```

#### Estructura de Datos de las Métricas

```typescript
interface DashboardMetric {
  id: string;
  metric_key: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  change_type: 'positive' | 'negative' | 'neutral';
  period_type: 'daily' | 'weekly' | 'monthly';
  agent_id?: string;
  session_type?: 'chat' | 'whatsapp' | 'all';
  date_range_start: string;
  date_range_end: string;
  calculated_at: string;
}

// Mapeo de métricas del dashboard
const METRIC_KEYS = {
  NUEVOS_PROSPECTOS: 'nuevos_prospectos',
  CLIENTES_RECURRENTES: 'clientes_recurrentes',
  CHATS_TOTALES: 'chats_totales',
  CHATS_POR_ETIQUETA: 'chats_por_etiqueta',
  TOTAL_MENSAJES: 'total_mensajes',
  MENSAJES_MANDADOS: 'mensajes_mandados',
  MENSAJES_NUEVOS_PROSPECTOS: 'mensajes_nuevos_prospectos',
  MENSAJES_HACIA_NUEVOS_PROSPECTOS: 'mensajes_hacia_nuevos_prospectos',
  MENSAJES_HACIA_RECURRENTES: 'mensajes_hacia_recurrentes',
  MENSAJES_DE_RECURRENTES: 'mensajes_de_recurrentes',
  MENSAJES_TOTALES_RECURRENTES: 'mensajes_totales_recurrentes',
  CLIENTES_ACTIVOS: 'clientes_activos',
  TIEMPO_RESPUESTA_PROMEDIO: 'tiempo_respuesta_promedio',
  TIEMPO_RESPUESTA_MEDIO: 'tiempo_respuesta_medio',
  TIEMPO_RESPUESTA_PROMEDIO_EQUIPO: 'tiempo_respuesta_promedio_equipo',
  TIEMPO_RESPUESTA_MEDIO_EQUIPO: 'tiempo_respuesta_medio_equipo',
  MENSAJES_ENVIADOS_EQUIPO: 'mensajes_enviados_equipo'
} as const;
```

## Implementación en Supabase

### 1. Funciones de Base de Datos

#### Función para Calcular Métricas
```sql
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(
  p_period_type VARCHAR(20) DEFAULT 'daily',
  p_agent_id UUID DEFAULT NULL,
  p_session_type VARCHAR(50) DEFAULT 'all'
)
RETURNS VOID AS $$
DECLARE
  start_date TIMESTAMP WITH TIME ZONE;
  end_date TIMESTAMP WITH TIME ZONE;
  previous_start_date TIMESTAMP WITH TIME ZONE;
  previous_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular rangos de fechas según el período
  CASE p_period_type
    WHEN 'daily' THEN
      start_date := CURRENT_DATE;
      end_date := CURRENT_DATE + INTERVAL '1 day';
      previous_start_date := CURRENT_DATE - INTERVAL '1 day';
      previous_end_date := CURRENT_DATE;
    WHEN 'weekly' THEN
      start_date := DATE_TRUNC('week', CURRENT_DATE);
      end_date := start_date + INTERVAL '1 week';
      previous_start_date := start_date - INTERVAL '1 week';
      previous_end_date := start_date;
    WHEN 'monthly' THEN
      start_date := DATE_TRUNC('month', CURRENT_DATE);
      end_date := start_date + INTERVAL '1 month';
      previous_start_date := start_date - INTERVAL '1 month';
      previous_end_date := start_date;
  END CASE;

  -- Insertar/actualizar métricas calculadas
  INSERT INTO dashboard_metrics (
    metric_key, metric_name, current_value, previous_value, 
    change_percentage, change_type, period_type, agent_id, 
    session_type, date_range_start, date_range_end
  ) VALUES
    -- Nuevos prospectos
    ('nuevos_prospectos', 'Nuevos prospectos', 
     (SELECT COUNT(*) FROM contacts WHERE created_at >= start_date AND created_at < end_date),
     (SELECT COUNT(*) FROM contacts WHERE created_at >= previous_start_date AND created_at < previous_end_date),
     0, 'neutral', p_period_type, p_agent_id, p_session_type, start_date, end_date),
    
    -- Clientes recurrentes
    ('clientes_recurrentes', 'Clientes recurrentes',
     (SELECT COUNT(DISTINCT contact_id) FROM messages 
      WHERE created_at >= start_date AND created_at < end_date 
      AND contact_id IN (SELECT id FROM contacts WHERE created_at < start_date)),
     (SELECT COUNT(DISTINCT contact_id) FROM messages 
      WHERE created_at >= previous_start_date AND created_at < previous_end_date 
      AND contact_id IN (SELECT id FROM contacts WHERE created_at < previous_start_date)),
     0, 'neutral', p_period_type, p_agent_id, p_session_type, start_date, end_date),
    
    -- Chats totales
    ('chats_totales', 'Chats totales',
     (SELECT COUNT(*) FROM conversations WHERE created_at >= start_date AND created_at < end_date),
     (SELECT COUNT(*) FROM conversations WHERE created_at >= previous_start_date AND created_at < previous_end_date),
     0, 'neutral', p_period_type, p_agent_id, p_session_type, start_date, end_date),
    
    -- Total de mensajes
    ('total_mensajes', 'Total de mensajes',
     (SELECT COUNT(*) FROM messages WHERE created_at >= start_date AND created_at < end_date),
     (SELECT COUNT(*) FROM messages WHERE created_at >= previous_start_date AND created_at < previous_end_date),
     0, 'neutral', p_period_type, p_agent_id, p_session_type, start_date, end_date),
    
    -- Tiempo de respuesta promedio
    ('tiempo_respuesta_promedio', 'Tiempo de respuesta promedio',
     (SELECT AVG(EXTRACT(EPOCH FROM (response_time - created_at))/60) 
      FROM messages WHERE created_at >= start_date AND created_at < end_date 
      AND response_time IS NOT NULL),
     (SELECT AVG(EXTRACT(EPOCH FROM (response_time - created_at))/60) 
      FROM messages WHERE created_at >= previous_start_date AND created_at < previous_end_date 
      AND response_time IS NOT NULL),
     0, 'neutral', p_period_type, p_agent_id, p_session_type, start_date, end_date)
    
    -- ... más métricas
    
  ON CONFLICT (metric_key, period_type, agent_id, session_type, date_range_start) 
  DO UPDATE SET
    current_value = EXCLUDED.current_value,
    previous_value = EXCLUDED.previous_value,
    change_percentage = EXCLUDED.change_percentage,
    change_type = EXCLUDED.change_type,
    updated_at = NOW();

  -- Calcular porcentajes de cambio
  UPDATE dashboard_metrics 
  SET change_percentage = CASE 
    WHEN previous_value = 0 AND current_value > 0 THEN 100
    WHEN previous_value = 0 AND current_value = 0 THEN 0
    ELSE ROUND(((current_value - previous_value) / previous_value) * 100, 2)
  END,
  change_type = CASE
    WHEN current_value > previous_value THEN 'positive'
    WHEN current_value < previous_value THEN 'negative'
    ELSE 'neutral'
  END
  WHERE period_type = p_period_type 
  AND (agent_id = p_agent_id OR (agent_id IS NULL AND p_agent_id IS NULL))
  AND (session_type = p_session_type OR (session_type IS NULL AND p_session_type IS NULL))
  AND date_range_start = start_date;

END;
$$ LANGUAGE plpgsql;
```

#### Función para Obtener Métricas
```sql
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_period_type VARCHAR(20) DEFAULT 'daily',
  p_agent_id UUID DEFAULT NULL,
  p_session_type VARCHAR(50) DEFAULT 'all'
)
RETURNS TABLE (
  metric_key VARCHAR(100),
  metric_name VARCHAR(200),
  current_value DECIMAL(15,2),
  change_percentage DECIMAL(5,2),
  change_type VARCHAR(10)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.metric_key,
    dm.metric_name,
    dm.current_value,
    dm.change_percentage,
    dm.change_type
  FROM dashboard_metrics dm
  WHERE dm.period_type = p_period_type
  AND (dm.agent_id = p_agent_id OR (dm.agent_id IS NULL AND p_agent_id IS NULL))
  AND (dm.session_type = p_session_type OR (dm.session_type IS NULL AND p_session_type IS NULL))
  AND dm.date_range_start = (
    CASE p_period_type
      WHEN 'daily' THEN CURRENT_DATE
      WHEN 'weekly' THEN DATE_TRUNC('week', CURRENT_DATE)
      WHEN 'monthly' THEN DATE_TRUNC('month', CURRENT_DATE)
    END
  )
  ORDER BY dm.metric_key;
END;
$$ LANGUAGE plpgsql;
```

### 2. Triggers para Actualización Automática

```sql
-- Trigger para actualizar métricas cuando se insertan mensajes
CREATE OR REPLACE FUNCTION trigger_update_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar métricas en tiempo real (opcional)
  PERFORM calculate_dashboard_metrics('daily');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_metrics_on_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_metrics();
```

### 3. Políticas de Seguridad (RLS)

```sql
-- Habilitar RLS
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Users can view dashboard metrics" ON dashboard_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción/actualización solo a funciones del sistema
CREATE POLICY "System can modify dashboard metrics" ON dashboard_metrics
  FOR ALL USING (auth.role() = 'service_role');
```

## API Endpoint

### Estructura del Endpoint

```typescript
// GET /api/dashboard/metrics
interface MetricsRequest {
  period?: 'daily' | 'weekly' | 'monthly';
  agentId?: string;
  sessionType?: 'chat' | 'whatsapp' | 'all';
}

interface MetricsResponse {
  metrics: DashboardMetric[];
  period: string;
  generated_at: string;
}
```

### Implementación del Endpoint

```typescript
// src/app/api/dashboard/metrics/route.ts
import { createClient } from '@/config/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily';
    const agentId = searchParams.get('agentId') || null;
    const sessionType = searchParams.get('sessionType') || 'all';

    const supabase = createClient();

    // Llamar a la función de Supabase
    const { data, error } = await supabase.rpc('get_dashboard_metrics', {
      p_period_type: period,
      p_agent_id: agentId,
      p_session_type: sessionType
    });

    if (error) {
      console.error('Error fetching metrics:', error);
      return NextResponse.json(
        { error: 'Error al obtener las métricas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      metrics: data,
      period,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

## Cron Job para Actualización Automática

### Configuración con pg_cron (Supabase)

```sql
-- Habilitar extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron WITH schema extensions;

-- Programar actualización diaria a las 00:00
SELECT cron.schedule(
  'update-daily-metrics',
  '0 0 * * *',
  'SELECT calculate_dashboard_metrics(''daily'');'
);

-- Programar actualización semanal los lunes a las 00:00
SELECT cron.schedule(
  'update-weekly-metrics',
  '0 0 * * 1',
  'SELECT calculate_dashboard_metrics(''weekly'');'
);

-- Programar actualización mensual el día 1 a las 00:00
SELECT cron.schedule(
  'update-monthly-metrics',
  '0 0 1 * *',
  'SELECT calculate_dashboard_metrics(''monthly'');'
);
```

## Frontend Integration

### Hook Personalizado

```typescript
// src/hooks/useDashboardMetrics.ts
import { useState, useEffect } from 'react';

interface UseDashboardMetricsProps {
  period?: 'daily' | 'weekly' | 'monthly';
  agentId?: string;
  sessionType?: 'chat' | 'whatsapp' | 'all';
}

export function useDashboardMetrics({ 
  period = 'daily', 
  agentId, 
  sessionType = 'all' 
}: UseDashboardMetricsProps = {}) {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          period,
          ...(agentId && { agentId }),
          sessionType
        });

        const response = await fetch(`/api/dashboard/metrics?${params}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar las métricas');
        }

        const data = await response.json();
        setMetrics(data.metrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [period, agentId, sessionType]);

  return { metrics, loading, error, refetch: () => fetchMetrics() };
}
```

## Ventajas de esta Implementación

### 1. **Rendimiento Optimizado**
- Datos pre-calculados reducen la carga en tiempo real
- Consultas simples y rápidas desde un único endpoint
- Índices optimizados para búsquedas eficientes

### 2. **Escalabilidad**
- Fácil agregar nuevas métricas sin afectar el rendimiento
- Soporte para múltiples períodos y filtros
- Actualización automática con cron jobs

### 3. **Mantenibilidad**
- Lógica de cálculo centralizada en funciones de base de datos
- Estructura clara y documentada
- Fácil debugging y monitoreo

### 4. **Flexibilidad**
- Soporte para filtros por agente y tipo de sesión
- Múltiples períodos de tiempo
- Fácil extensión para nuevas métricas

## Conclusión
Esta propuesta utiliza las capacidades avanzadas de Supabase (funciones, triggers, cron jobs) para crear un sistema eficiente que puede manejar grandes volúmenes de datos mientras mantiene un excelente rendimiento en el frontend.

La arquitectura pre-calculada propuesta aquí es especialmente adecuada para dashboards donde los datos no necesitan ser completamente en tiempo real, pero sí requieren una actualización regular y un acceso rápido.
