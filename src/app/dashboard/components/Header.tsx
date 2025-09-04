'use client';

import { useState } from 'react';

interface HeaderProps {
  userEmail: string;
  userName: string;
  userRole: string;
  agencyName: string;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export default function Header({ userEmail, userName, userRole, agencyName, onLogout, onMenuToggle }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-white text-sm font-medium">{userName || userEmail}</div>
              <div className="text-gray-400 text-xs">{agencyName}</div>
            </div>
            
            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-[#00b894] rounded-full flex items-center justify-center text-white font-medium text-sm hover:bg-[#00a085] transition-colors"
              >
                {userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
              </button>
              
              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2a2d35] border border-[#3a3d45] rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-[#3a3d45]">
                      <div className="font-medium text-white">{userName || userEmail}</div>
                      <div className="text-xs">{userRole}</div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#3a3d45] transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
