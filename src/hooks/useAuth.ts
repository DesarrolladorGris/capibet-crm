'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioResponse } from '@/services/supabaseService';

interface AuthState {
  isAuthenticated: boolean;
  user: UsuarioResponse | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userDataString = localStorage.getItem('userData');
      
      if (isLoggedIn === 'true' && userDataString) {
        try {
          const userData = JSON.parse(userDataString) as UsuarioResponse;
          setAuthState({
            isAuthenticated: true,
            user: userData,
            isLoading: false
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Si hay error, limpiar localStorage y no autenticar
          clearAuth();
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('agencyName');
    localStorage.removeItem('userData');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const requireAuth = () => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/login');
    }
  };

  return {
    ...authState,
    logout,
    requireAuth
  };
}
