'use client';

import { useState, useEffect } from 'react';
import { embudoService, EmbUpdoResponse, EmbUpdoData } from '@/services/embudoServices';

interface EditarEmbudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmbudoUpdated: () => void;
  embudo: EmbUpdoResponse | null;
}

export default function EditarEmbudoModal({ 
  isOpen, 
  onClose, 
  onEmbudoUpdated, 
  embudo 
}: EditarEmbudoModalProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [initialNombre, setInitialNombre] = useState('');
  const [initialDescripcion, setInitialDescripcion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && embudo) {
      setNombre(embudo.nombre);
      setDescripcion(embudo.descripcion || '');
      setInitialNombre(embudo.nombre);
      setInitialDescripcion(embudo.descripcion || '');
      setError('');
    }
  }, [isOpen, embudo]);

  const hasChanges = 
    nombre.trim() !== initialNombre.trim() || 
    descripcion.trim() !== initialDescripcion.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!embudo?.id) {
      setError('ID del embudo no encontrado para la edición.');
      return;
    }
    if (!nombre.trim()) {
      setError('El nombre del embudo es obligatorio.');
      return;
    }
    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (!hasChanges) {
      setError('No hay cambios para guardar.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedData: Partial<EmbUpdoData> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
      };

      console.log('Datos del embudo a actualizar:', updatedData);

      const result = await embudoService.updateEmbudo(embudo.id, updatedData);

      if (result.success) {
        console.log('Embudo actualizado exitosamente');
        onEmbudoUpdated();
        onClose();
      } else {
        setError(result.error || 'Error al actualizar el embudo.');
      }
    } catch (err) {
      console.error('Error updating embudo:', err);
      setError('Error de conexión al actualizar el embudo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2a2d35] rounded-lg p-6 w-full max-w-md border border-[#3a3d45]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xl font-semibold">Editar Embudo</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Info del embudo */}
        {embudo && (
          <div className="mb-4 text-gray-400 text-sm border-b border-[#3a3d45] pb-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-[#00b894]">📊</span>
              <span className="text-white font-medium">Editando: {embudo.nombre}</span>
            </div>
            <div className="space-y-1 text-xs">
              <p>ID: #{embudo.id} | Espacio ID: {embudo.espacio_id}</p>
              <p>Creado: {new Date(embudo.creado_en).toLocaleDateString('es-ES')} por Usuario #{embudo.creado_por}</p>
              <p>Última actualización: {new Date(embudo.actualizado_en).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Embudo *
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded-lg text-white focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
              placeholder="Ej: Prospectos, Clientes, Ventas..."
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded-lg text-white focus:ring-2 focus:ring-[#00b894] focus:border-transparent resize-none"
              placeholder="Descripción opcional del embudo..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Indicador de cambios */}
          <div className="bg-[#1a1d23] rounded-lg p-3 border border-[#3a3d45]">
            <div className="text-sm text-gray-400">
              💡 <strong>Estado de cambios:</strong>
            </div>
            <div className="text-xs mt-2">
              {hasChanges ? (
                <span className="text-yellow-400">✏️ Hay cambios sin guardar</span>
              ) : (
                <span className="text-gray-500">✅ Sin cambios pendientes</span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <strong>Nota:</strong> Solo se pueden editar el nombre y la descripción.
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#00b894] text-white rounded-lg hover:bg-[#00a085] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isLoading || !hasChanges}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
