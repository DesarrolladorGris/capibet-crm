'use client';

import { useState } from 'react';

// Mockup estático para el módulo de Productos
export default function ProductosMockup() {
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'categories'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categorias = ['Todas', 'Software', 'Servicios', 'Hardware', 'Consultoría', 'Marketing'];

  return (
    <div className="h-full bg-[#1a1d23] flex flex-col">
      {/* Header compacto estilo Beast CRM */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold text-xl">Productos</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>•</span>
              <span>Catálogo y gestión de inventario</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-1.5 pl-8 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00b894] focus:border-[#00b894] w-48 text-sm"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
              + Nuevo Producto
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
                    <div className="text-white font-medium text-sm">Producto {i}</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-400 text-xs">Activo</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-300 text-sm">Software</div>
                    <div className="text-white font-semibold text-lg">${(100 + i * 50).toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">Stock: {20 - i}</div>
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
                  <div className="text-gray-400 text-sm">Total Productos</div>
                  <div className="text-green-400 text-sm font-medium">+12</div>
                </div>
                <div className="text-white text-2xl font-bold">156</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Activos</div>
                  <div className="text-blue-400 text-sm font-medium">98%</div>
                </div>
                <div className="text-white text-2xl font-bold">153</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Sin Stock</div>
                  <div className="text-red-400 text-sm font-medium">3</div>
                </div>
                <div className="text-white text-2xl font-bold">3</div>
              </div>
              <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-400 text-sm">Valor Total</div>
                  <div className="text-yellow-400 text-sm font-medium">+5.2%</div>
                </div>
                <div className="text-white text-2xl font-bold">$2.4M</div>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="flex items-center space-x-2 mb-4">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => setSelectedCategory(categoria.toLowerCase())}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    selectedCategory === categoria.toLowerCase()
                      ? 'bg-[#00b894] text-white'
                      : 'bg-[#2a2d35] text-gray-400 hover:text-white hover:bg-[#3a3d45]'
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setActiveView('grid')}
                  className={`p-2 rounded ${activeView === 'grid' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveView('list')}
                  className={`p-2 rounded ${activeView === 'list' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveView('categories')}
                  className={`p-2 rounded ${activeView === 'categories' ? 'bg-[#00b894] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            {activeView === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45] hover:border-[#00b894] transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-[#00b894] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P{i}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-green-400 text-xs">Activo</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <h3 className="text-white font-medium text-lg">Producto {i}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">Descripción del producto {i}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Categoría:</span>
                        <span className="text-blue-400 text-sm">Software</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white text-xl font-bold">${(100 + i * 50).toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">Stock: {20 - i}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                        Editar
                      </button>
                      <button className="text-gray-400 hover:text-white p-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'list' && (
              <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1d23] border-b border-[#3a3d45]">
                      <tr>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Producto</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Categoría</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Precio</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Stock</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Estado</th>
                        <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i} className="border-b border-[#3a3d45] hover:bg-[#1a1d23] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-[#00b894] rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">P{i}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium text-sm">Producto {i}</div>
                                <div className="text-gray-400 text-xs">ID: #{1000 + i}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-300 text-sm">Software</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-white font-semibold">${(100 + i * 50).toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`font-medium text-sm ${20 - i < 5 ? 'text-red-400' : 'text-green-400'}`}>
                              {20 - i}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-gray-300 text-sm">Activo</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-white p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button className="text-gray-400 hover:text-red-400 p-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

            {activeView === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Software', 'Servicios', 'Hardware', 'Consultoría', 'Marketing', 'Soporte'].map((categoria, index) => (
                  <div key={categoria} className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45] hover:border-[#00b894] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-[#00b894] rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{categoria[0]}</span>
                      </div>
                      <div className="text-gray-400 text-sm">{25 + index * 5} productos</div>
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">{categoria}</h3>
                    <p className="text-gray-400 text-sm mb-3">Descripción de la categoría {categoria.toLowerCase()}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-white text-xl font-bold">${(1000 + index * 500).toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">valor total</div>
                    </div>
                  </div>
                ))}
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
                <label className="block text-gray-400 text-sm mb-2">Categoría</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todas las categorías</option>
                  <option>Software</option>
                  <option>Servicios</option>
                  <option>Hardware</option>
                  <option>Consultoría</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Estado</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los estados</option>
                  <option>Activos</option>
                  <option>Inactivos</option>
                  <option>Sin Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rango de Precio</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los precios</option>
                  <option>$0 - $100</option>
                  <option>$100 - $500</option>
                  <option>$500 - $1000</option>
                  <option>$1000+</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Total Productos</div>
                  <div className="text-white text-2xl font-bold">156</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Activos</div>
                  <div className="text-white text-2xl font-bold">153</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Sin Stock</div>
                  <div className="text-white text-2xl font-bold">3</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Valor Total</div>
                  <div className="text-white text-2xl font-bold">$2.4M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
