'use client';

import { useState, useEffect } from 'react';
import { mensajesService, MensajeResponse } from '@/services/mensajesServices';

interface DetallesMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mensaje: MensajeResponse | null;
  onMensajeDeleted: () => void;
}

export default function DetallesMensajeModal({ 
  isOpen, 
  onClose, 
  mensaje,
  onMensajeDeleted
}: DetallesMensajeModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Estados para edición del contenido
  const [contenidoEditado, setContenidoEditado] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Inicializar contenido editado cuando se abre el modal
  useEffect(() => {
    if (mensaje && isOpen) {
      setContenidoEditado(mensaje.contenido);
      setUpdateError(null);
      setUpdateSuccess(false);
    }
  }, [mensaje, isOpen]);

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!mensaje) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await mensajesService.deleteMensaje(mensaje.id);

      if (result.success) {
        console.log('Mensaje eliminado exitosamente');
        onMensajeDeleted();
        onClose();
      } else {
        setDeleteError(result.error || 'Error al eliminar el mensaje');
      }
    } catch (error) {
      console.error('Error deleting mensaje:', error);
      setDeleteError('Error inesperado al eliminar el mensaje');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setDeleteError(null);
  };

  const handleUpdateClick = async () => {
    if (!mensaje || contenidoEditado.trim() === '') {
      setUpdateError('El contenido no puede estar vacío');
      return;
    }

    if (contenidoEditado === mensaje.contenido) {
      setUpdateError('No hay cambios para guardar');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      console.log('🔄 Actualizando contenido del mensaje:', mensaje.id);
      const result = await mensajesService.updateMensaje(mensaje.id, {
        contenido: contenidoEditado.trim()
      });

      if (result.success) {
        console.log('✅ Mensaje actualizado exitosamente');
        setUpdateSuccess(true);
        // Actualizar el mensaje local para reflejar el cambio
        mensaje.contenido = contenidoEditado.trim();
        
        // Auto-ocultar el mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      } else {
        console.error('❌ Error al actualizar mensaje:', result.error);
        setUpdateError(result.error || 'Error al actualizar el mensaje');
      }
    } catch (error) {
      console.error('❌ Error inesperado al actualizar mensaje:', error);
      setUpdateError('Error inesperado al actualizar el mensaje');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = mensaje && contenidoEditado !== mensaje.contenido;

  
  if (!isOpen || !mensaje) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold">Detalles del Mensaje</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contenido */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Contenido del Mensaje
            </label>
            <textarea
              value={contenidoEditado}
              onChange={(e) => setContenidoEditado(e.target.value)}
              className="w-full text-white text-sm bg-[#1a1d23] rounded p-4 border border-[#3a3d45] min-h-32 max-h-60 resize-none focus:outline-none focus:border-[#00b894] transition-colors"
              placeholder="Escribe el contenido del mensaje..."
              disabled={isUpdating || isDeleting}
            />
            {hasChanges && (
              <div className="text-yellow-400 text-xs mt-1 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Hay cambios sin guardar
              </div>
            )}
          </div>

          {/* Fecha de Creación */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Fecha de Creación
            </label>
            <div className="text-white text-sm bg-[#1a1d23] rounded p-3 border border-[#3a3d45]">
              {new Date(mensaje.creado_en).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>

          {/* Success Message */}
          {updateSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-green-400 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mensaje actualizado exitosamente
            </div>
          )}

          {/* Error Messages */}
          {updateError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-sm">
              {updateError}
            </div>
          )}
          {deleteError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-sm">
              {deleteError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-[#3a3d45]">
          {!showConfirmDelete ? (
            <>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateClick}
                  disabled={isUpdating || isDeleting || !hasChanges}
                  className="bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar'
                  )}
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting || isUpdating}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Eliminar Mensaje
                </button>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting || isUpdating}
                className="bg-[#3a3d45] hover:bg-[#4a4d55] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Cerrar
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="text-yellow-400 text-sm font-medium">
                ¿Estás seguro de que quieres eliminar este mensaje?
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="bg-[#3a3d45] hover:bg-[#4a4d55] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium transition-colors"
                >
                  {isDeleting ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
