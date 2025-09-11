'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmbUpdoResponse } from '@/services/supabaseService';

interface DraggableEmbudoProps {
  embudo: EmbUpdoResponse;
  onEdit: (embudo: EmbUpdoResponse) => void;
  onDelete: (embudo: EmbUpdoResponse) => void;
  formatDate: (dateString: string) => string;
}

export default function DraggableEmbudo({ embudo, onEdit, onDelete, formatDate }: DraggableEmbudoProps) {
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
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 hover:border-[var(--accent-primary)] transition-colors group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-2xl rotate-2 scale-105 border-[var(--accent-primary)]' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Indicador de drag */}
          <div className="flex flex-col space-y-1 text-[var(--text-muted)] mr-2">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <span className="text-[var(--text-muted)] text-sm font-medium">
            {embudo.orden || 0}
          </span>
          <span className="text-[var(--text-primary)] text-sm font-medium">
            {embudo.nombre.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(embudo);
            }}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs p-1" 
            title="Editar embudo"
          >
            ✏️
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(embudo);
            }}
            className="text-[var(--text-muted)] hover:text-red-400 text-xs p-1" 
            title="Eliminar embudo"
          >
            🗑️
          </button>
        </div>
      </div>
      {embudo.descripcion && (
        <p className="text-[var(--text-muted)] text-xs mb-2">{embudo.descripcion}</p>
      )}
      <div className="text-xs text-[var(--text-muted)]">
        ID: {embudo.id} • {formatDate(embudo.creado_en)}
      </div>
    </div>
  );
}
