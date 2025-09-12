'use client';

import { MessageCircle, Users, Clock, Mail, TrendingUp, TrendingDown, Info } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: 'chat' | 'user' | 'clock' | 'message';
}

export default function MetricsCard({ title, value, change, changeType, icon }: MetricsCardProps) {
  const getIconBackgroundColor = () => {
    switch (icon) {
      case 'chat':
        return 'bg-orange-500';
      case 'user':
        return 'bg-yellow-500';
      case 'clock':
        return 'bg-blue-500';
      case 'message':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTooltipDescription = () => {
    switch (title) {
      case 'Nuevos prospectos':
        return 'Número de contactos nuevos que han iniciado conversación por primera vez.';
      case 'Clientes recurrentes':
        return 'Número de clientes que han regresado para realizar nuevas consultas o compras.';
      case 'Chats totales':
        return 'Cantidad total de conversaciones activas en el sistema.';
      case 'Total de chats por etiqueta':
        return 'Distribución de conversaciones categorizadas por etiquetas específicas.';
      case 'Total de mensajes':
        return 'Cantidad total de mensajes intercambiados en todas las conversaciones.';
      case 'Total de mensajes mandados':
        return 'Número de mensajes enviados por los agentes a los clientes.';
      case 'Total de mensajes de nuevos prospectos':
        return 'Mensajes recibidos de contactos que están en su primera interacción.';
      case 'Total de mensajes hacia nuevos prospectos':
        return 'Mensajes enviados a contactos que están en su primera interacción.';
      case 'Mensajes hacia clientes recurrentes':
        return 'Mensajes enviados a clientes que ya han interactuado previamente.';
      case 'Mensajes de clientes recurrentes':
        return 'Mensajes recibidos de clientes que ya han interactuado previamente.';
      case 'Mensajes totales de clientes recurrentes':
        return 'Suma total de mensajes intercambiados con clientes recurrentes.';
      case 'Clientes activos':
        return 'Número de clientes que han tenido actividad reciente en el sistema.';
      case 'Tiempo de respuesta promedio':
        return 'Tiempo promedio que tardan los agentes en responder a los mensajes de los clientes.';
      case 'Tiempo de respuesta medio':
        return 'Tiempo mediano de respuesta, que representa el valor central de todos los tiempos de respuesta.';
      case 'Cantidad de mensajes enviados':
        return 'Número total de mensajes enviados por el equipo de agentes.';
      default:
        return 'Información detallada sobre esta métrica del dashboard.';
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case 'chat':
        return <MessageCircle className="w-5 h-5 text-white" />;
      case 'user':
        return <Users className="w-5 h-5 text-white" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-white" />;
      case 'message':
        return <Mail className="w-5 h-5 text-white" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-sm font-medium">{title}</p>
          <p className="text-[var(--text-primary)] text-2xl font-bold">{value}</p>
        </div>
        <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-[var(--success)]' : 'text-[var(--error)]'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp className="w-5 h-5 mr-1" />
          ) : (
            <TrendingDown className="w-5 h-5 mr-1" />
          )}
          <span className={`text-md font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
        </span>
        <span className="text-[var(--text-muted)] text-sm ml-1">desde el mes pasado</span>
      </div>
    </div>
  );
}
