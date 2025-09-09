
'use client';

import { useState } from 'react';

interface Reunion {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  duracion: number; // en minutos
  participantes: string[];
  tipo: 'presencial' | 'virtual' | 'híbrida';
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada';
  ubicacion?: string;
  link?: string;
}

export default function ReunionesTab() {
  const [reuniones, setReuniones] = useState<Reunion[]>([
    {
      id: '1',
      titulo: 'Reunión de Ventas Semanal',
      descripcion: 'Revisión de objetivos y estrategias de ventas',
      fecha: '2024-01-16',
      hora: '09:00',
      duracion: 60,
      participantes: ['Juan Pérez', 'María García', 'Carlos López'],
      
      tipo: 'virtual',
      estado: 'programada',
      link: 'https://meet.google.com/abc-defg-hij'
    },
    {
      id: '2',
      titulo: 'Presentación Cliente Premium',
      descripcion: 'Demo del producto para cliente potencial',
      fecha: '2024-01-17',
      hora: '14:30',
      duracion: 90,
      participantes: ['Ana Martínez', 'Cliente Premium'],
      tipo: 'presencial',
      estado: 'programada',
      ubicacion: 'Oficina Central - Sala de Reuniones'
    }
  ]);

  const [showNuevaReunion, setShowNuevaReunion] = useState(false);
  const [nuevaReunion, setNuevaReunion] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    duracion: 60,
    participantes: [''],
    tipo: 'virtual' as 'presencial' | 'virtual' | 'híbrida',
    estado: 'programada' as 'programada' | 'en_curso' | 'completada' | 'cancelada',
    ubicacion: '',
    link: ''
  });

  const handleNuevaReunion = () => {
    if (nuevaReunion.titulo && nuevaReunion.fecha && nuevaReunion.hora) {
      const reunion: Reunion = {
        id: Date.now().toString(),
        ...nuevaReunion,
        participantes: nuevaReunion.participantes.filter(p => p.trim() !== '')
      };
      setReuniones([...reuniones, reunion]);
      setNuevaReunion({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        duracion: 60,
        participantes: [''],
        tipo: 'virtual',
        estado: 'programada',
        ubicacion: '',
        link: ''
      });
      setShowNuevaReunion(false);
    }
  };

  const addParticipante = () => {
    setNuevaReunion({
      ...nuevaReunion,
      participantes: [...nuevaReunion.participantes, '']
    });
  };

  const removeParticipante = (index: number) => {
    const participantes = nuevaReunion.participantes.filter((_, i) => i !== index);
    setNuevaReunion({ ...nuevaReunion, participantes });
  };

  const updateParticipante = (index: number, value: string) => {
    const participantes = [...nuevaReunion.participantes];
    participantes[index] = value;
    setNuevaReunion({ ...nuevaReunion, participantes });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'presencial': return 'text-blue-400';
      case 'virtual': return 'text-green-400';
      case 'híbrida': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-blue-500';
      case 'en_curso': return 'bg-yellow-500';
      case 'completada': return 'bg-green-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{reuniones.length}</div>
          <div className="text-gray-400 text-sm">Total Reuniones</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">
            {reuniones.filter(r => r.estado === 'programada').length}
          </div>
          <div className="text-gray-400 text-sm">Programadas</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {reuniones.filter(r => r.estado === 'completada').length}
          </div>
          <div className="text-gray-400 text-sm">Completadas</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-400">
            {reuniones.filter(r => r.tipo === 'híbrida').length}
          </div>
          <div className="text-gray-400 text-sm">Híbridas</div>
        </div>
      </div>

      {/* Botón Nueva Reunión */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-medium">Programación de Reuniones</h3>
        <button
          onClick={() => setShowNuevaReunion(true)}
          className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>🤝</span>
          <span>Nueva Reunión</span>
        </button>
      </div>

      {/* Modal Nueva Reunión */}
      {showNuevaReunion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-lg font-medium mb-4">Nueva Reunión</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título de la reunión"
                value={nuevaReunion.titulo}
                onChange={(e) => setNuevaReunion({...nuevaReunion, titulo: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 md:col-span-2"
              />
              <textarea
                placeholder="Descripción"
                value={nuevaReunion.descripcion}
                onChange={(e) => setNuevaReunion({...nuevaReunion, descripcion: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 h-20 resize-none md:col-span-2"
              />
              <input
                type="date"
                value={nuevaReunion.fecha}
                onChange={(e) => setNuevaReunion({...nuevaReunion, fecha: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <input
                type="time"
                value={nuevaReunion.hora}
                onChange={(e) => setNuevaReunion({...nuevaReunion, hora: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Duración (minutos)"
                value={nuevaReunion.duracion}
                onChange={(e) => setNuevaReunion({...nuevaReunion, duracion: parseInt(e.target.value) || 60})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <select
                value={nuevaReunion.tipo}
                                 onChange={(e) => setNuevaReunion({...nuevaReunion, tipo: e.target.value as 'presencial' | 'virtual' | 'híbrida'})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              >
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
                <option value="híbrida">Híbrida</option>
              </select>
              {nuevaReunion.tipo === 'presencial' && (
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={nuevaReunion.ubicacion}
                  onChange={(e) => setNuevaReunion({...nuevaReunion, ubicacion: e.target.value})}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 md:col-span-2"
                />
              )}
              {nuevaReunion.tipo === 'virtual' && (
                <input
                  type="url"
                  placeholder="Link de la reunión"
                  value={nuevaReunion.link}
                  onChange={(e) => setNuevaReunion({...nuevaReunion, link: e.target.value})}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 md:col-span-2"
                />
              )}
            </div>

            {/* Participantes */}
            <div className="mt-4">
              <label className="block text-white text-sm font-medium mb-2">Participantes</label>
              {nuevaReunion.participantes.map((participante, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre del participante"
                    value={participante}
                    onChange={(e) => updateParticipante(index, e.target.value)}
                    className="flex-1 bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
                  />
                  {nuevaReunion.participantes.length > 1 && (
                    <button
                      onClick={() => removeParticipante(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addParticipante}
                className="bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded transition-colors"
              >
                + Agregar Participante
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNuevaReunion(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevaReunion}
                className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Programar Reunión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Reuniones */}
      <div className="bg-[#1a1d23] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3a3d45]">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">Título</th>
                <th className="px-4 py-3 text-left text-white font-medium">Fecha</th>
                <th className="px-4 py-3 text-left text-white font-medium">Hora</th>
                <th className="px-4 py-3 text-left text-white font-medium">Duración</th>
                <th className="px-4 py-3 text-left text-white font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-white font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-white font-medium">Participantes</th>
                <th className="px-4 py-3 text-left text-white font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3d45]">
              {reuniones.map((reunion) => (
                <tr key={reunion.id} className="hover:bg-[#2a2d35] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-white font-medium">{reunion.titulo}</div>
                      <div className="text-gray-400 text-sm">{reunion.descripcion}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{reunion.fecha}</td>
                  <td className="px-4 py-3 text-gray-300">{reunion.hora}</td>
                  <td className="px-4 py-3 text-gray-300">{reunion.duracion} min</td>
                  <td className="px-4 py-3">
                    <span className={`${getTipoColor(reunion.tipo)} capitalize`}>
                      {reunion.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-3 h-3 rounded-full ${getEstadoColor(reunion.estado)} mr-2`}></span>
                    <span className="text-gray-300">{getEstadoText(reunion.estado)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-300 text-sm">
                      {reunion.participantes.slice(0, 2).join(', ')}
                      {reunion.participantes.length > 2 && ` +${reunion.participantes.length - 2}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {reunion.link && (
                        <a
                          href={reunion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          Unirse
                        </a>
                      )}
                      <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-2 py-1 rounded text-xs transition-colors">
                        Editar
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
