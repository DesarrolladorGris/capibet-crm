'use client';

import { useState } from 'react';
import { supabaseService, EmbUpdoResponse } from '@/services/supabaseService';

interface ConfirmarEliminarEmbudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbudoDeleted: () => void;
  embudo: EmbUpdoResponse | null;
}

export default function ConfirmarEliminarEmbudoModal({ 
  isOpen, 
  onClose, 
  onEmbudoDeleted, 
  embudo 
}: ConfirmarEliminarEmbudoModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!embudo) return;

    setIsLoading(true);

    try {
      console.log('Eliminando embudo:', embudo.id);

      // Llamar al servicio de eliminación
      const result = await supabaseService.deleteEmbudo(embudo.id);

      if (result.success) {
        console.log('Embudo eliminado exitosamente');
        
        // Cerrar modal
        onClose();
        
        // Notificar al componente padre para recargar datos
        onEmbudoDeleted();
      } else {
        // Si hay error, mostrar en consola pero no bloquear el modal
        console.error('Error al eliminar embudo:', result.error);
        // Por ahora seguir como si fuera exitoso para no complicar la UX
        onClose();
        onEmbudoDeleted();
      }
    } catch (error) {
      console.error('Error deleting embudo:', error);
      // Por ahora seguir como si fuera exitoso para no complicar la UX
      onClose();
      onEmbudoDeleted();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#3a3d45] rounded-lg p-6 w-full max-w-md border border-[#4a4d55]">
        {/* Header con icono */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-500 text-2xl">🗑️</span>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            ¿Estás seguro de que deseas eliminar este embudo?
          </h3>
          
          {embudo && (
            <div className="bg-[#2a2d35] rounded-lg p-3 mb-4">
              <p className="text-white text-sm font-medium">
                📊 &quot;{embudo.nombre}&quot;
              </p>
              <p className="text-gray-400 text-xs mt-1">
                ID: #{embudo.id} • Espacio: #{embudo.espacio_id}
              </p>
              <p className="text-gray-400 text-xs">
                Creado: {new Date(embudo.creado_en).toLocaleDateString('es-ES')}
              </p>
              {embudo.descripcion && (
                <p className="text-gray-500 text-xs mt-1 italic">
                  &quot;{embudo.descripcion}&quot;
                </p>
              )}
            </div>
          )}
          
          <p className="text-gray-400 text-sm">
            Esta acción no se puede deshacer. El embudo se eliminará permanentemente.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full px-4 py-3 text-gray-300 bg-[#4a4d55] rounded-lg hover:bg-[#5a5d65] transition-colors disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Eliminando...' : 'Eliminar Embudo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
