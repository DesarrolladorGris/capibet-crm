'use client';

import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard', active: true },
  { id: 'funnels', icon: '🔽', label: 'Embudos', active: false },
  { id: 'chats', icon: '💬', label: 'Chats', active: false },
  { id: 'internal-chat', icon: '💭', label: 'Chat Interno', active: false },
  { id: 'emails', icon: '✉️', label: 'Emails', active: false },
  { id: 'calendar', icon: '📅', label: 'Calendario', active: false },
  { id: 'contacts', icon: '👥', label: 'Contactos', active: false },
  { id: 'sales', icon: '🛒', label: 'Ventas', active: false },
  { id: 'bulk-sends', icon: '📤', label: 'Envíos masivos', active: false },
  { id: 'config', icon: '⚙️', label: 'Configuración', active: false },
  { id: 'academy', icon: '🎓', label: 'Beast Academy', active: false },
  { id: 'plans', icon: '💎', label: 'Planes', active: false },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('funnels');

  return (
    <div className={`bg-[#1a1d23] border-r border-[#3a3d45] transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-[#3a3d45]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center">
            <div className="text-white font-bold text-sm transform -rotate-12">⚡</div>
          </div>
          {isOpen && (
            <div>
              <h1 className="text-white font-bold text-lg">BEAST</h1>
              <div className="flex items-center space-x-1">
                <div className="h-0.5 w-4 bg-[#00b894]"></div>
                <span className="text-[#00b894] text-xs font-medium">CRM</span>
                <div className="h-0.5 w-4 bg-[#00b894]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 mb-1 ${
              activeItem === item.id
                ? 'bg-[#00b894] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {isOpen && (
              <span className="font-medium text-sm">{item.label}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
