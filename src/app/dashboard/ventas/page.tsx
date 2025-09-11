'use client';

import { useState } from 'react';
import VentasTabs from './components/VentasTabs';

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState('ventas');

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header compacto estilo Beast CRM */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold text-xl">Ventas</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>•</span>
              <span>Gestión de ventas</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar ventas..."
                className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-1.5 pl-8 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00b894] focus:border-[#00b894] w-48 text-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
              + Nueva Venta
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs compactas */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-2">
        <div className="flex space-x-1">
          <button 
            onClick={() => setActiveTab('ventas')}
            className={`font-medium px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'ventas' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Ventas
          </button>
          <button 
            onClick={() => setActiveTab('productos')}
            className={`font-medium px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'productos' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('configuracion')}
            className={`font-medium px-3 py-1.5 rounded text-sm transition-colors ${
              activeTab === 'configuracion' 
                ? 'text-white bg-[#00b894]' 
                : 'text-gray-400 hover:text-white hover:bg-[#2a2d35]'
            }`}
          >
            Configuración
          </button>
        </div>
      </div>

      {/* Layout de 3 columnas estilo Beast CRM */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda - Lista compacta */}
        <div className="w-1/3 border-r border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-3">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45] hover:border-[#00b894] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium text-sm">Venta #{1000 + i}</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-400 text-xs">Completada</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-300 text-sm">Cliente {i}</div>
                    <div className="text-white font-semibold text-lg">${(1000 + i * 100).toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">2024-01-{20 + i}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna central - Vista detallada */}
        <div className="flex-1 bg-[#1a1d23] overflow-y-auto">
          <VentasTabs activeTab={activeTab} />
        </div>

        {/* Columna derecha - Panel lateral */}
        <div className="w-80 border-l border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-medium mb-4">Filtros</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Estado</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todas las ventas</option>
                  <option>Completadas</option>
                  <option>Pendientes</option>
                  <option>Canceladas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Período</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                  <option>Este mes</option>
                  <option>Este año</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Vendedor</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los vendedores</option>
                  <option>Ana Gómez</option>
                  <option>Carlos López</option>
                  <option>María Rodríguez</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Ventas del Mes</div>
                  <div className="text-white text-2xl font-bold">$125,430</div>
                  <div className="text-green-400 text-xs">+15.2%</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Transacciones</div>
                  <div className="text-white text-2xl font-bold">247</div>
                  <div className="text-blue-400 text-xs">+8</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Ticket Promedio</div>
                  <div className="text-white text-2xl font-bold">$508</div>
                  <div className="text-yellow-400 text-xs">+2.1%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
