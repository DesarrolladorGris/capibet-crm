'use client';

import { useDroppable } from '@dnd-kit/core';
import { MensajeResponse } from '@/services/mensajesServices';
import { EmbUpdoResponse } from '@/services/embudoServices';
import DraggableMensaje from './DraggableMensaje';
import { MessageCircle, BarChart3, Edit, Trash2 } from 'lucide-react';

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
      className={`bg-[#1a1d23] border-2 border-[#ff8c00] rounded-lg p-4 hover:border-[#00b894] transition-colors group relative flex flex-col h-full min-h-80 ${
        isOver ? 'border-[#00b894] bg-[#00b894]/10' : ''
      }`}
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

      {/* Descripción */}
      {embudo.descripcion && (
        <p className="text-gray-400 text-xs mb-3">{embudo.descripcion}</p>
      )}

      {/* Área de contenido del embudo - Más alta para futuros chats */}
      <div className={`flex-1 min-h-64 bg-[#2a2d35] rounded border border-[#3a3d45] flex flex-col relative ${
        isOver ? 'ring-2 ring-[#00b894] ring-opacity-75' : ''
      }`}>
        {/* Indicador visual de drop zone */}
        {isOver && (
          <div className="absolute inset-0 bg-[#00b894]/20 rounded flex items-center justify-center z-10 pointer-events-none">
            <div className="text-[#00b894] text-lg font-bold">
              📥 Soltar mensaje aquí
            </div>
          </div>
        )}
        
        {/* Header del área de contenido */}
        <div className="p-3 border-b border-[#3a3d45] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-gray-300 text-xs font-medium">
              {mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-gray-500 text-xs">
            <BarChart3 className="w-3 h-3" />
          </div>
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
                <div className="text-gray-500 text-xs">Arrastra mensajes aquí o crea nuevos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información */}
      <div className="text-xs text-gray-500 mt-3">
        ID: {embudo.id} • {new Date(embudo.creado_en).toLocaleDateString('es-ES')}
      </div>

    </div>
  );
}
