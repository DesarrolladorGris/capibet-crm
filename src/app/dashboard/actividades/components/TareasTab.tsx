'use client';

import { useState } from 'react';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaLimite?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  asignadoA: string;
  categoria: string;
  etiquetas: string[];
}

export default function TareasTab() {
  const [tareas, setTareas] = useState<Tarea[]>([
    {
      id: '1',
      titulo: 'Revisar propuesta comercial',
      descripcion: 'Analizar y aprobar la propuesta para el cliente ABC',
      fechaCreacion: '2024-01-15',
      fechaLimite: '2024-01-18',
      prioridad: 'alta',
      estado: 'en_progreso',
      asignadoA: 'Juan Pérez',
      categoria: 'Ventas',
      etiquetas: ['propuesta', 'cliente', 'revisión']
    },
    {
      id: '2',
      titulo: 'Preparar presentación mensual',
      descripcion: 'Crear slides para la reunión de resultados del mes',
      fechaCreacion: '2024-01-14',
      fechaLimite: '2024-01-20',
      prioridad: 'media',
      estado: 'pendiente',
      asignadoA: 'María García',
      categoria: 'Marketing',
      etiquetas: ['presentación', 'resultados', 'mensual']
    },
    {
      id: '3',
      titulo: 'Actualizar base de datos',
      descripcion: 'Sincronizar contactos con el CRM principal',
      fechaCreacion: '2024-01-13',
      fechaLimite: '2024-01-16',
      prioridad: 'urgente',
      estado: 'pendiente',
      asignadoA: 'Carlos López',
      categoria: 'Tecnología',
      etiquetas: ['CRM', 'sincronización', 'contactos']
    }
  ]);

  const [showNuevaTarea, setShowNuevaTarea] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fechaLimite: '',
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'urgente',
    estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completada' | 'cancelada',
    asignadoA: '',
    categoria: '',
    etiquetas: ['']
  });

  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');

  const handleNuevaTarea = () => {
    if (nuevaTarea.titulo && nuevaTarea.asignadoA) {
      const tarea: Tarea = {
        id: Date.now().toString(),
        ...nuevaTarea,
        fechaCreacion: new Date().toISOString().split('T')[0],
        etiquetas: nuevaTarea.etiquetas.filter(e => e.trim() !== '')
      };
      setTareas([...tareas, tarea]);
      setNuevaTarea({
        titulo: '',
        descripcion: '',
        fechaLimite: '',
        prioridad: 'media',
        estado: 'pendiente',
        asignadoA: '',
        categoria: '',
        etiquetas: ['']
      });
      setShowNuevaTarea(false);
    }
  };

  const addEtiqueta = () => {
    setNuevaTarea({
      ...nuevaTarea,
      etiquetas: [...nuevaTarea.etiquetas, '']
    });
  };

  const removeEtiqueta = (index: number) => {
    const etiquetas = nuevaTarea.etiquetas.filter((_, i) => i !== index);
    setNuevaTarea({ ...nuevaTarea, etiquetas });
  };

  const updateEtiqueta = (index: number, value: string) => {
    const etiquetas = [...nuevaTarea.etiquetas];
    etiquetas[index] = value;
    setNuevaTarea({ ...nuevaTarea, etiquetas });
  };

  const cambiarEstado = (id: string, nuevoEstado: Tarea['estado']) => {
    setTareas(tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
  };



  const getPrioridadBgColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-500';
      case 'en_progreso': return 'bg-blue-500';
      case 'pendiente': return 'bg-yellow-500';
      case 'cancelada': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  const tareasFiltradas = tareas.filter(tarea => {
    if (filtroEstado !== 'todas' && tarea.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'todas' && tarea.prioridad !== filtroPrioridad) return false;
    return true;
  });

  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const tareasEnProgreso = tareas.filter(t => t.estado === 'en_progreso').length;
  const tareasUrgentes = tareas.filter(t => t.prioridad === 'urgente').length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-white">{tareas.length}</div>
          <div className="text-gray-400 text-sm">Total Tareas</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{tareasPendientes}</div>
          <div className="text-gray-400 text-sm">Pendientes</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-400">{tareasEnProgreso}</div>
          <div className="text-gray-400 text-sm">En Progreso</div>
        </div>
        <div className="bg-[#1a1d23] p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-400">{tareasUrgentes}</div>
          <div className="text-gray-400 text-sm">Urgentes</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Estado:</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-1 text-white text-sm"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Prioridad:</span>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-1 text-white text-sm"
          >
            <option value="todas">Todas</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Botón Nueva Tarea */}
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-medium">Gestión de Tareas</h3>
        <button
          onClick={() => setShowNuevaTarea(true)}
          className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <span>✅</span>
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Modal Nueva Tarea */}
      {showNuevaTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-lg font-medium mb-4">Nueva Tarea</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Título de la tarea"
                value={nuevaTarea.titulo}
                onChange={(e) => setNuevaTarea({...nuevaTarea, titulo: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 md:col-span-2"
              />
              <textarea
                placeholder="Descripción"
                value={nuevaTarea.descripcion}
                onChange={(e) => setNuevaTarea({...nuevaTarea, descripcion: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 h-20 resize-none md:col-span-2"
              />
              <input
                type="date"
                placeholder="Fecha límite"
                value={nuevaTarea.fechaLimite}
                onChange={(e) => setNuevaTarea({...nuevaTarea, fechaLimite: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <select
                value={nuevaTarea.prioridad}
                                 onChange={(e) => setNuevaTarea({...nuevaTarea, prioridad: e.target.value as 'baja' | 'media' | 'alta' | 'urgente'})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
              <input
                type="text"
                placeholder="Asignado a"
                value={nuevaTarea.asignadoA}
                onChange={(e) => setNuevaTarea({...nuevaTarea, asignadoA: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="Categoría"
                value={nuevaTarea.categoria}
                onChange={(e) => setNuevaTarea({...nuevaTarea, categoria: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>

            {/* Etiquetas */}
            <div className="mt-4">
              <label className="block text-white text-sm font-medium mb-2">Etiquetas</label>
              {nuevaTarea.etiquetas.map((etiqueta, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Etiqueta"
                    value={etiqueta}
                    onChange={(e) => updateEtiqueta(index, e.target.value)}
                    className="flex-1 bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
                  />
                  {nuevaTarea.etiquetas.length > 1 && (
                    <button
                      onClick={() => removeEtiqueta(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addEtiqueta}
                className="bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded transition-colors"
              >
                + Agregar Etiqueta
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNuevaTarea(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevaTarea}
                className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tareas */}
      <div className="bg-[#1a1d23] rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full table-fixed">
            <thead className="bg-[#3a3d45]">
              <tr>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/4">Tarea</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Asignado</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Prioridad</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Estado</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Fecha Límite</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Categoría</th>
                <th className="px-3 py-2 text-left text-white font-medium text-sm w-1/6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3d45]">
              {tareasFiltradas.map((tarea) => (
                <tr key={tarea.id} className="hover:bg-[#2a2d35] transition-colors">
                  <td className="px-3 py-2">
                    <div className="truncate">
                      <div className="text-white font-medium text-sm truncate">{tarea.titulo}</div>
                      <div className="text-gray-400 text-xs truncate">{tarea.descripcion}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tarea.etiquetas.slice(0, 2).map((etiqueta, index) => (
                          <span key={index} className="bg-[#3a3d45] text-gray-300 text-xs px-1.5 py-0.5 rounded truncate">
                            {etiqueta}
                          </span>
                        ))}
                        {tarea.etiquetas.length > 2 && (
                          <span className="bg-[#3a3d45] text-gray-300 text-xs px-1.5 py-0.5 rounded">
                            +{tarea.etiquetas.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-sm truncate">{tarea.asignadoA}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadBgColor(tarea.prioridad)} text-white`}>
                      {tarea.prioridad.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${getEstadoColor(tarea.estado)} mr-1`}></span>
                    <span className="text-gray-300 text-xs">{getEstadoText(tarea.estado)}</span>
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-sm truncate">
                    {tarea.fechaLimite ? (
                      <span className={new Date(tarea.fechaLimite) < new Date() ? 'text-red-400' : ''}>
                        {tarea.fechaLimite}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Sin fecha</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-300 text-sm truncate">{tarea.categoria}</td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      {tarea.estado === 'pendiente' && (
                        <button
                          onClick={() => cambiarEstado(tarea.id, 'en_progreso')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 py-0.5 rounded text-xs transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      {tarea.estado === 'en_progreso' && (
                        <button
                          onClick={() => cambiarEstado(tarea.id, 'completada')}
                          className="bg-green-600 hover:bg-green-700 text-white px-1.5 py-0.5 rounded text-xs transition-colors"
                        >
                          Completar
                        </button>
                      )}
                      <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-1.5 py-0.5 rounded text-xs transition-colors">
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
