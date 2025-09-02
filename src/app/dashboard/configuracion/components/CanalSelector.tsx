'use client';

import { useState } from 'react';
import { Canal } from '@/services/supabaseService';

interface CanalOption {
  id: string;
  nombre: string;
  icon: string;
  color: string;
  tipo: Canal['tipo'];
  description: string;
}

const canalOptions: CanalOption[] = [
  { 
    id: 'whatsapp', 
    nombre: 'WhatsApp', 
    icon: '📱', 
    color: '#25D366', 
    tipo: 'whatsapp',
    description: 'WhatsApp estándar'
  },

  { 
    id: 'whatsapp_api', 
    nombre: 'Whatsapp API', 
    icon: '📱', 
    color: '#25D366', 
    tipo: 'whatsapp_api',
    description: 'Conecta WhatsApp usando API oficial'
  },
  { 
    id: 'instagram', 
    nombre: 'Instagram', 
    icon: '📷', 
    color: '#E4405F', 
    tipo: 'instagram',
    description: 'Conecta Instagram Business'
  },
  { 
    id: 'messenger', 
    nombre: 'Messenger', 
    icon: '💬', 
    color: '#0084FF', 
    tipo: 'messenger',
    description: 'Conecta Facebook Messenger'
  },
  { 
    id: 'telegram', 
    nombre: 'Telegram', 
    icon: '✈️', 
    color: '#0088CC', 
    tipo: 'telegram',
    description: 'Conecta Telegram personal'
  },
  { 
    id: 'telegram_bot', 
    nombre: 'Telegram Bot', 
    icon: '🤖', 
    color: '#0088CC', 
    tipo: 'telegram_bot',
    description: 'Conecta Telegram Bot API'
  },
  { 
    id: 'web_chat', 
    nombre: 'Web Chat', 
    icon: '💬', 
    color: '#00b894', 
    tipo: 'web_chat',
    description: 'Chat integrado en tu sitio web'
  },
  { 
    id: 'email', 
    nombre: 'Email', 
    icon: '✉️', 
    color: '#EA4335', 
    tipo: 'email',
    description: 'Conecta tu cuenta de email'
  },
];

interface CanalSelectorProps {
  onSelectCanal: (tipo: Canal['tipo']) => void;
  selectedCanal?: Canal['tipo'] | null;
  showDescriptions?: boolean;
}

export default function CanalSelector({ 
  onSelectCanal, 
  selectedCanal, 
  showDescriptions = false 
}: CanalSelectorProps) {
  const [hoveredCanal, setHoveredCanal] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {canalOptions.map((option) => {
          const isSelected = selectedCanal === option.tipo;
          const isHovered = hoveredCanal === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onSelectCanal(option.tipo)}
              onMouseEnter={() => setHoveredCanal(option.id)}
              onMouseLeave={() => setHoveredCanal(null)}
              className={`
                relative bg-[#1a1d23] border rounded-lg p-4 text-center transition-all duration-200 group
                ${isSelected 
                  ? 'border-[#00b894] bg-[#00b894] bg-opacity-10' 
                  : 'border-[#3a3d45] hover:border-[#00b894] hover:bg-[#2a2d35]'
                }
                ${isHovered ? 'transform scale-105' : ''}
              `}
            >
              {/* Icono del canal */}
              <div 
                className={`
                  text-3xl mb-3 transition-all duration-200
                  ${isSelected ? 'transform scale-110' : ''}
                `}
                style={{ color: option.color }}
              >
                {option.icon}
              </div>
              
              {/* Nombre del canal */}
              <div className={`
                font-medium text-sm transition-colors duration-200
                ${isSelected ? 'text-[#00b894]' : 'text-white'}
              `}>
                {option.nombre}
              </div>
              
              {/* Descripción (opcional) */}
              {showDescriptions && (
                <div className="text-gray-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {option.description}
                </div>
              )}
              
              {/* Indicador de selección */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-[#00b894] rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
              
              {/* Efecto de brillo en hover */}
              {isHovered && !isSelected && (
                <div 
                  className="absolute inset-0 rounded-lg opacity-20"
                  style={{ 
                    background: `radial-gradient(circle at center, ${option.color} 0%, transparent 70%)` 
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Información adicional */}
      <div className="text-center text-gray-400 text-sm">
        <p>Selecciona el tipo de canal que deseas configurar</p>
        <p className="text-xs mt-1">Cada canal tiene configuraciones específicas</p>
      </div>
    </div>
  );
}
