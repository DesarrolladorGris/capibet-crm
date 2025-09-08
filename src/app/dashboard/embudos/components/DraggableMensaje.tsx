'use client';

import { useDraggable } from '@dnd-kit/core';
import { MensajeResponse } from '@/services/supabaseService';

interface DraggableMensajeProps {
  mensaje: MensajeResponse;
  onMensajeClick: (mensaje: MensajeResponse) => void;
}

export default function DraggableMensaje({ mensaje, onMensajeClick }: DraggableMensajeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `mensaje-${mensaje.id}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🖱️ Doble click en mensaje:', mensaje.id);
    onMensajeClick(mensaje);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        zIndex: isDragging ? 9999 : 'auto',
      }}
      className={`bg-[#1a1d23] rounded p-2 border border-[#3a3d45] hover:border-[#00b894] transition-colors cursor-grab active:cursor-grabbing group relative ${
        isDragging ? 'opacity-75 shadow-2xl rotate-2 scale-110 border-[#00b894]' : ''
      }`}
      {...attributes}
      {...listeners}
      onDoubleClick={handleDoubleClick}
      title="Arrastra para mover • Doble click para ver detalles"
    >
      {/* Contenido del mensaje */}
      <div className="text-white text-xs font-medium mb-1 line-clamp-2">
        {mensaje.contenido}
      </div>
      <div className="text-gray-400 text-xs">
        ID: {mensaje.id} • {new Date(mensaje.creado_en).toLocaleDateString('es-ES')}
      </div>

      {/* Botón para ver detalles (separado del drag) */}
      <button
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 rounded"
        onClick={(e) => {
          e.stopPropagation();
          console.log('👁️ Click en botón ver detalles:', mensaje.id);
          onMensajeClick(mensaje);
        }}
        title="Click para ver detalles • También puedes hacer doble click"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>

      {/* Indicador visual durante el arrastre */}
      {isDragging && (
        <div className="absolute top-1 left-1 text-[#00b894] text-xs animate-bounce">
          📤
        </div>
      )}
    </div>
  );
}
