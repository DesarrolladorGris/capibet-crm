'use client';

import { useState } from 'react';
import UserInfo from './UserInfo';

interface HeaderProps {
  userName: string;
  userRole: string;
  agencyName: string;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export default function Header({ userName, userRole, agencyName, onLogout, onMenuToggle }: HeaderProps) {
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

          {/* Page Title */}
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-lg">Ventas</span>
            <div className="flex items-center space-x-1 bg-[#2a2d35] px-2 py-1 rounded">
              <span className="text-[#00b894] text-sm">🔗</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-4 ml-8">
            <button className="text-white font-medium px-3 py-1 bg-[#2a2d35] rounded text-sm">
              Todos
            </button>
            <button className="text-gray-400 hover:text-white font-medium px-3 py-1 hover:bg-[#2a2d35] rounded text-sm">
              Mis Chats
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Action Buttons */}
          <button className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-sm">Editar Embudo</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">Actualizar</span>
          </button>

          <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            + Nuevo Mensaje
          </button>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 pl-9 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] w-48"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter */}
          <button className="text-gray-400 hover:text-white p-2 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="text-gray-400 hover:text-white p-2 rounded relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-white bg-[#2a2d35] px-3 py-2 rounded hover:bg-[#3a3d45]"
            >
              <UserInfo 
                userName={userName} 
                userRole={userRole} 
                agencyName={agencyName}
              />
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2a2d35] border border-[#3a3d45] rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-gray-400 hover:text-white hover:bg-[#3a3d45] rounded text-sm"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
