'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActividadesTabs from './components/ActividadesTabs';
import { useAuth } from '@/hooks/useAuth';

export default function ActividadesPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header compacto estilo Beast CRM */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold text-xl">Actividades</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>•</span>
              <span>Gestión de tareas y actividades</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-[#00b894] text-white px-3 py-1 rounded-full text-sm font-medium">
              {user.rol === 'admin' ? '👑 Administrador' : 
               user.rol === 'supervisor' ? '👔 Supervisor' : '💼 Comercial'}
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">{user.nombre_agencia}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Layout de 3 columnas estilo Beast CRM */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda - Lista de actividades */}
        <div className="w-1/3 border-r border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Actividades Recientes</h3>
              <span className="text-gray-400 text-sm">12</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45] hover:border-[#00b894] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium text-sm">Actividad {i}</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-blue-400 text-xs">En progreso</span>
                    </div>
                  </div>
                  <div className="text-gray-300 text-sm">Descripción de la actividad {i}</div>
                  <div className="text-gray-400 text-xs mt-1">Hace {i} horas</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna central - Vista detallada */}
        <div className="flex-1 bg-[#1a1d23] overflow-y-auto">
          <ActividadesTabs />
        </div>

        {/* Columna derecha - Panel lateral */}
        <div className="w-80 border-l border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-medium mb-4">Filtros</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Tipo</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todas las actividades</option>
                  <option>Llamadas</option>
                  <option>Reuniones</option>
                  <option>Tareas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Estado</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los estados</option>
                  <option>Pendientes</option>
                  <option>En progreso</option>
                  <option>Completadas</option>
                  <option>Canceladas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Prioridad</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todas las prioridades</option>
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Total Actividades</div>
                  <div className="text-white text-2xl font-bold">47</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Completadas</div>
                  <div className="text-white text-2xl font-bold">32</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Pendientes</div>
                  <div className="text-white text-2xl font-bold">15</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Tasa de Completado</div>
                  <div className="text-white text-2xl font-bold">68%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}