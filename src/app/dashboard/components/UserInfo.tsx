'use client';

import { Crown, Briefcase, User, Building } from 'lucide-react';

interface UserInfoProps {
  userName: string;
  userRole: string;
  agencyName: string;
}

export default function UserInfo({ userName, userRole, agencyName }: UserInfoProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'supervisor': return Briefcase;
      case 'comercial': return User;
      default: return Building;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'supervisor': return 'bg-blue-500';
      case 'comercial': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'comercial': return 'Comercial';
      default: return role;
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right">
        <div className="text-white font-medium">{userName}</div>
        <div className="text-gray-400 text-sm">{agencyName}</div>
      </div>
      <div className={`${getRoleColor(userRole)} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1`}>
        {(() => {
          const IconComponent = getRoleIcon(userRole);
          return <IconComponent className="w-3 h-3" />;
        })()}
        <span>{getRoleLabel(userRole)}</span>
      </div>
    </div>
  );
}

