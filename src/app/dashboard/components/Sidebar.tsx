'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Funnel, MessageCircle, MessageSquare, Mail, Calendar, Users, ShoppingCart, Send, Settings, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  requiredRoles?: string[]; // Roles que pueden ver este item
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard', active: true },
  { id: 'funnels', icon: <Funnel className="w-5 h-5" />, label: 'Embudos', active: false },
  { id: 'chats', icon: <MessageCircle className="w-5 h-5" />, label: 'Chats', active: false },
  { id: 'internal-chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat Interno', active: false },
  { id: 'emails', icon: <Mail className="w-5 h-5" />, label: 'Emails', active: false },
  { id: 'calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendario', active: false },
  { id: 'contacts', icon: <Users className="w-5 h-5" />, label: 'Contactos', active: false, requiredRoles: ['admin'] },
  { id: 'sales', icon: <ShoppingCart className="w-5 h-5" />, label: 'Ventas', active: false },
  { id: 'bulk-sends', icon: <Send className="w-5 h-5" />, label: 'Envíos masivos', active: false },
  { id: 'config', icon: <Settings className="w-5 h-5" />, label: 'Configuración', active: false, requiredRoles: ['admin'] },
  { id: 'academy', icon: <GraduationCap className="w-5 h-5" />, label: 'CAPIBET Academy', active: false, requiredRoles: ['admin'] },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('funnels');
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Función para verificar si el usuario tiene permisos para ver un item
  const hasPermission = (item: MenuItem): boolean => {
    // Si no hay requiredRoles definido, todos pueden ver el item
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    
    // Si no hay usuario logueado, no mostrar items restringidos
    if (!user) {
      return false;
    }
    
    // Verificar si el rol del usuario está en la lista de roles permitidos
    return item.requiredRoles.includes(user.rol);
  };

  // Filtrar items del menú basándose en permisos
  const visibleMenuItems = menuItems.filter(hasPermission);

  // Actualizar item activo basado en la ruta actual
  useEffect(() => {
    if (pathname === '/dashboard') {
      setActiveItem('dashboard');
    } else if (pathname === '/dashboard/contactos') {
      setActiveItem('contacts');
    } else if (pathname === '/dashboard/configuracion') {
      setActiveItem('config');
    } else if (pathname === '/dashboard/academy') {
      setActiveItem('academy');
    } else if (pathname === '/dashboard/chat-interno') {
      setActiveItem('internal-chat');
    } else if (pathname === '/dashboard/embudos') {
      setActiveItem('funnels');
    } else if (pathname === '/dashboard/emails') {
      setActiveItem('emails');
    } else if (pathname === '/dashboard/calendario') {
      setActiveItem('calendar');
    } else if (pathname === '/dashboard/ventas') {
      setActiveItem('sales');
    } else if (pathname === '/dashboard/envios-masivos') {
      setActiveItem('bulk-sends');
    } else if (pathname === '/dashboard/chats') {
      setActiveItem('chats');
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
      case 'academy':
        router.push('/dashboard/academy');
        break;
      case 'internal-chat':
        router.push('/dashboard/chat-interno');
        break;
      case 'emails':
        router.push('/dashboard/emails');
        break;
      case 'calendar':
        router.push('/dashboard/calendario');
        break;
      case 'sales':
        router.push('/dashboard/ventas');
        break;
      case 'bulk-sends':
        router.push('/dashboard/envios-masivos');
        break;
      case 'chats':
        router.push('/dashboard/chats');
        break;
      // Agregar más rutas según sea necesario
      default:
        // Por ahora mantener en dashboard para otros items
        break;
    }
  };

  return (
    <div className={`bg-[var(--bg-primary)] border-r border-[var(--border-primary)] transition-all duration-300 flex-shrink-0 ${isOpen ? 'w-64 min-w-64' : 'w-16 min-w-16'}`}>
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://pbs.twimg.com/profile_images/1118644090420322304/5SFmHCl-_400x400.jpg" 
              alt="CAPIBET Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-[var(--text-primary)] font-bold text-lg">CAPIBET</h1>
              <div className="flex items-center space-x-1">
                <div className="h-0.5 w-4 bg-[#F29A1F]"></div>
                <span className="text-[#F29A1F] text-xs font-medium">CRM</span>
                <div className="h-0.5 w-4 bg-[#F29A1F]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-2">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-200 mb-1 cursor-pointer ${
              activeItem === item.id
                ? 'bg-[#F29A1F] text-white'
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
