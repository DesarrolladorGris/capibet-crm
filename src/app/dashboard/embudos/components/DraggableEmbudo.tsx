'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmbUpdoResponse, MensajeResponse } from '@/services/supabaseService';

interface DraggableEmbudoProps {
  embudo: EmbUpdoResponse;
  index: number;
  mensajes: MensajeResponse[];
  onEdit: (embudo: EmbUpdoResponse) => void;
  onDelete: (embudo: EmbUpdoResponse) => void;
  onMensajeClick: (mensaje: MensajeResponse) => void;
}

export default function DraggableEmbudo({ embudo, index, mensajes, onEdit, onDelete, onMensajeClick }: DraggableEmbudoProps) {
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
      className={`bg-[#1a1d23] border-2 border-[#ff8c00] rounded-lg p-4 hover:border-[#00b894] transition-colors group relative flex flex-col h-full min-h-80 ${
        isDragging ? 'shadow-2xl rotate-3 scale-105' : ''
      }`}
    >
      {/* Header del embudo */}
      <div 
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
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
            <span className="text-gray-300 text-xs font-medium">
              {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-gray-500 text-xs">📊</div>
        </div>
        
        {/* Área principal para mensajes */}
        <div className="flex-1 p-4">
          {mensajes.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mensajes.slice(0, 5).map((mensaje) => (
                <div 
                  key={mensaje.id} 
                  onClick={() => {
                    console.log('Click en mensaje:', mensaje.id);
                    onMensajeClick(mensaje);
                  }}
                  className="bg-[#1a1d23] rounded p-2 border border-[#3a3d45] hover:border-[#00b894] transition-colors cursor-pointer"
                >
                  <div className="text-white text-xs font-medium mb-1 line-clamp-2">
                    {mensaje.contenido}
                  </div>
                  <div className="text-gray-400 text-xs">
                    ID: {mensaje.id} • {new Date(mensaje.creado_en).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
              {mensajes.length > 5 && (
                <div className="text-center text-gray-400 text-xs py-2">
                  +{mensajes.length - 5} mensajes más
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-500 text-3xl mb-3">💬</div>
                <div className="text-gray-400 text-sm mb-2">Sin mensajes</div>
                <div className="text-gray-500 text-xs">Los mensajes aparecerán aquí</div>
              </div>
            </div>
          )}
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
