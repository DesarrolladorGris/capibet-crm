'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import EspaciosTrabajoTab from './components/EspaciosTrabajoTab';
import UsuariosTab from './components/UsuariosTab';
import EtiquetasTab from './components/EtiquetasTab';
import RespuestasRapidasTab from './components/RespuestasRapidasTab';
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
const PersonalizarTab = () => (
  <div className="p-6">
    <h3 className="text-white text-lg font-medium mb-4">Personalizar</h3>
    <p className="text-gray-400">Configuración de personalización del sistema.</p>
  </div>
);

const SesionesTab = () => (
  <div className="p-6">
    <h3 className="text-white text-lg font-medium mb-4">Sesiones</h3>
    <p className="text-gray-400">Gestión de sesiones activas del sistema.</p>
  </div>
);

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('espacios-trabajo');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [userCount, setUserCount] = useState(0);
  const router = useRouter();

  // Configuración de pestañas
  const tabs: TabConfig[] = [
    { id: 'personalizar', label: 'Personalizar', icon: '⚙️', component: PersonalizarTab },
    { id: 'espacios-trabajo', label: 'Espacios de trabajo', icon: '🏢', count: 1, component: EspaciosTrabajoTab },
    { id: 'sesiones', label: 'Sesiones', icon: '🔄', count: 0, component: SesionesTab },
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
    
    // Cargar conteo de usuarios
    loadUserCount();
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

  // Actualizar contador cada vez que se active la pestaña de usuarios
  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUserCount();
    }
  }, [activeTab]);

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

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || EspaciosTrabajoTab;

  return (
    <DashboardLayout 
      userEmail={userEmail} 
      userName={userName}
      userRole={userRole}
      agencyName={agencyName}
      onLogout={handleLogout}
    >
      <div className="flex-1 flex flex-col">
        {/* Header de Configuración */}
        <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-white text-xl font-semibold">Configuración</span>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#00b894] text-[#00b894]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-[#00b894] text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="flex-1 bg-[#1a1d23]">
          <ActiveTabComponent />
        </div>
      </div>
    </DashboardLayout>
  );
}
