'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'comercial' | 'supervisor';
  agencyName: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canManageActivities: (userId?: string) => boolean;
  canViewAllActivities: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar la aplicación
    const checkAuth = () => {
      // Verificar que estamos en el cliente
      if (typeof window === 'undefined') return;
      
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole') as 'admin' | 'comercial' | 'supervisor';
        const agencyName = localStorage.getItem('agencyName');
        const userId = localStorage.getItem('userId');

        if (isLoggedIn && userEmail && userName && userRole && agencyName && userId) {
          setUser({
            id: userId,
            email: userEmail,
            name: userName,
            role: userRole,
            agencyName,
            isActive: true
          });
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('agencyName', userData.agencyName);
        localStorage.setItem('userId', userData.id);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    
    // Verificar que estamos en el cliente
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('agencyName');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
  };

  // Sistema de permisos basado en roles
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const permissions = {
      admin: [
        'view_all_activities',
        'create_any_activity',
        'edit_any_activity',
        'delete_any_activity',
        'view_reports',
        'manage_users',
        'manage_teams'
      ],
      supervisor: [
        'view_team_activities',
        'create_any_activity',
        'edit_team_activities',
        'delete_team_activities',
        'view_team_reports',
        'assign_tasks'
      ],
      comercial: [
        'view_own_activities',
        'create_own_activity',
        'edit_own_activity',
        'delete_own_activity',
        'view_own_reports'
      ]
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  // Verificar si puede gestionar actividades (crear/editar/eliminar)
  const canManageActivities = (userId?: string): boolean => {
    if (!user) return false;

    // Admin puede gestionar todas las actividades
    if (user.role === 'admin') return true;

    // Supervisor puede gestionar actividades del equipo
    if (user.role === 'supervisor') return true;

    // Comercial solo puede gestionar sus propias actividades
    if (user.role === 'comercial') {
      return !userId || userId === user.id;
    }

    return false;
  };

  // Verificar si puede ver todas las actividades
  const canViewAllActivities = (): boolean => {
    return hasPermission('view_all_activities') || hasPermission('view_team_activities');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    canManageActivities,
    canViewAllActivities
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

