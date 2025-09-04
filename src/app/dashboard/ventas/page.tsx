'use client';

import { useState } from 'react';
import VentasTabs from './components/VentasTabs';

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState('ventas');

  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Módulo de Ventas */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-semibold text-2xl">Ventas</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
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

            {/* Productos Count */}
            <div className="flex items-center space-x-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-sm">Productos</span>
              <div className="bg-[#00b894] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">00</div>
            </div>

            {/* Configuración */}
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Configuración</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('ventas')}
            className={`font-medium px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'ventas' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Ventas
          </button>
          <button 
            onClick={() => setActiveTab('productos')}
            className={`font-medium px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'productos' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('configuracion')}
            className={`font-medium px-4 py-2 rounded text-sm transition-colors ${
              activeTab === 'configuracion' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Configuración
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#1a1d23] p-6">
        <VentasTabs activeTab={activeTab} />
      </div>
    </div>
  );
}
