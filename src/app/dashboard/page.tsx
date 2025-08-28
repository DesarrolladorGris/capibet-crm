'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';
import MetricsCard from './components/MetricsCard';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn || !email) {
      router.push('/login');
      return;
    }
    
    // Cargar datos del usuario
    setUserEmail(email);
    setUserName(localStorage.getItem('userName') || '');
    setUserRole(localStorage.getItem('userRole') || '');
    setAgencyName(localStorage.getItem('agencyName') || '');
  }, [router]);

  const handleLogout = () => {
    // Limpiar todos los datos de sesión
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('agencyName');
    localStorage.removeItem('userData');
    
    router.push('/login');
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      userEmail={userEmail} 
      userName={userName}
      userRole={userRole}
      agencyName={agencyName}
      onLogout={handleLogout}
    >
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-semibold mb-2">Dashboard</h1>
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-medium">Mensajes</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Agente</span>
                <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-1 text-white text-sm">
                  <option>Todos</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Sesión</span>
                <select className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-1 text-white text-sm">
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

        {/* Metrics Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            title="Total de chats por etiqueta"
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

        {/* Metrics Grid - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
          <MetricsCard
            title="Total de mensajes mandados"
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
            title="Total de mensajes de nuevos prospectos"
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
            title="Total de mensajes hacia nuevos prospectos"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            }
          />
        </div>

        {/* Metrics Grid - Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Mensajes hacia clientes recurrentes"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <MetricsCard
            title="Mensajes de clientes recurrentes"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <MetricsCard
            title="Mensajes totales de clientes recurrentes"
            value={0}
            percentage="0%"
            iconColor="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
        </div>

        {/* Tiempos Section */}
        <div className="mb-8">
          <h2 className="text-white text-xl font-medium mb-6">Tiempos</h2>
          <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-6">
            <div className="text-gray-400 text-center py-8">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
