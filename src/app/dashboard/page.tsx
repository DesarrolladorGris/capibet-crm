import MetricsCard from './components/MetricsCard';

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Dashboard */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Page Title */}
            <h1 className="text-white font-semibold text-2xl">Dashboard</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm">Editar Embudo</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Actualizar</span>
            </button>

            <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
              + Nuevo Mensaje
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar"
                className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 pl-9 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] w-48"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter */}
            <button className="text-gray-400 hover:text-white p-2 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="text-gray-400 hover:text-white p-2 rounded relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6">
        <div className="flex space-x-4">
          <button className="text-white font-medium px-3 py-1 bg-[#2a2d35] rounded text-sm">
            Todos
          </button>
          <button className="text-gray-400 hover:text-white font-medium px-3 py-1 hover:bg-[#2a2d35] rounded text-sm">
            Mis Chats
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1a1d23] p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Ventas"
            value="$45,231"
            change="+20.1%"
            changeType="positive"
            icon="💰"
          />
          <MetricsCard
            title="Contactos"
            value="2,350"
            change="+180.1%"
            changeType="positive"
            icon="👥"
          />
          <MetricsCard
            title="Chats Activos"
            value="12"
            change="+19%"
            changeType="positive"
            icon="💬"
          />
          <MetricsCard
            title="Tasa Conversión"
            value="24.5%"
            change="-4.3%"
            changeType="negative"
            icon="📈"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-[#1a1d23] rounded-lg">
              <div className="w-10 h-10 bg-[#00b894] rounded-full flex items-center justify-center">
                <span className="text-white text-lg">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Nuevo contacto agregado: <span className="font-medium">Juan Pérez</span></p>
                <p className="text-gray-400 text-xs">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[#1a1d23] rounded-lg">
              <div className="w-10 h-10 bg-[#00b894] rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💬</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Nuevo chat iniciado con <span className="font-medium">María García</span></p>
                <p className="text-gray-400 text-xs">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[#1a1d23] rounded-lg">
              <div className="w-10 h-10 bg-[#00b894] rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💰</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Venta completada: <span className="font-medium">$2,500</span></p>
                <p className="text-gray-400 text-xs">Hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
