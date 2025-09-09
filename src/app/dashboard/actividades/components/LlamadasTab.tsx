'use client';

import { useState } from 'react';

interface Llamada {
  id: string;
  contacto: string;
  telefono: string;
  fecha: string;
  duracion: string;
  tipo: 'entrante' | 'saliente' | 'perdida';
  estado: 'completada' | 'pendiente' | 'programada';
  notas: string;
}

export default function LlamadasTab() {
  const [llamadas, setLlamadas] = useState<Llamada[]>([
    {
      id: '1',
      contacto: 'Juan Pérez',
      telefono: '+34 600 123 456',
      fecha: '2024-01-15 10:30',
      duracion: '15:23',
      tipo: 'saliente',
      estado: 'completada',
      notas: 'Cliente interesado en el producto premium'
    },
    {
      id: '2',
      contacto: 'María García',
      telefono: '+34 600 789 012',
      fecha: '2024-01-15 14:15',
      duracion: '08:45',
      tipo: 'entrante',
      estado: 'completada',
      notas: 'Consulta sobre facturación'
    }
  ]);

  const [showNuevaLlamada, setShowNuevaLlamada] = useState(false);
  const [nuevaLlamada, setNuevaLlamada] = useState({
    contacto: '',
    telefono: '',
    fecha: '',
    tipo: 'saliente' as 'entrante' | 'saliente' | 'perdida',
    estado: 'pendiente' as 'completada' | 'pendiente' | 'programada',
    notas: ''
  });

  const handleNuevaLlamada = () => {
    if (nuevaLlamada.contacto && nuevaLlamada.telefono) {
      const llamada: Llamada = {
        id: Date.now().toString(),
        ...nuevaLlamada,
        fecha: nuevaLlamada.fecha || new Date().toISOString().slice(0, 16).replace('T', ' '),
        duracion: '00:00'
      };
      setLlamadas([...llamadas, llamada]);
      setNuevaLlamada({
        contacto: '',
        telefono: '',
        fecha: '',
        tipo: 'saliente',
        estado: 'pendiente',
        notas: ''
      });
      setShowNuevaLlamada(false);
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrante': return 'text-green-400';
      case 'saliente': return 'text-blue-400';
      case 'perdida': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-500';
      case 'pendiente': return 'bg-yellow-500';
      case 'programada': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{llamadas.length}</div>
          <div className="text-gray-400 text-sm">Total Llamadas</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {llamadas.filter(l => l.estado === 'completada').length}
          </div>
          <div className="text-gray-400 text-sm">Completadas</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">
            {llamadas.filter(l => l.estado === 'pendiente').length}
          </div>
          <div className="text-gray-400 text-sm">Pendientes</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">
            {llamadas.filter(l => l.tipo === 'entrante').length}
          </div>
          <div className="text-gray-400 text-sm">Entrantes</div>
        </div>
      </div>

      {/* Botón Nueva Llamada */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-medium">Registro de Llamadas</h3>
        <button
          onClick={() => setShowNuevaLlamada(true)}
          className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>📞</span>
          <span>Nueva Llamada</span>
        </button>
      </div>

      {/* Modal Nueva Llamada */}
      {showNuevaLlamada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white text-lg font-medium mb-4">Nueva Llamada</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del contacto"
                value={nuevaLlamada.contacto}
                onChange={(e) => setNuevaLlamada({...nuevaLlamada, contacto: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={nuevaLlamada.telefono}
                onChange={(e) => setNuevaLlamada({...nuevaLlamada, telefono: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <input
                type="datetime-local"
                value={nuevaLlamada.fecha}
                onChange={(e) => setNuevaLlamada({...nuevaLlamada, fecha: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <select
                value={nuevaLlamada.tipo}
                                 onChange={(e) => setNuevaLlamada({...nuevaLlamada, tipo: e.target.value as 'entrante' | 'saliente' | 'perdida'})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              >
                <option value="entrante">Entrante</option>
                <option value="saliente">Saliente</option>
                <option value="perdida">Perdida</option>
              </select>
              <textarea
                placeholder="Notas de la llamada"
                value={nuevaLlamada.notas}
                onChange={(e) => setNuevaLlamada({...nuevaLlamada, notas: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNuevaLlamada(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevaLlamada}
                className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Llamadas */}
      <div className="bg-[#1a1d23] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3a3d45]">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">Contacto</th>
                <th className="px-4 py-3 text-left text-white font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left text-white font-medium">Fecha</th>
                <th className="px-4 py-3 text-left text-white font-medium">Duración</th>
                <th className="px-4 py-3 text-left text-white font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-white font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-white font-medium">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3d45]">
              {llamadas.map((llamada) => (
                <tr key={llamada.id} className="hover:bg-[#2a2d35] transition-colors">
                  <td className="px-4 py-3 text-white">{llamada.contacto}</td>
                  <td className="px-4 py-3 text-gray-300">{llamada.telefono}</td>
                  <td className="px-4 py-3 text-gray-300">{llamada.fecha}</td>
                  <td className="px-4 py-3 text-gray-300">{llamada.duracion}</td>
                  <td className="px-4 py-3">
                    <span className={`${getTipoColor(llamada.tipo)} capitalize`}>
                      {llamada.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-3 h-3 rounded-full ${getEstadoColor(llamada.estado)} mr-2`}></span>
                    <span className="text-gray-300 capitalize">{llamada.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate" title={llamada.notas}>
                    {llamada.notas}
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
