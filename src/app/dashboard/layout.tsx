'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { performLogout, isUserAuthenticated } from '@/utils/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación usando la utilidad centralizada
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar datos de usuario
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole') || '';
    
    // Si es un usuario Cliente, redirigir a su página específica
    if (role === 'Cliente') {
      router.push('/cliente');
      return;
    }
    
    setUserEmail(email || '');
    setUserName(localStorage.getItem('userName') || '');
    setUserRole(role);
    setAgencyName(localStorage.getItem('agencyName') || '');
  }, [router]);

  const handleLogout = () => {
    // Usar la función centralizada y segura de logout
    performLogout();
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-primary)]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {/* Header */}
        <Header 
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          agencyName={agencyName}
          onLogout={handleLogout}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
