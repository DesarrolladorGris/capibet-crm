
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import ActividadesTabs from './components/ActividadesTabs';
import { useAuth } from '@/contexts/AuthContext';

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
    <DashboardLayout 
      userName={user.name}
      userRole={user.role}
      agencyName={user.agencyName}
      onLogout={logout}
    >
      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-xl font-semibold mb-2">Actividades</h1>
              <p className="text-gray-400 text-sm">Gestiona tus llamadas, reuniones, tareas y calendario</p>
            </div>
            <div className="text-right">
              <div className="bg-[#00b894] text-white px-3 py-1 rounded-full text-sm font-medium">
                {user.role === 'admin' ? '👑 Administrador' : 
                 user.role === 'supervisor' ? '👔 Supervisor' : '💼 Comercial'}
              </div>
              <p className="text-gray-400 text-sm mt-1">{user.agencyName}</p>
            </div>
          </div>
        </div>

        {/* Actividades Tabs */}
        <ActividadesTabs />
      </div>
    </DashboardLayout>
  );
}
