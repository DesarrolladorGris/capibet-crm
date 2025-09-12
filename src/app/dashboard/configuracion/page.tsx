'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Link, Tag, Users, MessageCircle } from 'lucide-react';

import EspaciosTrabajoTab from './components/EspaciosTrabajoTab';
import UsuariosTab from './components/UsuariosTab';
import EtiquetasTab from './components/EtiquetasTab';
import RespuestasRapidasTab from './components/RespuestasRapidasTab';
import SesionesTab from './components/SesionesTab';
import { usuarioService } from '@/services/usuarioServices';
import { respuestasRapidasService } from '@/services/respuestasRapidasServices';
import { espacioTrabajoService } from '@/services/espacioTrabajoServices';
import { isUserAuthenticated } from '@/utils/auth';
import RoleProtection from '@/components/RoleProtection';

// Tipos para las pestañas
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
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
  const [respuestasRapidasCount, setRespuestasRapidasCount] = useState(0);
  const [etiquetasCount, setEtiquetasCount] = useState(0);
  const router = useRouter();

  // Configuración de pestañas
  const tabs: TabConfig[] = [
    { id: 'espacios-trabajo', label: 'Espacios de trabajo', icon: '🏢', count: espaciosCount, component: EspaciosTrabajoTab },
    { id: 'sesiones', label: 'Sesiones', icon: '🔗', count: 0, component: SesionesTab },
    { id: 'etiquetas', label: 'Etiquetas', icon: '🏷️', count: etiquetasCount, component: EtiquetasTab },
    { id: 'usuarios', label: 'Usuarios', icon: '👥', count: userCount, component: UsuariosTab },
    { id: 'respuestas-rapidas', label: 'Respuestas rápidas', icon: '💬', count: respuestasRapidasCount, component: RespuestasRapidasTab },
  ];

  useEffect(() => {
    // Verificar autenticación usando la utilidad centralizada
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar datos del usuario
    const email = localStorage.getItem('userEmail');
    setUserEmail(email || '');
    setUserName(localStorage.getItem('userName') || '');
    setUserRole(localStorage.getItem('userRole') || '');
    setAgencyName(localStorage.getItem('agencyName') || '');
    
    // Cargar conteo de usuarios, espacios de trabajo y respuestas rápidas
    loadUserCount();
    loadEspaciosCount();
    loadRespuestasRapidasCount();
  }, [router]);

  const loadUserCount = async () => {
    try {
      // Usar el nuevo método seguro de conteo
      const result = await supabaseService.getUsersCount();
      if (result.success && typeof result.data === 'number') {
        setUserCount(result.data);
      }
    } catch (error) {
      console.error('Error loading user count:', error);
    }
  };

  const loadEspaciosCount = async () => {
    try {
      // Usar el nuevo método seguro de conteo
      const result = await supabaseService.getEspaciosTrabajoCount();
      if (result.success && typeof result.data === 'number') {
        setEspaciosCount(result.data);
      }
    } catch (error) {
      console.error('Error loading espacios count:', error);
    }
  };

  const loadRespuestasRapidasCount = async () => {
    try {
      // Usar el nuevo método seguro de conteo
      const result = await supabaseService.getRespuestasRapidasCount();
      if (result.success && typeof result.data === 'number') {
        setRespuestasRapidasCount(result.data);
      }
    } catch (error) {
      console.error('Error loading respuestas rápidas count:', error);
    }
  };

  // Actualizar contadores cada vez que se activen las pestañas correspondientes
  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUserCount();
    } else if (activeTab === 'espacios-trabajo') {
      loadEspaciosCount();
    } else if (activeTab === 'respuestas-rapidas') {
      loadRespuestasRapidasCount();
    }
  }, [activeTab]);

  // Función de logout ya no es necesaria aquí
  // El logout se maneja a través del Header component

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-primary)]">Cargando...</div>
      </div>
    );
  }

  return (
    <RoleProtection requiredRoles={['Administrador', 'Admin']}>
      <div className="flex-1 flex flex-col">
        {/* Header de Configuración */}
        <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              {/* Page Title */}
              <h1 className="text-[var(--text-primary)] font-semibold text-2xl">Configuración</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-[var(--bg-secondary)] text-[var(--text-muted)] text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-[var(--bg-primary)] p-6">
          {/* Renderizar el componente de la pestaña activa */}
          {(() => {
            const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;
            if (ActiveTabComponent) {
              // Pasar props específicas según el componente
              if (activeTab === 'etiquetas') {
                return <EtiquetasTab onEtiquetasCountChange={setEtiquetasCount} />;
              }
              return <ActiveTabComponent />;
            }
            return null;
          })()}
        </div>
      </div>
    </RoleProtection>
  );
}
