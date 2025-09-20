'use client';

import { X, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface Usuario {
  id: number;
  nombre_usuario: string;
  correo_electronico: string;
}

interface NuevoChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: () => void;
  currentUserId: number;
}

const NuevoChatModal = ({ isOpen, onClose, onChatCreated, currentUserId }: NuevoChatModalProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<number | null>(null);
  const [tema, setTema] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadUsuarios();
    }
  }, [isOpen]);

  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const result = await supabaseService.getAllUsuarios();
      if (result.success) {
        // Filtrar el usuario actual de la lista
        const usuariosFiltrados = result.data.filter((user: Usuario) => user.id !== currentUserId);
        setUsuarios(usuariosFiltrados);
      } else {
        console.error('Error al cargar usuarios:', result.error);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUsuarioId || !tema.trim()) {
      alert('Por favor selecciona un usuario y especifica un tema');
      return;
    }

    setLoading(true);
    try {
      const result = await supabaseService.createChatInternoUsuario(
        currentUserId,
        selectedUsuarioId,
        tema.trim()
      );

      if (result.success) {
        console.log('✅ Chat interno creado exitosamente');
        onChatCreated();
        onClose();
        // Reset form
        setSelectedUsuarioId(null);
        setTema('');
      } else {
        console.error('❌ Error al crear chat interno:', result.error);
        alert('Error al crear el chat interno. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al crear chat interno:', error);
      alert('Error inesperado al crear el chat interno');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedUsuarioId(null);
      setTema('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Nuevo Chat Interno
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Usuario */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Seleccionar Usuario
            </label>
            {loadingUsuarios ? (
              <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-muted)]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent-primary)]"></div>
                  <span>Cargando usuarios...</span>
                </div>
              </div>
            ) : (
              <select
                value={selectedUsuarioId || ''}
                onChange={(e) => setSelectedUsuarioId(parseInt(e.target.value))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                required
              >
                <option value="">Selecciona un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre_usuario} ({usuario.correo_electronico})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campo de Tema */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Tema del Chat
            </label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej: MORA, Consulta técnica, Reunión de seguimiento..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUsuarioId || !tema.trim()}
              className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Creando...' : 'Crear Chat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoChatModal;
