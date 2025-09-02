'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import EspaciosTrabajoTab from './components/EspaciosTrabajoTab';
import UsuariosTab from './components/UsuariosTab';
import EtiquetasTab from './components/EtiquetasTab';
import RespuestasRapidasTab from './components/RespuestasRapidasTab';
import SesionesTab from './components/SesionesTab';
import { supabaseService } from '@/services/supabaseService';

// Tipos para las pestañas
interface TabConfig {
  id: string;
  label: string;
  icon: string;
  count?: number;
  component: React.ComponentType;
}

// Componentes temporales

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('espacios-trabajo');
  const [userEmail, setUserEmail] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userName, setUserName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, setUserRole] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [agencyName, setAgencyName] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [espaciosCount, setEspaciosCount] = useState(0);
  const router = useRouter();

  // Configuración de pestañas
  const tabs: TabConfig[] = [
    { id: 'espacios-trabajo', label: 'Espacios de trabajo', icon: '🏢', count: espaciosCount, component: EspaciosTrabajoTab },
    { id: 'sesiones', label: 'Sesiones', icon: '🔗', count: 0, component: SesionesTab },
    { id: 'etiquetas', label: 'Etiquetas', icon: '🏷️', count: 4, component: EtiquetasTab },
    { id: 'usuarios', label: 'Usuarios', icon: '👥', count: userCount, component: UsuariosTab },
    { id: 'respuestas-rapidas', label: 'Respuestas rápidas', icon: '💬', count: 4, component: RespuestasRapidasTab },
  ];

  useEffect(() => {
    // Verificar autenticación
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
    
    // Cargar conteo de usuarios y espacios de trabajo
    loadUserCount();
    loadEspaciosCount();
  }, [router]);

  const loadUserCount = async () => {
    try {
      const result = await supabaseService.getAllUsuarios();
      if (result.success && result.data) {
        setUserCount(result.data.length);
      }
    } catch (error) {
      console.error('Error loading user count:', error);
    }
  };

  const loadEspaciosCount = async () => {
    try {
      const result = await supabaseService.getAllEspaciosTrabajo();
      if (result.success && result.data) {
        setEspaciosCount(result.data.length);
      }
    } catch (error) {
      console.error('Error loading espacios count:', error);
    }
  };

  // Actualizar contadores cada vez que se activen las pestañas correspondientes
  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUserCount();
    } else if (activeTab === 'espacios-trabajo') {
      loadEspaciosCount();
    }
  }, [activeTab]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className="flex-1 flex flex-col">
      {/* Header de Configuración */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Page Title */}
            <h1 className="text-white font-semibold text-2xl">Configuración</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#00b894] text-[#00b894]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="bg-[#2a2d35] text-gray-400 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1a1d23] p-6">
        {/* Renderizar el componente de la pestaña activa */}
        {(() => {
          const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;
          return ActiveTabComponent ? <ActiveTabComponent /> : null;
        })()}
      </div>
    </div>
  );
}
