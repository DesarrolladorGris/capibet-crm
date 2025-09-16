'use client';

import { useDroppable } from '@dnd-kit/core';
import { Edit2, Trash2, MessageCircle, BarChart3 } from 'lucide-react';
import { EmbUpdoResponse, MensajeResponse } from '@/services/supabaseService';
import DraggableMensaje from './DraggableMensaje';

interface DraggableEmbudoProps {
  embudo: EmbUpdoResponse;
  index: number;
  mensajes: MensajeResponse[];
  onEdit: (embudo: EmbUpdoResponse) => void;
  onDelete: (embudo: EmbUpdoResponse) => void;
  onMensajeClick: (mensaje: MensajeResponse) => void;
  onMensajeMoved?: (mensajeId: number, nuevoEmbudoId: number) => void;
}

export default function DraggableEmbudo({ embudo, index, mensajes, onEdit, onDelete, onMensajeClick, onMensajeMoved }: DraggableEmbudoProps) {
  // Hacer el embudo droppable para mensajes
  const { setNodeRef, isOver } = useDroppable({
    id: `embudo-drop-${embudo.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-[var(--bg-primary)] border-2 border-[#ff8c00] rounded-lg p-4 hover:border-[var(--accent-primary)] transition-colors group relative flex flex-col h-full min-h-80 ${
        isOver ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : ''
      }`}
    >
      {/* Header del embudo */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-[var(--text-muted)] text-sm font-medium">
            {index}
          </span>
          <span className="text-[var(--text-primary)] text-sm font-medium">
            {embudo.nombre.toUpperCase()}
          </span>
        </div>
        <div 
          className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()} // Prevenir que el drag se active al hacer click en los botones
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(embudo);
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs p-1" 
            title="Editar embudo"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(embudo);
            }}
            className="text-[var(--text-muted)] hover:text-[var(--error)] text-xs p-1" 
            title="Eliminar embudo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Descripción */}
      {embudo.descripcion && (
        <p className="text-[var(--text-muted)] text-xs mb-3">{embudo.descripcion}</p>
      )}

      {/* Área de contenido del embudo - Más alta para futuros chats */}
      <div className={`flex-1 min-h-64 bg-[var(--bg-secondary)] rounded border border-[var(--border-primary)] flex flex-col relative ${
        isOver ? 'ring-2 ring-[var(--accent-primary)] ring-opacity-75' : ''
      }`}>
        {/* Indicador visual de drop zone */}
        {isOver && (
          <div className="absolute inset-0 bg-[var(--accent-primary)]/20 rounded flex items-center justify-center z-10 pointer-events-none">
            <div className="text-[var(--accent-primary)] text-lg font-bold">
              📥 Soltar mensaje aquí
            </div>
          </div>
        )}
        
        {/* Header del área de contenido */}
        <div className="p-3 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[var(--text-muted)] text-xs"><MessageCircle className="w-4 h-4" /></span>
            <span className="text-[var(--text-secondary)] text-xs font-medium">
              {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-[var(--text-muted)] text-xs"><BarChart3 className="w-4 h-4" /></div>
        </div>
        
        {/* Área principal para mensajes */}
        <div className="flex-1 p-4">
          {mensajes.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mensajes.slice(0, 5).map((mensaje) => (
                <DraggableMensaje
                  key={mensaje.id}
                  mensaje={mensaje}
                  onMensajeClick={onMensajeClick}
                />
              ))}
              {mensajes.length > 5 && (
                <div className="text-center text-[var(--text-muted)] text-xs py-2">
                  +{mensajes.length - 5} mensajes más
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-[var(--text-muted)] text-3xl mb-3"><MessageCircle className="w-4 h-4" /></div>
                <div className="text-[var(--text-muted)] text-sm mb-2">Sin mensajes</div>
                <div className="text-[var(--text-muted)] text-xs">Arrastra mensajes aquí o crea nuevos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información */}
      <div className="text-xs text-[var(--text-muted)] mt-3">
        ID: {embudo.id} • {new Date(embudo.creado_en).toLocaleDateString('es-ES')}
      </div>

    </div>
  );
}
