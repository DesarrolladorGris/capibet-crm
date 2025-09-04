'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('funnels');
  const router = useRouter();
  const pathname = usePathname();

  // Actualizar item activo basado en la ruta actual
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveItem('dashboard');
    } else if (pathname === '/dashboard/contactos') {
      setActiveItem('contacts');
    } else if (pathname === '/dashboard/configuracion') {
      setActiveItem('config');
    } else if (pathname === '/dashboard/chat-interno') {
      setActiveItem('internal-chat');
    } else if (pathname === '/dashboard/embudos') {
      setActiveItem('funnels');
    } else if (pathname === '/dashboard/emails') {
      setActiveItem('emails');
    } else if (pathname === '/dashboard/calendar') {
      setActiveItem('calendar');
    } else if (pathname === '/dashboard/actividades') {
      setActiveItem('calendar'); // Las actividades usan el mismo icono que calendario
    } else if (pathname === '/dashboard/ventas') {
      setActiveItem('sales');
    } else {
      // Por defecto dashboard para otras rutas
      setActiveItem('dashboard');
    }
  }, [pathname]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    
    // Navegar a diferentes páginas según el item
    switch (itemId) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'funnels':
        router.push('/dashboard/embudos');
        break;
      case 'contacts':
        router.push('/dashboard/contactos');
        break;
      case 'config':
        router.push('/dashboard/configuracion');
        break;
      case 'internal-chat':
        router.push('/dashboard/chat-interno');
        break;
      case 'emails':
        router.push('/dashboard/emails');
        break;
      case 'calendar':
        router.push('/dashboard/calendar');
        break;
      case 'chats':
        router.push('/dashboard/chat-interno'); // Por ahora redirige al chat interno
        break;
      case 'sales':
        router.push('/dashboard/ventas');
        break;
      case 'bulk-sends':
        router.push('/dashboard'); // Por ahora redirige al dashboard
        break;
      default:
        // Por defecto dashboard para otros items
        router.push('/dashboard');
        break;
    }
  };

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
            onClick={() => handleItemClick(item.id)}
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
