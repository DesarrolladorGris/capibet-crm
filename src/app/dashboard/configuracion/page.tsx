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

// Tipos para las pestañas
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  component: React.ComponentType;
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('espacios-trabajo');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [espaciosCount, setEspaciosCount] = useState(0);
  const [respuestasRapidasCount, setRespuestasRapidasCount] = useState(0);
  const router = useRouter();

  // Configuración de pestañas
  const tabs: TabConfig[] = [
    { id: 'espacios-trabajo', label: 'Espacios de trabajo', icon: Building2, count: espaciosCount, component: EspaciosTrabajoTab },
    { id: 'sesiones', label: 'Sesiones', icon: Link, count: 0, component: SesionesTab },
    { id: 'etiquetas', label: 'Etiquetas', icon: Tag, count: 4, component: EtiquetasTab },
    { id: 'usuarios', label: 'Usuarios', icon: Users, count: userCount, component: UsuariosTab },
    { id: 'respuestas-rapidas', label: 'Respuestas rápidas', icon: MessageCircle, count: respuestasRapidasCount, component: RespuestasRapidasTab },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isUserAuthenticated();
      if (!isAuth) {
        router.push('/login');
        return;
      }

      // Cargar conteos
      try {
        const [usersResult, espaciosResult, respuestasResult] = await Promise.all([
          usuarioService.getAllUsuarios(),
          espacioTrabajoService.getAllEspaciosTrabajo(),
          respuestasRapidasService.getAllRespuestasRapidas()
        ]);

        if (usersResult.success) {
          setUserCount(usersResult.data?.length || 0);
        }
        if (espaciosResult.success) {
          setEspaciosCount(espaciosResult.data?.length || 0);
        }
        if (respuestasResult.success) {
          setRespuestasRapidasCount(respuestasResult.data?.length || 0);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-[#1a1d23]">
      {/* Header */}
      <div className="bg-[#2a2d35] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold mb-1">Configuración</h1>
            <p className="text-gray-400 text-sm">Gestiona tu cuenta, usuarios, espacios de trabajo y más</p>
          </div>
          <div className="text-right">
            <div className="text-white text-sm font-medium">{userName || userEmail}</div>
            <div className="text-gray-400 text-xs">
              {userRole === 'admin' ? 'Administrador' : 
               userRole === 'manager' ? 'Gerente' : 'Usuario'} • {agencyName}
            </div>
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
              <tab.icon className="w-4 h-4" />
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
