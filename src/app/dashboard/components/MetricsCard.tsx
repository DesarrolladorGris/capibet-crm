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
    <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] p-6 relative">
      {/* Ícono de información con tooltip */}
      <div className="absolute top-4 right-4 group">
        <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500">
          <Info className="w-3 h-3 text-white" />
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 w-72 p-4 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <div className="relative">
            <p className="text-sm leading-relaxed">{getTooltipDescription()}</p>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${getIconBackgroundColor()} rounded-lg flex items-center justify-center`}>
            {renderIcon()}
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium flex items-center ${
          changeType === 'positive' ? 'text-green-500' : 'text-red-500'
        }`}>
          {changeType === 'positive' ? (
            <TrendingUp className="w-5 h-5 mr-1" />
          ) : (
            <TrendingDown className="w-5 h-5 mr-1" />
          )}
          <span className={`text-md font-medium ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>{change}</span>
        </span>
      </div>
    </div>
  );
}
