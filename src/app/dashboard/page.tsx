'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';
import MetricsCard from './components/MetricsCard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
    <DashboardLayout 
      userName={user.name}
      userRole={user.role}
      agencyName={user.agencyName}
      onLogout={handleLogout}
    >
      {/* Main Content Area - Sin scroll horizontal */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Header - Compacto pero legible */}
        <div className="mb-5">
          <h1 className="text-white text-xl font-semibold mb-2">Dashboard</h1>
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-medium">Mensajes</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Agente</span>
                <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-2 py-1 text-white text-sm">
                  <option>Todos</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Sesión</span>
                <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-2 py-1 text-white text-sm">
                  <option>Todos</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Hoy</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid - Primera fila (4 métricas principales) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricsCard
            title="Nuevos prospectos"
            value={0}
            percentage="0%"
            iconColor="bg-orange-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <MetricsCard
            title="Clientes recurrentes"
            value={0}
            percentage="0%"
            iconColor="bg-orange-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <MetricsCard
            title="Chats totales"
            value={0}
            percentage="0%"
            iconColor="bg-orange-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <MetricsCard
            title="Total de mensajes"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            }
          />
        </div>

        {/* Metrics Grid - Segunda fila (4 métricas secundarias) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <MetricsCard
            title="Mensajes enviados"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
          />
          <MetricsCard
            title="Prospectos nuevos"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
            }
          />
          <MetricsCard
            title="Clientes activos"
            value={0}
            percentage="0%"
            iconColor="bg-yellow-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <MetricsCard
            title="Total etiquetas"
            value={0}
            percentage="0%"
            iconColor="bg-orange-500"
            hasFilters={true}
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
          />
        </div>

        {/* Tiempos Section - Compacto pero legible */}
        <div className="mb-5">
          <h2 className="text-white text-lg font-medium mb-3">Tiempos</h2>
          <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4">
            <div className="text-gray-400 text-center py-6">
              <svg className="w-8 h-8 mx-auto mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No hay datos de tiempos disponibles</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
