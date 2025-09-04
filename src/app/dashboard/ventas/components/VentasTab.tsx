'use client';

import { useState } from 'react';

interface Venta {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  vendedor: string;
}

const ventasMock: Venta[] = [
  {
    id: '1',
    cliente: 'Empresa A S.A.',
    producto: 'CRM Premium',
    cantidad: 1,
    precio: 5000,
    total: 5000,
    fecha: '2024-01-28',
    estado: 'completada',
    vendedor: 'Juan Pérez'
  },
  {
    id: '2',
    cliente: 'Startup B',
    producto: 'Consultoría Digital',
    cantidad: 1,
    precio: 8500,
    total: 8500,
    fecha: '2024-01-27',
    estado: 'pendiente',
    vendedor: 'María García'
  },
  {
    id: '3',
    cliente: 'Tienda C',
    producto: 'Desarrollo Web',
    cantidad: 1,
    precio: 25000,
    total: 25000,
    fecha: '2024-01-26',
    estado: 'completada',
    vendedor: 'Carlos López'
  }
];

export default function VentasTab() {
  const [ventas, setVentas] = useState<Venta[]>(ventasMock);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-500';
      case 'pendiente':
        return 'bg-yellow-500';
      case 'cancelada':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const ventasFiltradas = ventas
    .filter(venta => filtroEstado === 'todos' || venta.estado === filtroEstado)
    .filter(venta => 
      busqueda === '' || 
      venta.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      venta.vendedor.toLowerCase().includes(busqueda.toLowerCase())
    );

  const estadisticas = {
    total: ventas.length,
    completadas: ventas.filter(v => v.estado === 'completada').length,
    pendientes: ventas.filter(v => v.estado === 'pendiente').length,
    totalVentas: ventas.filter(v => v.estado === 'completada').reduce((sum, v) => sum + v.total, 0)
  };

  return (
    <div className="h-full">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Total Ventas</div>
          <div className="text-white text-2xl font-bold">{estadisticas.total}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Completadas</div>
          <div className="text-green-400 text-2xl font-bold">{estadisticas.completadas}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Pendientes</div>
          <div className="text-yellow-400 text-2xl font-bold">{estadisticas.pendientes}</div>
        </div>
        <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
          <div className="text-gray-400 text-sm mb-1">Ingresos</div>
          <div className="text-white text-2xl font-bold">${estadisticas.totalVentas.toLocaleString()}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[#2a2d35] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-semibold">Lista de Ventas</h2>
          <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            + Nueva Venta
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
            />
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
              <option value="completada">Completadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1d23] border-b border-[#3a3d45]">
              <tr>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">ID</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Cliente</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Producto</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Cantidad</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Precio</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Total</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Fecha</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Estado</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Vendedor</th>
                <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id} className="border-b border-[#3a3d45] hover:bg-[#1a1d23] transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium text-sm">#{venta.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{venta.cliente}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{venta.producto}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{venta.cantidad}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">${venta.precio.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-semibold">${venta.total.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{formatFecha(venta.fecha)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getEstadoColor(venta.estado)}`}></div>
                      <span className="text-gray-300 text-sm capitalize">{venta.estado}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">{venta.vendedor}</div>
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
