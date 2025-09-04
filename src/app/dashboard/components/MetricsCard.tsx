'use client';

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
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
          </svg>
        );
      case 'message':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] p-6 relative">
      {/* Ícono de información con tooltip */}
      <div className="absolute top-4 right-4 group">
        <div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-500">
          <span className="text-white text-xs font-bold">i</span>
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
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {change}
        </span>
      </div>
    </div>
  );
}
