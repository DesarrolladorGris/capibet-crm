'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmbUpdoResponse } from '@/services/embudoServices';
import { Edit, Trash2 } from 'lucide-react';

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
      className={`bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4 hover:border-[#00b894] transition-colors group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-2xl rotate-2 scale-105 border-[#00b894]' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {/* Indicador de drag */}
          <div className="flex flex-col space-y-1 text-gray-500 mr-2">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <span className="text-gray-400 text-sm font-medium">
            {embudo.orden || 0}
          </span>
          <span className="text-white text-sm font-medium">
            {embudo.nombre.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(embudo);
            }}
            className="text-gray-400 hover:text-white text-xs p-1" 
            title="Editar embudo"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(embudo);
            }}
            className="text-gray-400 hover:text-red-400 text-xs p-1" 
            title="Eliminar embudo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {embudo.descripcion && (
        <p className="text-gray-400 text-xs mb-2">{embudo.descripcion}</p>
      )}
      <div className="text-xs text-gray-500">
        ID: {embudo.id} • {formatDate(embudo.creado_en)}
      </div>
    </div>
  );
}
