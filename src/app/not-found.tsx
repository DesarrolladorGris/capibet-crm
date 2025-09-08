'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFound() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si está autenticado, ir al dashboard
        router.push('/dashboard');
      } else {
        // Si no está autenticado, ir al login
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras se decide la redirección
  return (
    <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
      <div className="text-white">Redirigiendo...</div>
    </div>
  );
}
