'use client';

import { useState } from 'react';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
}

const productosMock: Producto[] = [
  {
    id: '1',
    nombre: 'CRM Premium',
    descripcion: 'Sistema de gestión de relaciones con clientes completo',
    precio: 5000,
    categoria: 'Software',
    stock: 50,
    estado: 'activo',
    fechaCreacion: '2024-01-15'
  },
  {
    id: '2',
    nombre: 'Consultoría Digital',
    descripcion: 'Servicio de consultoría para transformación digital',
    precio: 8500,
    categoria: 'Servicios',
    stock: 0,
    estado: 'activo',
    fechaCreacion: '2024-01-20'
  },
  {
    id: '3',
    nombre: 'Desarrollo Web',
    descripcion: 'Desarrollo de sitios web y aplicaciones',
    precio: 25000,
    categoria: 'Desarrollo',
    stock: 10,
    estado: 'activo',
    fechaCreacion: '2024-01-25'
  },
  {
    id: '4',
    nombre: 'Marketing Digital',
    descripcion: 'Estrategias de marketing digital y redes sociales',
    precio: 5000,
    categoria: 'Marketing',
    stock: 0,
    estado: 'inactivo',
    fechaCreacion: '2024-01-10'
  }
];

export default function ProductosTab() {
  const [productos, setProductos] = useState<Producto[]>(productosMock);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500';
      case 'inactivo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 10) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const productosFiltrados = productos
    .filter(producto => filtroCategoria === 'todas' || producto.categoria === filtroCategoria)
    .filter(producto => filtroEstado === 'todos' || producto.estado === filtroEstado)
    .filter(producto => 
      busqueda === '' || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );

  const categorias = [...new Set(productos.map(p => p.categoria))];

  const estadisticas = {
    total: productos.length,
    activos: productos.filter(p => p.estado === 'activo').length,
    inactivos: productos.filter(p => p.estado === 'inactivo').length,
    sinStock: productos.filter(p => p.stock === 0).length
  };

  return (
    <div className="h-full">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Total Productos</div>
          <div className="text-white text-2xl font-bold">{estadisticas.total}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Activos</div>
          <div className="text-green-400 text-2xl font-bold">{estadisticas.activos}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Inactivos</div>
          <div className="text-red-400 text-2xl font-bold">{estadisticas.inactivos}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Sin Stock</div>
          <div className="text-yellow-400 text-2xl font-bold">{estadisticas.sinStock}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#2a2d35] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Catálogo de Productos</h2>
          <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            + Nuevo Producto
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
            />
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-400 text-sm">Categoría:</label>
            <select 
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00b894]"
            >
              <option value="todas">Todas</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-400 text-sm">Estado:</label>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00b894]"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1d23] border-b border-[#3a3d45]">
              <tr>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">ID</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Nombre</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Descripción</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Categoría</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Precio</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Stock</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Estado</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Fecha</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id} className="border-b border-[#3a3d45] hover:bg-[#1a1d23] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">#{producto.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">{producto.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm max-w-xs truncate">{producto.descripcion}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{producto.categoria}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-semibold">${producto.precio.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`font-medium text-sm ${getStockColor(producto.stock)}`}>
                      {producto.stock}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getEstadoColor(producto.estado)}`}></div>
                      <span className="text-gray-300 text-sm capitalize">{producto.estado}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{formatFecha(producto.fechaCreacion)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-white p-1" title="Ver detalles">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-white p-1" title="Editar">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-red-400 p-1" title="Eliminar">
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
    </div>
  );
}
