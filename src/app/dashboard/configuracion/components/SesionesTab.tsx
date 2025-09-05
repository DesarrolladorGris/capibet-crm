'use client';

import { useState, useEffect } from 'react';
import { supabaseService, Canal, SesionResponse, CanalData, UsuarioResponse, EspacioTrabajoResponse } from '@/services/supabaseService';
import CanalSelector from './CanalSelector';
import SesionesList from './SesionesList';
import ConfirmDeleteCanalModal from './ConfirmDeleteCanalModal';

interface CanalOption {
  id: Canal['tipo'];
  nombre: string;
  icon: string;
  color: string;
  tipo: Canal['tipo'];
}

const canalOptions: CanalOption[] = [
  { id: 'whatsapp', nombre: 'WhatsApp', icon: '📱', color: '#25D366', tipo: 'whatsapp' },

  { id: 'whatsappApi', nombre: 'WhatsApp API', icon: '📱', color: '#25D366', tipo: 'whatsappApi' },
  { id: 'email', nombre: 'Email', icon: '✉️', color: '#EA4335', tipo: 'email' },
  { id: 'instagram', nombre: 'Instagram', icon: '📷', color: '#E4405F', tipo: 'instagram' },
  { id: 'messenger', nombre: 'Messenger', icon: '💬', color: '#0084FF', tipo: 'messenger' },
  { id: 'telegram', nombre: 'Telegram', icon: '✈️', color: '#0088CC', tipo: 'telegram' },
  { id: 'telegramBot', nombre: 'Telegram Bot', icon: '🤖', color: '#0088CC', tipo: 'telegramBot' },
  { id: 'webChat', nombre: 'Web Chat', icon: '💬', color: '#00b894', tipo: 'webChat' },
];

export default function SesionesTab() {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
  const [showAddCanal, setShowAddCanal] = useState(false);
  const [showAddSesion, setShowAddSesion] = useState(false);
  const [selectedCanalType, setSelectedCanalType] = useState<Canal['tipo'] | null>(null);
  const [selectedCanalForSesion, setSelectedCanalForSesion] = useState<Canal | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '' as Canal['tipo'] | '',
    descripcion: '',
    usuario_id: '',
    espacio_id: '',
    nombre: '',
    embudo_id: '',
  });
  const [sesionFormData, setSesionFormData] = useState({
    nombre: '',
    usuario_id: '',
    api_key: '',
    access_token: '',
    phone_number: '',
    email_user: '',
    email_password: '',
    smtp_host: '',
    smtp_port: '',
    imap_host: '',
    imap_port: '',
    estado: 'activo' as 'activo' | 'desconectado' | 'expirado',
  });
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [espaciosTrabajo, setEspaciosTrabajo] = useState<EspacioTrabajoResponse[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [canalToDelete, setCanalToDelete] = useState<Canal | null>(null);
  const [canalSesiones, setCanalSesiones] = useState<Record<number, SesionResponse[]>>({});

  useEffect(() => {
    loadCanales();
    loadSesiones();
    loadUsuarios();
    loadEspaciosTrabajo();
  }, []);

  const loadCanales = async () => {
    setLoading(true);
    try {
      const result = await supabaseService.getAllCanales();
      if (result.success && result.data) {
        setCanales(result.data);
      }
    } catch (error) {
      console.error('Error loading canales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSesiones = async () => {
    try {
      const result = await supabaseService.getAllSesiones();
      if (result.success) {
        setSesiones(result.data || []);
        
        // Agrupar sesiones por canal
        const sesionesGrouped: Record<number, SesionResponse[]> = {};
        (result.data || []).forEach((sesion: SesionResponse) => {
          if (sesion.canal_id) {
            if (!sesionesGrouped[sesion.canal_id]) {
              sesionesGrouped[sesion.canal_id] = [];
            }
            sesionesGrouped[sesion.canal_id].push(sesion);
          }
        });
        
        setCanalSesiones(sesionesGrouped);
        
        if (result.error) {
          console.warn('Sesiones:', result.error);
        }
      } else {
        console.error('Error loading sesiones:', result.error);
        setSesiones([]); // Fallback a lista vacía
        setCanalSesiones({}); // Limpiar sesiones agrupadas
      }
    } catch (error) {
      console.error('Error loading sesiones:', error);
      setSesiones([]); // Fallback a lista vacía
      setCanalSesiones({}); // Limpiar sesiones agrupadas
    }
  };

  const loadUsuarios = async () => {
    try {
      const result = await supabaseService.getAllUsuarios();
      if (result.success && result.data) {
        setUsuarios(result.data);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
    }
  };

  const loadEspaciosTrabajo = async () => {
    try {
      const result = await supabaseService.getAllEspaciosTrabajo();
      if (result.success && result.data) {
        setEspaciosTrabajo(result.data);
      }
    } catch (error) {
      console.error('Error loading espacios de trabajo:', error);
    }
  };

  const handleAddCanal = async () => {
    // Resetear formulario y abrir modal
    setFormData({
      tipo: '',
      descripcion: '',
      usuario_id: '',
      espacio_id: '',
      nombre: '',
      embudo_id: '',
    });
    setShowAddCanal(true);
  };

  const handleCreateCanal = async () => {
    if (!formData.tipo || !formData.descripcion || !formData.usuario_id || !formData.espacio_id) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const canalData: CanalData = {
        usuario_id: parseInt(formData.usuario_id),
        espacio_id: parseInt(formData.espacio_id),
        tipo: formData.tipo as Canal['tipo'],
        descripcion: formData.descripcion,
        configuracion: {},
        activo: true,
      };

      const result = await supabaseService.createCanal(canalData);

      if (result.success) {
        setShowAddCanal(false);
        setFormData({
          tipo: '',
          descripcion: '',
          usuario_id: '',
          espacio_id: '',
          nombre: '',
          embudo_id: '',
        });
        loadCanales();
      } else {
        console.error('Error creating canal:', result.error);
        console.error('Error details:', result.details);
        alert(`Error al crear canal: ${result.error}\n\nDetalles: ${result.details || 'Sin detalles adicionales'}`);
      }
    } catch (error) {
      console.error('Error creating canal:', error);
      alert('Error de conexión al crear canal');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSesionStatus = async (sesionId: number, estado: 'activo' | 'desconectado' | 'expirado') => {
    setLoading(true);
    try {
      const result = await supabaseService.updateSesion(sesionId, { estado });
      if (result.success) {
        loadSesiones();
      } else {
        console.error('Error updating sesion status:', result.error);
        alert(`Error al actualizar estado de sesión: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating sesion status:', error);
      alert('Error de conexión al actualizar estado de sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSesion = async (sesionId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sesión?')) return;
    
    setLoading(true);
    try {
      const result = await supabaseService.deleteSesion(sesionId);
      if (result.success) {
        loadSesiones();
      } else {
        console.error('Error deleting sesion:', result.error);
        alert(`Error al eliminar sesión: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting sesion:', error);
      alert('Error de conexión al eliminar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCanal = (canal: Canal) => {
    setCanalToDelete(canal);
    setShowDeleteModal(true);
  };

  const confirmDeleteCanal = async () => {
    if (!canalToDelete?.id) return;
    
    setLoading(true);
    try {
      const result = await supabaseService.deleteCanal(canalToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setCanalToDelete(null);
        loadCanales();
      } else {
        console.error('Error deleting canal:', result.error);
        alert(`Error al eliminar canal: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting canal:', error);
      alert('Error de conexión al eliminar canal');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteCanal = () => {
    setShowDeleteModal(false);
    setCanalToDelete(null);
  };

  const getCanalIcon = (tipo: Canal['tipo']) => {
    const option = canalOptions.find(opt => opt.tipo === tipo);
    return option?.icon || '📱';
  };

  const getCanalColor = (tipo: Canal['tipo']) => {
    const option = canalOptions.find(opt => opt.tipo === tipo);
    return option?.color || '#00b894';
  };

  // Funciones para manejar sesiones
  const loadSesionesByCanal = async (canalId: number) => {
    try {
      const result = await supabaseService.getSesionesByCanal(canalId);
      if (result.success) {
        setCanalSesiones(prev => ({
          ...prev,
          [canalId]: result.data || []
        }));
      }
    } catch (error) {
      console.error('Error loading sesiones del canal:', error);
    }
  };

  const handleAddSesionToCanal = (canal: Canal) => {
    setSelectedCanalForSesion(canal);
    setSesionFormData({
      nombre: '',
      usuario_id: '',
      api_key: '',
      access_token: '',
      phone_number: '',
      email_user: '',
      email_password: '',
      smtp_host: '',
      smtp_port: '',
      imap_host: '',
      imap_port: '',
      estado: 'activo',
    });
    setShowAddSesion(true);
  };

  const handleCreateSesion = async () => {
    if (!selectedCanalForSesion) return;

    // Validar campos requeridos
    if (!sesionFormData.nombre.trim()) {
      alert('El nombre de la sesión es requerido');
      return;
    }

    if (!sesionFormData.usuario_id) {
      alert('Debe seleccionar un usuario');
      return;
    }

    setLoading(true);
    try {
      const sesionData = {
        canal_id: selectedCanalForSesion.id!,
        usuario_id: parseInt(sesionFormData.usuario_id),
        nombre: sesionFormData.nombre,
        api_key: sesionFormData.api_key || null,
        access_token: sesionFormData.access_token || null,
        phone_number: sesionFormData.phone_number || null,
        email_user: sesionFormData.email_user || null,
        email_password: sesionFormData.email_password || null,
        smtp_host: sesionFormData.smtp_host || null,
        smtp_port: sesionFormData.smtp_port ? parseInt(sesionFormData.smtp_port) : null,
        imap_host: sesionFormData.imap_host || null,
        imap_port: sesionFormData.imap_port ? parseInt(sesionFormData.imap_port) : null,
        estado: sesionFormData.estado,
      };

      const result = await supabaseService.createSesion(sesionData);
      
      if (result.success) {
        setShowAddSesion(false);
        setSelectedCanalForSesion(null);
        setSesionFormData({
          nombre: '',
          usuario_id: '',
          api_key: '',
          access_token: '',
          phone_number: '',
          email_user: '',
          email_password: '',
          smtp_host: '',
          smtp_port: '',
          imap_host: '',
          imap_port: '',
          estado: 'activo',
        });
        // Recargar todas las sesiones
        loadSesiones();
      } else {
        console.error('Error creating sesion:', result.error);
        alert(`Error al crear sesión: ${result.error}\n\nDetalles: ${result.details || 'Sin detalles adicionales'}`);
      }
    } catch (error) {
      console.error('Error creating sesion:', error);
      alert('Error de conexión al crear sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de Sesiones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔗</span>
          <div>
            <h2 className="text-white text-2xl font-semibold">Sesiones {sesiones.length}</h2>
            <p className="text-gray-400 text-sm">Crear, editar y eliminar tus sesiones vinculadas.</p>
          </div>
        </div>

      </div>

      {/* Sección de Canales */}
      <div className="bg-[#2a2d35] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-medium">Canales</h3>
          <button
            onClick={() => setShowAddCanal(true)}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Añadir canal
          </button>
        </div>

        {/* Grid de opciones de canales - solo informativo */}
        <div className="mb-6">
          <CanalSelector 
            onSelectCanal={() => {}} // Solo visual, no funcional
            showDescriptions={true}
          />
          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm mb-3">
              Haz clic en &quot;Añadir canal&quot; para configurar cualquiera de estos tipos
            </p>
          </div>
        </div>

        {/* Lista de canales existentes */}
        {canales.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">Canales configurados:</h4>
            {canales.map((canal) => (
              <div
                key={canal.id}
                className="flex items-center justify-between bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2d35] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="text-xl"
                    style={{ color: getCanalColor(canal.tipo) }}
                  >
                    {getCanalIcon(canal.tipo)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{canal.descripcion}</div>
                    <div className="text-gray-400 text-sm">
                      {canal.tipo} • ID: {canal.id}
                      {canal.creado_en && (
                        <span className="ml-2">
                          • {new Date(canal.creado_en).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Configurado
                  </span>
                  <button
                    onClick={() => handleAddSesionToCanal(canal)}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    title="Agregar sesión"
                    disabled={loading}
                  >
                    + Sesión
                  </button>
                  <button
                    onClick={() => handleDeleteCanal(canal)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Eliminar canal"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
                
                {/* Sesiones del canal */}
                {canal.id && canalSesiones[canal.id] && canalSesiones[canal.id].length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-600">
                    <h4 className="text-white text-sm font-medium mb-2">
                      Sesiones asociadas ({canalSesiones[canal.id].length})
                    </h4>
                    <div className="space-y-2">
                      {canalSesiones[canal.id].map((sesion) => (
                        <div
                          key={sesion.id}
                          className="bg-[#1a1d23] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-white text-sm font-medium">
                              {sesion.nombre}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Estado: {sesion.estado} • ID: {sesion.id}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Sesiones */}
      <div className="bg-[#2a2d35] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">Sesiones activas</h3>
          <div className="text-sm text-gray-400">
            Funcionalidad en desarrollo
          </div>
        </div>
        
        {sesiones.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🔗</div>
            <h4 className="text-white text-lg font-medium mb-2">Sesiones en desarrollo</h4>
            <p className="text-gray-400 text-sm mb-4">
              La funcionalidad de sesiones estará disponible próximamente.
            </p>
            <p className="text-gray-500 text-xs">
              Por ahora puedes gestionar tus canales de comunicación desde la sección superior.
            </p>
          </div>
        ) : (
          <SesionesList 
            sesiones={sesiones}
            canales={canales}
            onToggleStatus={handleToggleSesionStatus}
            onDeleteSesion={handleDeleteSesion}
          />
        )}
      </div>

      {/* Modal para agregar canal */}
      {showAddCanal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">
                Agregar Canal
              </h3>
              <button
                onClick={() => setShowAddCanal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Tipo de canal */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Tipo de canal <span className="text-red-400">*</span>
                </label>
                                 <select
                   value={formData.tipo}
                   onChange={(e) => setFormData({ ...formData, tipo: e.target.value as Canal['tipo'] })}
                   className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894]"
                 >
                   <option value="">Seleccionar tipo</option>
                   {canalOptions.map((option) => (
                     <option key={option.id} value={option.id}>
                       {option.icon} {option.nombre}
                     </option>
                   ))}
                 </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Descripción del canal <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                  placeholder="Ej: WhatsApp Principal"
                />
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Usuario <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894]"
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre_usuario} ({usuario.correo_electronico})
                    </option>
                  ))}
                </select>
              </div>

              {/* Espacio de trabajo */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Espacio de trabajo <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.espacio_id}
                  onChange={(e) => setFormData({ ...formData, espacio_id: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894]"
                >
                  <option value="">Seleccionar espacio</option>
                  {espaciosTrabajo.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCanal(false)}
                  className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCanal}
                  disabled={!formData.tipo || !formData.descripcion || !formData.usuario_id || !formData.espacio_id || loading}
                  className="flex-1 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Canal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar sesión */}
      {showAddSesion && selectedCanalForSesion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-medium">
                Agregar Sesión - {selectedCanalForSesion.descripcion}
              </h3>
              <button
                onClick={() => setShowAddSesion(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nombre de la sesión *
                </label>
                <input
                  type="text"
                  value={sesionFormData.nombre}
                  onChange={(e) => setSesionFormData({ ...sesionFormData, nombre: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                  placeholder="Ej: Ventas por WhatsApp"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Usuario *
                </label>
                <select
                  value={sesionFormData.usuario_id}
                  onChange={(e) => setSesionFormData({ ...sesionFormData, usuario_id: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894]"
                >
                  <option value="">Seleccionar usuario</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre_usuario}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Estado
                </label>
                <select
                  value={sesionFormData.estado}
                  onChange={(e) => setSesionFormData({ ...sesionFormData, estado: e.target.value as 'activo' | 'desconectado' | 'expirado' })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894]"
                >
                  <option value="activo">Activo</option>
                  <option value="desconectado">Desconectado</option>
                  <option value="expirado">Expirado</option>
                </select>
              </div>

              {/* Configuración específica del canal */}
              {selectedCanalForSesion.tipo === 'email' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={sesionFormData.email_user}
                        onChange={(e) => setSesionFormData({ ...sesionFormData, email_user: e.target.value })}
                        className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                        placeholder="usuario@dominio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={sesionFormData.email_password}
                        onChange={(e) => setSesionFormData({ ...sesionFormData, email_password: e.target.value })}
                        className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={sesionFormData.smtp_host}
                        onChange={(e) => setSesionFormData({ ...sesionFormData, smtp_host: e.target.value })}
                        className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={sesionFormData.smtp_port}
                        onChange={(e) => setSesionFormData({ ...sesionFormData, smtp_port: e.target.value })}
                        className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                        placeholder="587"
                      />
                    </div>
                  </div>
                </>
              )}

              {(selectedCanalForSesion.tipo === 'whatsapp' || selectedCanalForSesion.tipo === 'whatsappApi') && (
                <>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      API Key
                    </label>
                    <input
                      type="text"
                      value={sesionFormData.api_key}
                      onChange={(e) => setSesionFormData({ ...sesionFormData, api_key: e.target.value })}
                      className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                      placeholder="Ingresa tu API Key"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Número de teléfono
                    </label>
                    <input
                      type="text"
                      value={sesionFormData.phone_number}
                      onChange={(e) => setSesionFormData({ ...sesionFormData, phone_number: e.target.value })}
                      className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                      placeholder="+1234567890"
                    />
                  </div>
                </>
              )}

              {(selectedCanalForSesion.tipo === 'instagram' || selectedCanalForSesion.tipo === 'messenger') && (
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Access Token
                  </label>
                  <input
                    type="text"
                    value={sesionFormData.access_token}
                    onChange={(e) => setSesionFormData({ ...sesionFormData, access_token: e.target.value })}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                    placeholder="Ingresa tu Access Token"
                  />
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddSesion(false)}
                  className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSesion}
                  disabled={!sesionFormData.nombre || !sesionFormData.usuario_id || loading}
                  className="flex-1 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Creando...' : 'Crear Sesión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar canal */}
      <ConfirmDeleteCanalModal
        isOpen={showDeleteModal}
        canal={canalToDelete}
        onConfirm={confirmDeleteCanal}
        onCancel={cancelDeleteCanal}
        isLoading={loading}
      />
    </div>
  );
}
