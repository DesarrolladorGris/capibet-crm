'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioResponse } from '@/services/supabaseService';
import { clearUserSession, isUserAuthenticated, getCurrentUserData } from '@/utils/auth';

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
      try {
        const isAuth = isUserAuthenticated();
        const userData = getCurrentUserData();
        
        if (isAuth && userData) {
          setAuthState({
            isAuthenticated: true,
            user: userData as UsuarioResponse,
            isLoading: false
          });
        } else {
          // Si no hay autenticación válida, limpiar por seguridad
          clearUserSession();
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // En caso de error, limpiar todo por seguridad
        clearUserSession();
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
    // Usar la función centralizada para limpiar sesión
    clearUserSession();
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
  };

  const logout = () => {
    clearAuth();
    
    // Forzar recarga de la página para limpiar cualquier estado en memoria
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
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
