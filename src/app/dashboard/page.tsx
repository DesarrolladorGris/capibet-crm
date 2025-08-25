'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn || !email) {
      router.push('/login');
      return;
    }
    
    setUserEmail(email);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
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
    <DashboardLayout userEmail={userEmail} onLogout={handleLogout}>
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Prospectos Card */}
        <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-6 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Prospectos</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-gray-400 text-sm">0</span>
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Arrastra un chat aquí.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
