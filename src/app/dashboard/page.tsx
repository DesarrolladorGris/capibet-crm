import MetricsCard from './components/MetricsCard';

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Dashboard */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        {/* Barra de Filtros */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-4">
            {/* Filtro de Fecha */}
            <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00b894]">
              <option>Hoy</option>
              <option>Ayer</option>
              <option>Esta semana</option>
              <option>Este mes</option>
            </select>

            {/* Filtro de Agente */}
            <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00b894]">
              <option>Agente: Todos</option>
              <option>Agente: Juan</option>
              <option>Agente: María</option>
            </select>

            {/* Filtro de Sesión */}
            <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00b894]">
              <option>Sesión: Todos</option>
              <option>Sesión: Chat</option>
              <option>Sesión: WhatsApp</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1a1d23] p-6">
        {/* Page Title */}
        <div className="flex items-center mb-6">
          <h1 className="text-white font-semibold text-2xl">Mensajes</h1>
        </div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Fila 1 */}
          <MetricsCard
            title="Nuevos prospectos"
            value="1"
            change="1%"
            changeType="positive"
            icon="chat"
          />
          <MetricsCard
            title="Clientes recurrentes"
            value="-1"
            change="1%"
            changeType="negative"
            icon="chat"
          />
          <MetricsCard
            title="Chats totales"
            value="0"
            change="0%"
            changeType="negative"
            icon="chat"
          />
          <MetricsCard
            title="Total de chats por etiqueta"
            value="1"
            change="1%"
            changeType="positive"
            icon="chat"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Fila 2 */}
          <MetricsCard
            title="Total de mensajes"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Total de mensajes mandados"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Total de mensajes de nuevos prospectos"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Total de mensajes hacia nuevos prospectos"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Fila 3 */}
          <MetricsCard
            title="Mensajes hacia clientes recurrentes"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Mensajes de clientes recurrentes"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Mensajes totales de clientes recurrentes"
            value="0"
            change="0%"
            changeType="negative"
            icon="message"
          />
          <MetricsCard
            title="Clientes activos"
            value="0"
            change="0%"
            changeType="negative"
            icon="user"
          />
        </div>

        {/* Sección Tiempos */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-6">Tiempos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricsCard
              title="Tiempo de respuesta promedio"
              value="0"
              change="0%"
              changeType="negative"
              icon="clock"
            />
            <MetricsCard
              title="Tiempo de respuesta medio"
              value="0"
              change="0%"
              changeType="negative"
              icon="clock"
            />
          </div>
        </div>

        {/* Sección Tu equipo */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-6">Tu equipo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricsCard
              title="Tiempo de respuesta promedio"
              value="0"
              change="0%"
              changeType="negative"
              icon="clock"
            />
            <MetricsCard
              title="Tiempo de respuesta medio"
              value="0"
              change="0%"
              changeType="negative"
              icon="clock"
            />
            <MetricsCard
              title="Cantidad de mensajes enviados"
              value="0"
              change="0%"
              changeType="negative"
              icon="message"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
