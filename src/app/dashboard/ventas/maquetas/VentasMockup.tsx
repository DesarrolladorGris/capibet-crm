'use client';

import { useState } from 'react';

// Mockup estático para el módulo de Ventas
export default function VentasMockup() {
  const [activeView, setActiveView] = useState<'list' | 'grid' | 'calendar'>('list');

  return (
    <div className="h-full bg-[#1a1d23] flex flex-col">
      {/* Header compacto estilo Beast CRM */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold text-xl">Ventas</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>•</span>
              <span>Gestión de ventas y facturación</span>
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
          <div className="p-4">
            {/* Stats Cards compactas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Ventas del Mes</div>
                  <div className="text-green-400 text-sm font-medium">+15.2%</div>
                </div>
                <div className="text-white text-2xl font-bold">$125,430</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Transacciones</div>
                  <div className="text-blue-400 text-sm font-medium">+8</div>
                </div>
                <div className="text-white text-2xl font-bold">247</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Ticket Promedio</div>
                  <div className="text-yellow-400 text-sm font-medium">+2.1%</div>
                </div>
                <div className="text-white text-2xl font-bold">$508</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Conversión</div>
                  <div className="text-red-400 text-sm font-medium">-1.2%</div>
                </div>
                <div className="text-white text-2xl font-bold">23.4%</div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setActiveView('list')}
                  className={`p-2 rounded ${activeView === 'list' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveView('grid')}
                  className={`p-2 rounded ${activeView === 'grid' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveView('calendar')}
                  className={`p-2 rounded ${activeView === 'calendar' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            {activeView === 'list' && (
              <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1d23] border-b border-[#3a3d45]">
                      <tr>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">ID</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Cliente</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Producto</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Total</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Estado</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-[#3a3d45] hover:bg-[#1a1d23] transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-white font-medium text-sm">#{1000 + i}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300 text-sm">Cliente {i}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300 text-sm">Producto {i}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white font-semibold">${(1000 + i * 100).toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-gray-300 text-sm">Completada</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-white p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                              <button className="text-gray-400 hover:text-white p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45] hover:border-[#00b894] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-medium text-lg">Venta #{1000 + i}</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-400 text-sm">Completada</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="text-gray-400 text-sm">Cliente: <span className="text-white">Cliente {i}</span></div>
                      <div className="text-gray-400 text-sm">Producto: <span className="text-white">Producto {i}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-xl font-bold">${(1000 + i * 100).toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">2024-01-{20 + i}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'calendar' && (
              <div className="bg-[#2a2d35] rounded-lg p-6 border border-[#3a3d45]">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Vista de Calendario</p>
                  <p className="text-sm">Ventas organizadas por fecha</p>
                </div>
              </div>
            )}
          </div>
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
