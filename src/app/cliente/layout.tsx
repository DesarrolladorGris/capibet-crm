'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/utils/auth';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación usando la utilidad centralizada
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar datos de usuario
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    
    // Si no es un usuario Cliente, redirigir al dashboard normal
    if (role !== 'Cliente') {
      router.push('/dashboard');
      return;
    }
    
    setUserEmail(email || '');
    setUserName(name || '');
    setUserRole(role || '');
    setIsLoading(false);
  }, [router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <div className="text-white font-bold text-sm">🎲</div>
          </div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos de usuario, no mostrar contenido
  if (!userEmail || userRole !== 'Cliente') {
    return null;
  }

  // Layout específico para clientes - sin sidebar
  return (
    <div className="h-screen bg-[#1a1d23] flex flex-col overflow-hidden">
      {/* Header responsive para clientes */}
      <header className="bg-[#1a1d23] border-b border-[#3a3d45]">
        {/* Layout para desktop y tablet */}
        <div className="hidden md:block px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Sección izquierda: Logo + Soporte */}
            <div className="flex items-center space-x-6">
              {/* Logo CapiBet CRM */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center">
                  <div className="text-white font-bold text-sm">🎲</div>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">CapiBet CRM</h1>
                  <p className="text-gray-400 text-sm">Portal del Cliente</p>
                </div>
              </div>

              {/* Separador visual */}
              <div className="w-px h-12 bg-[#3a3d45]"></div>

              {/* Info de Soporte */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#00b894] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold">Soporte al Cliente</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-gray-400 text-sm">En línea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección derecha: Usuario + Horario + Logout */}
            <div className="flex items-center space-x-6">
              {/* Horario de atención */}
              <div className="text-right hidden lg:block">
                <p className="text-gray-400 text-sm">Horario de atención</p>
                <p className="text-white text-sm">Lun - Vie: 9:00 - 18:00</p>
              </div>

              {/* Separador visual */}
              <div className="w-px h-12 bg-[#3a3d45] hidden lg:block"></div>

              {/* Info del usuario */}
              <div className="text-right">
                <p className="text-white text-sm font-medium">{userName}</p>
                <p className="text-gray-400 text-xs">{userEmail}</p>
              </div>

              {/* Botón logout */}
              <button
                onClick={() => {
                  // Limpiar sesión y redirigir al login
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('agencyName');
                    localStorage.removeItem('userData');
                    window.location.href = '/login';
                  }
                }}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                title="Cerrar Sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layout para móvil */}
        <div className="md:hidden px-4 py-3">
          {/* Primera fila: Logo y botón logout */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center">
                <div className="text-white font-bold text-sm">🎲</div>
              </div>
              <div>
                <h1 className="text-white font-bold text-base">CapiBet CRM</h1>
                <p className="text-gray-400 text-xs">Portal del Cliente</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Limpiar sesión y redirigir al login
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('isLoggedIn');
                  localStorage.removeItem('userEmail');
                  localStorage.removeItem('userName');
                  localStorage.removeItem('userRole');
                  localStorage.removeItem('userId');
                  localStorage.removeItem('agencyName');
                  localStorage.removeItem('userData');
                  window.location.href = '/login';
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          {/* Segunda fila: Soporte y usuario */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-medium text-sm">Soporte</h2>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-gray-400 text-xs">En línea</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white text-sm font-medium">{userName}</p>
              <p className="text-gray-400 text-xs truncate max-w-[120px]">{userEmail}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
