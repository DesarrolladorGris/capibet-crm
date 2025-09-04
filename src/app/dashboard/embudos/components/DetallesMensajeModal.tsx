'use client';

import { useState } from 'react';
import { MensajeResponse, supabaseService } from '@/services/supabaseService';

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

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!mensaje) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await supabaseService.deleteMensaje(mensaje.id);

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
        <div className="p-6 space-y-4">
          {/* ID del Mensaje */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              ID del Mensaje
            </label>
            <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
              {mensaje.id}
            </div>
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Contenido
            </label>
            <div className="text-white text-sm bg-[#1a1d23] rounded p-3 border border-[#3a3d45] min-h-20 max-h-40 overflow-y-auto">
              {mensaje.contenido}
            </div>
          </div>

          {/* Información del Canal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Canal ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.canal_id}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Embudo ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.embudo_id}
              </div>
            </div>
          </div>

          {/* Información de Contacto y Sesión */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Contacto ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.contacto_id}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Sesión ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.sesion_id}
              </div>
            </div>
          </div>

          {/* Información del Remitente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Remitente ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.remitente_id}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Destinatario ID
              </label>
              <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                {mensaje.destinatario_id}
              </div>
            </div>
          </div>

          {/* Fecha de Creación */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Fecha de Creación
            </label>
            <div className="text-white text-sm bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
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

          {/* Información adicional si está disponible */}
          {(mensaje.enviado_en || mensaje.leido !== undefined || mensaje.tipo || mensaje.estado) && (
            <div className="border-t border-[#3a3d45] pt-4">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4">
                {mensaje.enviado_en && (
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Enviado en
                    </label>
                    <div className="text-white text-xs bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                      {new Date(mensaje.enviado_en).toLocaleString('es-ES')}
                    </div>
                  </div>
                )}
                {mensaje.leido !== undefined && (
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Leído
                    </label>
                    <div className="text-white text-xs bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                      {mensaje.leido ? 'Sí' : 'No'}
                    </div>
                  </div>
                )}
                {mensaje.tipo && (
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Tipo
                    </label>
                    <div className="text-white text-xs bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                      {mensaje.tipo}
                    </div>
                  </div>
                )}
                {mensaje.estado && (
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">
                      Estado
                    </label>
                    <div className="text-white text-xs bg-[#1a1d23] rounded p-2 border border-[#3a3d45]">
                      {mensaje.estado}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
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
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
              >
                Eliminar Mensaje
              </button>
              <button
                onClick={onClose}
                disabled={isDeleting}
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
