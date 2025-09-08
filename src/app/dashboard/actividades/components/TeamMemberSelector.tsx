'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface TeamMemberSelectorProps {
  selectedMembers: string[];
  onMembersChange: (memberIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
}

export default function TeamMemberSelector({ 
  selectedMembers, 
  onMembersChange, 
  multiple = true,
  placeholder = "Seleccionar miembros del equipo"
}: TeamMemberSelectorProps) {
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos simulados del equipo - en el futuro vendrán de la base de datos
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@capibet.com', role: 'comercial' },
    { id: '2', name: 'María García', email: 'maria@capibet.com', role: 'supervisor' },
    { id: '3', name: 'Carlos López', email: 'carlos@capibet.com', role: 'comercial' },
    { id: '4', name: 'Ana Martínez', email: 'ana@capibet.com', role: 'comercial' },
    { id: '5', name: 'Luis Rodríguez', email: 'luis@capibet.com', role: 'comercial' },
    { id: '6', name: 'Carmen Sánchez', email: 'carmen@capibet.com', role: 'admin' },
  ];

  // Filtrar miembros según permisos del usuario
  const availableMembers = teamMembers.filter(member => {
    // Admin puede ver y asignar a todos
    if (user?.role === 'admin') return true;
    
    // Supervisor puede ver y asignar a comerciales
    if (user?.role === 'supervisor') {
      return member.role === 'comercial' || member.id === user.id;
    }
    
    // Comercial solo puede verse a sí mismo
    return member.id === user?.id;
  });

  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (memberId: string) => {
    if (multiple) {
      const newSelection = selectedMembers.includes(memberId)
        ? selectedMembers.filter(id => id !== memberId)
        : [...selectedMembers, memberId];
      onMembersChange(newSelection);
    } else {
      onMembersChange([memberId]);
      setIsOpen(false);
    }
  };

  const getSelectedMembersText = () => {
    if (selectedMembers.length === 0) return placeholder;
    
    const selected = availableMembers.filter(member => 
      selectedMembers.includes(member.id)
    );
    
    if (selected.length === 1) return selected[0].name;
    if (selected.length === 2) return `${selected[0].name} y ${selected[1].name}`;
    return `${selected[0].name} y ${selected.length - 1} más`;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'supervisor': return '👔';
      case 'comercial': return '💼';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'supervisor': return 'text-blue-400';
      case 'comercial': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="relative">
      {/* Botón selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-left text-white hover:border-[#00b894] transition-colors"
      >
        <span className={selectedMembers.length === 0 ? 'text-gray-400' : 'text-white'}>
          {getSelectedMembersText()}
        </span>
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#2a2d35] border border-[#3a3d45] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Barra de búsqueda */}
          <div className="p-3 border-b border-[#3a3d45]">
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Lista de miembros */}
          <div className="py-2">
            {filteredMembers.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No se encontraron miembros
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="px-3 py-2 hover:bg-[#3a3d45] cursor-pointer transition-colors"
                  onClick={() => handleMemberToggle(member.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.avatar || member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{member.name}</div>
                        <div className="text-gray-400 text-xs">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${getRoleColor(member.role)}`}>
                        {getRoleIcon(member.role)} {member.role}
                      </span>
                      {selectedMembers.includes(member.id) && (
                        <span className="text-[#00b894]">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Información de permisos */}
          {!hasPermission('assign_tasks') && user?.role === 'comercial' && (
            <div className="px-3 py-2 bg-yellow-500 bg-opacity-20 border-t border-[#3a3d45]">
              <p className="text-yellow-400 text-xs">
                Solo puedes asignarte tareas a ti mismo
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
