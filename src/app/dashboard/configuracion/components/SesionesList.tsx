'use client';

import { SesionResponse } from '@/services/sesionesServices';
import { Canal } from '@/services/canalesServices';
import { Edit, Trash2 } from 'lucide-react';

interface CanalOption {
  id: string;
  nombre: string;
  icon: string;
  color: string;
  tipo: Canal['tipo'];
}

const canalOptions: CanalOption[] = [
  { id: 'whatsapp', nombre: 'WhatsApp', icon: '📱', color: '#25D366', tipo: 'whatsapp' },

  { id: 'whatsapp_api', nombre: 'Whatsapp API', icon: '📱', color: '#25D366', tipo: 'whatsappApi' },
  { id: 'instagram', nombre: 'Instagram', icon: '📷', color: '#E4405F', tipo: 'instagram' },
  { id: 'messenger', nombre: 'Messenger', icon: '💬', color: '#0084FF', tipo: 'messenger' },
  { id: 'telegram', nombre: 'Telegram', icon: '✈️', color: '#0088CC', tipo: 'telegram' },
  { id: 'telegram_bot', nombre: 'Telegram Bot', icon: '🤖', color: '#0088CC', tipo: 'telegramBot' },
  { id: 'web_chat', nombre: 'Web Chat', icon: '💬', color: '#00b894', tipo: 'webChat' },
  { id: 'email', nombre: 'Email', icon: '✉️', color: '#EA4335', tipo: 'email' },
];

interface SesionesListProps {
  sesiones: SesionResponse[];
  canales: Canal[];
  onEditSesion?: (sesion: SesionResponse) => void;
  onDeleteSesion?: (sesionId: number) => void;
  onToggleStatus?: (sesionId: number, estado: 'activo' | 'desconectado' | 'expirado') => void;
}

export default function SesionesList({ 
  sesiones, 
  canales,
  onEditSesion, 
  onDeleteSesion, 
  onToggleStatus 
}: SesionesListProps) {
  const getCanalById = (canalId: number): Canal | undefined => {
    return canales.find(canal => canal.id === canalId);
  };

  const getCanalIcon = (tipo: Canal['tipo']) => {
    const option = canalOptions.find(opt => opt.tipo === tipo);
    return option?.icon || '📱';
  };

  const getCanalColor = (tipo: Canal['tipo']) => {
    const option = canalOptions.find(opt => opt.tipo === tipo);
    return option?.color || '#00b894';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (sesiones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔗</div>
        <h3 className="text-white text-lg font-medium mb-2">No hay sesiones configuradas</h3>
        <p className="text-gray-400 mb-4">Crea tu primera sesión para comenzar a gestionar tus canales</p>
        <div className="bg-[#1a1d23] rounded-lg p-4 max-w-md mx-auto">
          <div className="text-gray-500 text-sm">
            <p>• Conecta WhatsApp, Instagram, Telegram y más</p>
            <p>• Gestiona múltiples cuentas desde un solo lugar</p>
            <p>• Automatiza respuestas y flujos de trabajo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1d23] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Sesiones</p>
              <p className="text-white text-2xl font-bold">{sesiones.length}</p>
            </div>
            <div className="text-2xl">🔗</div>
          </div>
        </div>
        
        <div className="bg-[#1a1d23] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sesiones Activas</p>
              <p className="text-white text-2xl font-bold">
                {sesiones.filter(s => s.estado === 'activo').length}
              </p>
            </div>
            <div className="text-2xl text-green-500">✅</div>
          </div>
        </div>
        
        <div className="bg-[#1a1d23] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Canales Únicos</p>
              <p className="text-white text-2xl font-bold">
                {new Set(sesiones.map(s => {
                  const canal = getCanalById(s.canal_id);
                  return canal?.tipo;
                }).filter(tipo => tipo !== undefined)).size}
              </p>
            </div>
            <div className="text-2xl">📱</div>
          </div>
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="space-y-3">
        {sesiones.map((sesion) => (
          <div
            key={sesion.id}
            className={`
              bg-[#1a1d23] rounded-lg p-4 transition-all duration-200 hover:bg-[#2a2d35]
              ${sesion.estado === 'activo' ? 'border-l-4 border-[#00b894]' : 'border-l-4 border-gray-600'}
            `}
          >
            <div className="flex items-center justify-between">
              {/* Información principal */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Icono del canal */}
                <div 
                  className="text-2xl p-3 rounded-full bg-[#2a2d35]"
                  style={{ color: getCanalColor(getCanalById(sesion.canal_id)?.tipo || 'whatsapp') }}
                >
                  {getCanalIcon(getCanalById(sesion.canal_id)?.tipo || 'whatsapp')}
                </div>
                
                {/* Detalles de la sesión */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-medium">{sesion.nombre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      sesion.estado === 'activo'
                        ? 'bg-green-100 text-green-800' 
                        : sesion.estado === 'desconectado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sesion.estado}
                    </span>
                  </div>
                  
                   <div className="text-gray-400 text-sm space-y-1">
                     <p>Canal: <span className="text-white">{getCanalById(sesion.canal_id)?.descripcion || `Canal ID: ${sesion.canal_id}`}</span></p>
                     <p>Usuario ID: <span className="text-white">{sesion.usuario_id}</span></p>
                     <p>Creada: <span className="text-white">{formatDate(sesion.creado_en)}</span></p>
                   </div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="flex items-center space-x-2">
                {/* Toggle de estado */}
                <button
                  onClick={() => {
                    const nuevoEstado = sesion.estado === 'activo' ? 'desconectado' : 'activo';
                    onToggleStatus?.(sesion.id, nuevoEstado);
                  }}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${sesion.estado === 'activo'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }
                  `}
                >
                  {sesion.estado === 'activo' ? 'Desconectar' : 'Activar'}
                </button>
                
                {/* Botón editar */}
                {onEditSesion && (
                  <button
                    onClick={() => onEditSesion(sesion)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3d45] rounded-lg transition-colors"
                    title="Editar sesión"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {/* Botón eliminar */}
                {onDeleteSesion && (
                  <button
                    onClick={() => onDeleteSesion(sesion.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Información adicional */}
            {(sesion.api_key || sesion.email_user || sesion.phone_number) && (
              <div className="mt-3 pt-3 border-t border-[#3a3d45]">
                <p className="text-gray-400 text-xs">
                  Configuración:
                  {sesion.api_key && <span className="ml-1">API Key configurado</span>}
                  {sesion.email_user && <span className="ml-1">Email: {sesion.email_user}</span>}
                  {sesion.phone_number && <span className="ml-1">Tel: {sesion.phone_number}</span>}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
