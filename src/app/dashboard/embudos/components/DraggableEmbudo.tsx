'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmbUpdoResponse } from '@/services/supabaseService';

interface DraggableEmbudoProps {
  embudo: EmbUpdoResponse;
  index: number;
  onEdit: (embudo: EmbUpdoResponse) => void;
  onDelete: (embudo: EmbUpdoResponse) => void;
}

export default function DraggableEmbudo({ embudo, index, onEdit, onDelete }: DraggableEmbudoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: embudo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#1a1d23] border-2 border-[#ff8c00] rounded-lg p-4 hover:border-[#00b894] transition-colors group relative cursor-grab active:cursor-grabbing flex flex-col h-full min-h-80 ${
        isDragging ? 'shadow-2xl rotate-3 scale-105' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Header del embudo */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm font-medium">
            {index}
          </span>
          <span className="text-white text-sm font-medium">
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
            className="text-gray-400 hover:text-white text-xs p-1" 
            title="Editar embudo"
          >
            ✏️
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(embudo);
            }}
            className="text-gray-400 hover:text-red-400 text-xs p-1" 
            title="Eliminar embudo"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Descripción */}
      {embudo.descripcion && (
        <p className="text-gray-400 text-xs mb-3">{embudo.descripcion}</p>
      )}

      {/* Área de contenido del embudo - Más alta para futuros chats */}
      <div className="flex-1 min-h-64 bg-[#2a2d35] rounded border border-[#3a3d45] flex flex-col">
        {/* Header del área de contenido */}
        <div className="p-3 border-b border-[#3a3d45] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-xs">💬</span>
            <span className="text-gray-300 text-xs font-medium">0 chats</span>
          </div>
          <div className="text-gray-500 text-xs">📊</div>
        </div>
        
        {/* Área principal para chats */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-3xl mb-3">💬</div>
            <div className="text-gray-400 text-sm mb-2">Arrastra un chat aquí</div>
            <div className="text-gray-500 text-xs">Los chats aparecerán aquí</div>
          </div>
        </div>
      </div>

      {/* Footer con información */}
      <div className="text-xs text-gray-500 mt-3">
        ID: {embudo.id} • {new Date(embudo.creado_en).toLocaleDateString('es-ES')}
      </div>

      {/* Indicador visual de arrastre */}
      {isDragging && (
        <div className="absolute top-2 right-2 text-[#00b894] text-lg animate-bounce">
          🔄
        </div>
      )}
    </div>
  );
}
