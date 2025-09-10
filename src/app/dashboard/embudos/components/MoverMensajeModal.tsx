'use client';

import { useState, useEffect } from 'react';
import { mensajesService, MensajeResponse } from '@/services/mensajesServices';
import { EmbUpdoResponse } from '@/services/embudoServices';

interface MoverMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mensaje: MensajeResponse | null;
  embudos: EmbUpdoResponse[];
  onMensajeMoved: (mensajeId: number, nuevoEmbudoId: number) => void;
}

export default function MoverMensajeModal({ 
  isOpen, 
  onClose, 
  mensaje,
  embudos,
  onMensajeMoved
}: MoverMensajeModalProps) {
  const [selectedEmbudoId, setSelectedEmbudoId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar embudos para excluir el embudo actual del mensaje
  const embudosDisponibles = embudos.filter(embudo => embudo.id !== mensaje?.embudo_id);

  useEffect(() => {
    if (isOpen && mensaje) {
      setSelectedEmbudoId(0);
      setError(null);
    }
  }, [isOpen, mensaje]);

  const handleMove = async () => {
    if (!mensaje || !selectedEmbudoId) {
      setError('Debe seleccionar un embudo destino');
      return;
    }

    if (selectedEmbudoId === mensaje.embudo_id) {
      setError('El mensaje ya está en este embudo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Moviendo mensaje:', mensaje.id, 'al embudo:', selectedEmbudoId);

      const result = await mensajesService.moveMensajeToEmbudo(mensaje.id, selectedEmbudoId);

      if (result.success) {
        console.log('Mensaje movido exitosamente');
        onMensajeMoved(mensaje.id, selectedEmbudoId);
        onClose();
      } else {
        setError(result.error || 'Error al mover el mensaje');
      }
    } catch (error) {
      console.error('Error inesperado al mover mensaje:', error);
      setError('Error inesperado al mover el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedEmbudoId(0);
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !mensaje) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold">Mover Mensaje</h2>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información del mensaje actual */}
          <div className="bg-[#1a1d23] rounded-lg p-4 border border-[#3a3d45]">
            <h3 className="text-white text-sm font-medium mb-2">Mensaje a mover:</h3>
            <div className="text-gray-300 text-sm mb-2 line-clamp-2">
              {mensaje.contenido}
            </div>
            <div className="text-gray-400 text-xs">
              ID: {mensaje.id} • Embudo actual: {embudos.find(e => e.id === mensaje.embudo_id)?.nombre || 'Desconocido'}
            </div>
          </div>

          {/* Selector de embudo destino */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Mover a embudo:
            </label>
            <select
              value={selectedEmbudoId}
              onChange={(e) => setSelectedEmbudoId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
              disabled={isLoading}
            >
              <option value={0}>Seleccionar embudo destino</option>
              {embudosDisponibles.map((embudo) => (
                <option key={embudo.id} value={embudo.id}>
                  {embudo.nombre}
                  {embudo.descripcion && ` - ${embudo.descripcion}`}
                </option>
              ))}
            </select>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Información adicional */}
          {embudosDisponibles.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-yellow-400 text-sm">
              No hay otros embudos disponibles para mover este mensaje.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-[#3a3d45]">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="bg-[#3a3d45] hover:bg-[#4a4d55] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleMove}
            disabled={isLoading || !selectedEmbudoId || embudosDisponibles.length === 0}
            className="bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Moviendo...' : 'Mover Mensaje'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
