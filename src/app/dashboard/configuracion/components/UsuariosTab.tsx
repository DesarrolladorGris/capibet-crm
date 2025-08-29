'use client';

import { useState, useEffect } from 'react';
import { supabaseService, UsuarioResponse } from '@/services/supabaseService';
import NuevoUsuarioModal from './NuevoUsuarioModal';
import EditarUsuarioModal from './EditarUsuarioModal';
import ConfirmDeactivateModal from './ConfirmDeactivateModal';
import ConfirmActivateModal from './ConfirmActivateModal';

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNuevoUsuarioModal, setShowNuevoUsuarioModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioResponse | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UsuarioResponse | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await supabaseService.getAllUsuarios();
      
      if (result.success && result.data) {
        setUsuarios(result.data);
      } else {
        setError(result.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateUser = (usuario: UsuarioResponse) => {
    setUserToToggle(usuario);
    setShowDeactivateModal(true);
  };

  const handleActivateUser = (usuario: UsuarioResponse) => {
    setUserToToggle(usuario);
    setShowActivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!userToToggle?.id) return;
    
    setIsTogglingStatus(true);
    try {
      const result = await supabaseService.toggleUsuarioStatus(userToToggle.id, false);
      
      if (result.success) {
        loadUsuarios();
        setShowDeactivateModal(false);
        setUserToToggle(null);
      } else {
        setError(result.error || 'Error al dar de baja al usuario');
      }
    } catch {
      setError('Error de conexión al dar de baja al usuario');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const confirmActivate = async () => {
    if (!userToToggle?.id) return;
    
    setIsTogglingStatus(true);
    try {
      const result = await supabaseService.toggleUsuarioStatus(userToToggle.id, true);
      
      if (result.success) {
        loadUsuarios();
        setShowActivateModal(false);
        setUserToToggle(null);
      } else {
        setError(result.error || 'Error al reactivar al usuario');
      }
    } catch {
      setError('Error de conexión al reactivar al usuario');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const closeModals = () => {
    if (!isTogglingStatus) {
      setShowDeactivateModal(false);
      setShowActivateModal(false);
      setUserToToggle(null);
    }
  };

  const handleUserCreated = () => {
    // Refrescar la lista de usuarios cuando se crea uno nuevo
    loadUsuarios();
  };

  const handleEditUser = (usuario: UsuarioResponse) => {
    setSelectedUser(usuario);
    setShowEditModal(true);
  };

  const handleUserUpdated = () => {
    // Refrescar la lista de usuarios cuando se edita uno
    loadUsuarios();
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      // Si la fecha viene como "2025-08-26", parsearlo correctamente
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (activo: boolean) => {
    if (activo) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ● Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ● Inactivo
        </span>
      );
    }
  };

  const getRoleBadge = (rol: string) => {
    if (rol === 'Admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          👑 {rol}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          👤 {rol}
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b894] mx-auto mb-4"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button 
            onClick={loadUsuarios}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-medium">Usuarios</h3>
          <p className="text-gray-400 text-sm">
            Gestión de usuarios del sistema ({usuarios.length} usuarios)
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadUsuarios}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>🔄</span>
            <span>Actualizar</span>
          </button>
          <button 
            onClick={() => setShowNuevoUsuarioModal(true)}
            className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>➕</span>
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {usuarios.length > 0 ? (
        <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1d23] border-b border-[#3a3d45]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Agencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tipo Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha Alta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3d45]">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-[#1a1d23] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{usuario.nombre_usuario}</div>
                        <div className="text-gray-400 text-sm">{usuario.correo_electronico}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">{usuario.nombre_agencia}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 text-sm">{usuario.tipo_empresa}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(usuario.rol)}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      +{usuario.codigo_pais} {usuario.telefono}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(usuario.activo)}
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {formatDate(usuario.fecha_alta)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleEditUser(usuario)}
                          className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        {usuario.activo ? (
                          <button 
                            onClick={() => handleDeactivateUser(usuario)}
                            className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                            title="Dar de baja usuario"
                          >
                            ⬇️
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivateUser(usuario)}
                            className="text-gray-400 hover:text-green-400 text-sm transition-colors"
                            title="Dar de alta usuario"
                          >
                            ⬆️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h4 className="text-white text-lg font-medium mb-2">No hay usuarios</h4>
          <p className="text-gray-400 text-sm mb-6">No se encontraron usuarios en el sistema.</p>
          <button 
            onClick={loadUsuarios}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Recargar usuarios
          </button>
        </div>
      )}

      {/* Modal de Nuevo Usuario */}
      <NuevoUsuarioModal
        isOpen={showNuevoUsuarioModal}
        onClose={() => setShowNuevoUsuarioModal(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Modal de Editar Usuario */}
      <EditarUsuarioModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        usuario={selectedUser}
      />

      {/* Modal de Confirmación de Dar de Baja */}
      <ConfirmDeactivateModal
        isOpen={showDeactivateModal}
        onClose={closeModals}
        onConfirm={confirmDeactivate}
        usuario={userToToggle}
        isLoading={isTogglingStatus}
      />

      {/* Modal de Confirmación de Dar de Alta */}
      <ConfirmActivateModal
        isOpen={showActivateModal}
        onClose={closeModals}
        onConfirm={confirmActivate}
        usuario={userToToggle}
        isLoading={isTogglingStatus}
      />
    </div>
  );
}
