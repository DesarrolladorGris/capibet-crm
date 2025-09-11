'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Interfaces
interface User {
  id: string;
  name: string;
  role: 'admin' | 'supervisor' | 'comercial';
  agencyName: string;
}

interface ActividadBase {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  duracion: number;
  creadoPor: string;
  fechaCreacion: string;
}

interface Llamada extends ActividadBase {
  tipo: 'llamada';
  telefono: string;
  resultado: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

interface Reunion extends ActividadBase {
  tipo: 'reunion';
  tipoReunion: 'presencial' | 'virtual' | 'híbrida';
  lugar?: string;
  link?: string;
  participantes: string[];
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

interface Tarea extends ActividadBase {
  tipo: 'tarea';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  asignadoA: string;
  fechaLimite: string;
}

type Actividad = Llamada | Reunion | Tarea;

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  duracion: number;
  tipo: 'llamada' | 'reunion' | 'tarea';
  color: string;
  actividad: Actividad;
}

export default function CalendarPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [tipoActividad, setTipoActividad] = useState<'llamada' | 'reunion' | 'tarea'>('tarea');

  // Mock data para usuarios del equipo
  const teamMembers: User[] = [
    { id: '1', name: 'Admin Principal', role: 'admin', agencyName: 'CAPIBET' },
    { id: '2', name: 'Supervisor 1', role: 'supervisor', agencyName: 'CAPIBET' },
    { id: '3', name: 'Comercial 1', role: 'comercial', agencyName: 'CAPIBET' },
    { id: '4', name: 'Comercial 2', role: 'comercial', agencyName: 'CAPIBET' },
  ];

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Convertir actividades a eventos para el calendario
    const nuevosEventos = actividades.map(actividad => ({
      id: actividad.id,
      titulo: actividad.titulo,
      fecha: actividad.fecha,
      hora: actividad.hora,
      duracion: actividad.duracion,
      tipo: actividad.tipo,
      color: getEventoColor(actividad.tipo),
      actividad
    }));
    setEventos(nuevosEventos);
  }, [actividades]);

  // No necesitamos este useEffect aquí, la fecha se manejará en el modal

  const getEventoColor = (tipo: string): string => {
    switch (tipo) {
      case 'llamada': return '#3B82F6'; // blue
      case 'reunion': return '#10B981'; // green
      case 'tarea': return '#F59E0B'; // amber
      default: return '#6B7280'; // gray
    }
  };

  const handleAddActividad = (nuevaActividad: Omit<Actividad, 'id' | 'creadoPor' | 'fechaCreacion'>) => {
    const actividad: Actividad = {
      ...nuevaActividad,
      id: Date.now().toString(),
      creadoPor: user?.nombre_usuario || 'Usuario',
      fechaCreacion: new Date().toISOString()
    } as Actividad;

    setActividades(prev => [...prev, actividad]);
    setShowCreateModal(false);
  };



  const handleEditEvento = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setTipoActividad(evento.tipo);
    setShowEditModal(true);
  };

  const handleUpdateEvento = (id: string, updates: Partial<Actividad>) => {
    setActividades(prev => prev.map(actividad => 
      actividad.id === id ? { ...actividad, ...updates } as Actividad : actividad
    ));
    setShowEditModal(false);
    setEventoSeleccionado(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header compacto estilo Beast CRM */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold text-xl">Calendario</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>•</span>
              <span>Gestión de actividades</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setFechaSeleccionada(new Date())}
              className="px-3 py-1.5 bg-[#00b894] text-white rounded text-sm font-medium hover:bg-[#00a085] transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-[#2a2d35] text-white rounded text-sm font-medium hover:bg-[#3a3d45] transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Nueva Actividad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layout de 3 columnas estilo Beast CRM */}
      <div className="flex-1 flex overflow-hidden">
        {/* Columna izquierda - Lista de actividades */}
        <div className="w-1/3 border-r border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Actividades de Hoy</h3>
              <span className="text-gray-400 text-sm">{eventos.length}</span>
            </div>
            <div className="space-y-2">
              {eventos.length > 0 ? (
                eventos.map((evento) => (
                  <div key={evento.id} className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45] hover:border-[#00b894] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm">{evento.titulo}</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: evento.color }}></div>
                        <span className="text-xs text-gray-400">{evento.hora}</span>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm">{evento.actividad.descripcion}</div>
                    <div className="text-gray-400 text-xs mt-1">{evento.actividad.tipo}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No hay actividades</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna central - Calendario */}
        <div className="flex-1 bg-[#1a1d23] overflow-y-auto">
          <div className="p-4">
            {/* Calendar Controls */}
            <div className="bg-[#2a2d35] rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFechaSeleccionada(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    ←
                  </button>
                  <span className="text-white font-medium">
                    {fechaSeleccionada.toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                  <button
                    onClick={() => setFechaSeleccionada(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-[#2a2d35] rounded-lg p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                  <div key={dia} className="text-center text-gray-400 font-medium py-2 text-sm">
                    {dia}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const fecha = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
                  fecha.setDate(fecha.getDate() + i - fecha.getDay());
                  
                  const eventosDelDia = eventos.filter(evento => 
                    evento.fecha === fecha.toISOString().split('T')[0]
                  );
                  
                  const esHoy = fecha.toDateString() === new Date().toDateString();
                  const esMesActual = fecha.getMonth() === fechaSeleccionada.getMonth();
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-2 border border-[#3a3d45] cursor-pointer hover:bg-[#3a3d45] transition-colors ${
                        esHoy ? 'bg-[#00b894] bg-opacity-20' : ''
                      } ${!esMesActual ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (esMesActual) {
                          setFechaSeleccionada(fecha);
                          setShowCreateModal(true);
                        }
                      }}
                      title={esMesActual ? `Hacer clic para crear actividad en ${fecha.toLocaleDateString('es-ES')}` : ''}
                    >
                      <div className={`text-sm mb-1 ${esHoy ? 'text-[#00b894] font-bold' : 'text-gray-400'}`}>
                        {fecha.getDate()}
                      </div>
                      
                      {eventosDelDia.slice(0, 2).map(evento => (
                        <div
                          key={evento.id}
                          className="text-xs p-1 mb-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: evento.color }}
                          title={`${evento.titulo} - ${evento.hora}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvento(evento);
                          }}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                      
                      {eventosDelDia.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{eventosDelDia.length - 2} más
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Panel lateral */}
        <div className="w-80 border-l border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-medium mb-4">Filtros</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Tipo de Actividad</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todas las actividades</option>
                  <option>Llamadas</option>
                  <option>Reuniones</option>
                  <option>Tareas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Estado</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los estados</option>
                  <option>Pendientes</option>
                  <option>Completadas</option>
                  <option>Canceladas</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Asignado a</label>
                <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                  <option>Todos los usuarios</option>
                  <option>Admin Principal</option>
                  <option>Supervisor 1</option>
                  <option>Comercial 1</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Actividades Hoy</div>
                  <div className="text-white text-2xl font-bold">{eventos.length}</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Llamadas</div>
                  <div className="text-white text-2xl font-bold">{eventos.filter(e => e.tipo === 'llamada').length}</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Reuniones</div>
                  <div className="text-white text-2xl font-bold">{eventos.filter(e => e.tipo === 'reunion').length}</div>
                </div>
                <div className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                  <div className="text-gray-400 text-sm">Tareas</div>
                  <div className="text-white text-2xl font-bold">{eventos.filter(e => e.tipo === 'tarea').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Create Activity Modal */}
        {showCreateModal && (
          <CreateActivityModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleAddActividad}
            teamMembers={teamMembers}
            tipoActividad={tipoActividad}
            setTipoActividad={setTipoActividad}
            fechaSeleccionada={fechaSeleccionada}
          />
        )}

        {/* Edit Activity Modal */}
        {showEditModal && eventoSeleccionado && (
          <EditActivityModal
            onClose={() => {
              setShowEditModal(false);
              setEventoSeleccionado(null);
            }}
            onSubmit={(updates) => handleUpdateEvento(eventoSeleccionado.id, updates)}
            evento={eventoSeleccionado}
            teamMembers={teamMembers}
          />
        )}
    </div>
  );
}

// Modal para editar actividades
interface EditActivityModalProps {
  onClose: () => void;
  onSubmit: (updates: Partial<Actividad>) => void;
  evento: Evento;
  teamMembers: User[];
}

function EditActivityModal({ onClose, onSubmit, evento, teamMembers }: EditActivityModalProps) {
  const [formData, setFormData] = useState({
    titulo: evento.actividad.titulo,
    descripcion: evento.actividad.descripcion,
    fecha: evento.actividad.fecha,
    hora: evento.actividad.hora,
    duracion: evento.actividad.duracion,
    telefono: evento.actividad.tipo === 'llamada' ? (evento.actividad as Llamada).telefono : '',
    resultado: evento.actividad.tipo === 'llamada' ? (evento.actividad as Llamada).resultado : '',
    tipoReunion: evento.actividad.tipo === 'reunion' ? (evento.actividad as Reunion).tipoReunion : 'presencial',
    lugar: evento.actividad.tipo === 'reunion' ? (evento.actividad as Reunion).lugar || '' : '',
    link: evento.actividad.tipo === 'reunion' ? (evento.actividad as Reunion).link || '' : '',
    participantes: evento.actividad.tipo === 'reunion' ? (evento.actividad as Reunion).participantes : [],
    prioridad: evento.actividad.tipo === 'tarea' ? (evento.actividad as Tarea).prioridad : 'media',
    asignadoA: evento.actividad.tipo === 'tarea' ? (evento.actividad as Tarea).asignadoA : '',
    fechaLimite: evento.actividad.tipo === 'tarea' ? (evento.actividad as Tarea).fechaLimite : new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: Partial<Actividad> = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: formData.fecha,
      hora: formData.hora,
      duracion: formData.duracion
    };

    if (evento.actividad.tipo === 'llamada') {
      Object.assign(updates, {
        telefono: formData.telefono,
        resultado: formData.resultado
      });
    } else if (evento.actividad.tipo === 'reunion') {
      Object.assign(updates, {
        tipoReunion: formData.tipoReunion,
        lugar: formData.lugar,
        link: formData.link,
        participantes: formData.participantes
      });
    } else if (evento.actividad.tipo === 'tarea') {
      Object.assign(updates, {
        prioridad: formData.prioridad,
        asignadoA: formData.asignadoA,
        fechaLimite: formData.fechaLimite
      });
    }

    onSubmit(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2d35] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">✏️ Editar Actividad</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos comunes */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Hora</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Duración (minutos)</label>
            <input
              type="number"
              value={formData.duracion}
              onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
              className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
              min="15"
              step="15"
              required
            />
          </div>

          {/* Campos específicos por tipo */}
          {evento.actividad.tipo === 'llamada' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Resultado</label>
                <input
                  type="text"
                  value={formData.resultado}
                  onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  placeholder="Resultado de la llamada"
                />
              </div>
            </>
          )}

          {evento.actividad.tipo === 'reunion' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tipo de Reunión</label>
                <select
                  value={formData.tipoReunion}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoReunion: e.target.value as 'presencial' | 'virtual' | 'híbrida' }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrida">Híbrida</option>
                </select>
              </div>
              {formData.tipoReunion === 'presencial' && (
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Lugar</label>
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(e) => setFormData(prev => ({ ...prev, lugar: e.target.value }))}
                    className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                    placeholder="Ubicación de la reunión"
                  />
                </div>
              )}
              {formData.tipoReunion === 'virtual' && (
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Link de Reunión</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
            </>
          )}

          {evento.actividad.tipo === 'tarea' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value as 'baja' | 'media' | 'alta' | 'urgente' }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Asignar a</label>
                <select
                  value={formData.asignadoA}
                  onChange={(e) => setFormData(prev => ({ ...prev, asignadoA: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                >
                  <option value="">Seleccionar miembro del equipo</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={formData.fechaLimite}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaLimite: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </>
          )}

                     <div className="flex space-x-3 pt-6 border-t border-[#3a3d45]">
             <button
               type="submit"
               className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-6 rounded-lg hover:from-[#059669] hover:to-[#047857] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
             >
               ✏️ Actualizar Actividad
             </button>
             <button
               type="button"
               onClick={onClose}
               className="flex-1 bg-[#3a3d45] text-gray-300 py-3 px-6 rounded-lg hover:bg-[#4a4d55] transition-all duration-200 font-medium"
             >
               ❌ Cancelar
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}

// Modal para crear actividades
interface CreateActivityModalProps {
  onClose: () => void;
  onSubmit: (actividad: Omit<Actividad, 'id' | 'creadoPor' | 'fechaCreacion'>) => void;
  teamMembers: User[];
  tipoActividad: 'llamada' | 'reunion' | 'tarea';
  setTipoActividad: (tipo: 'llamada' | 'reunion' | 'tarea') => void;
  fechaSeleccionada: Date;
}

function CreateActivityModal({ onClose, onSubmit, teamMembers, tipoActividad, setTipoActividad, fechaSeleccionada }: CreateActivityModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: fechaSeleccionada.toISOString().split('T')[0],
    hora: '09:00',
    duracion: 60,
    telefono: '',
    resultado: '',
    tipoReunion: 'presencial' as 'presencial' | 'virtual' | 'híbrida',
    lugar: '',
    link: '',
    participantes: [] as string[],
    prioridad: 'media' as 'baja' | 'media' | 'alta' | 'urgente',
    asignadoA: '',
    fechaLimite: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const actividadBase = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: formData.fecha,
      hora: formData.hora,
      duracion: formData.duracion
    };

    let actividad: Omit<Actividad, 'id' | 'creadoPor' | 'fechaCreacion'>;

    switch (tipoActividad) {
      case 'llamada':
        actividad = {
          ...actividadBase,
          tipo: 'llamada',
          telefono: formData.telefono,
          resultado: formData.resultado,
          estado: 'pendiente'
        } as Llamada;
        break;
      
      case 'reunion':
        actividad = {
          ...actividadBase,
          tipo: 'reunion',
          tipoReunion: formData.tipoReunion,
          lugar: formData.lugar,
          link: formData.link,
          participantes: formData.participantes,
          estado: 'pendiente'
        } as Reunion;
        break;
      
      case 'tarea':
        actividad = {
          ...actividadBase,
          tipo: 'tarea',
          prioridad: formData.prioridad,
          estado: 'pendiente',
          asignadoA: formData.asignadoA,
          fechaLimite: formData.fechaLimite
        } as Tarea;
        break;
    }

    onSubmit(actividad);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2d35] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00b894] to-[#00a085] p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">✨ Nueva Actividad</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tipo de Actividad */}
        <div className="p-4 border-b border-[#3a3d45]">
          <label className="block text-gray-300 text-sm mb-3 font-medium">Tipo de Actividad</label>
          <div className="flex space-x-2">
            {(['llamada', 'reunion', 'tarea'] as const).map(tipo => (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoActividad(tipo)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tipoActividad === tipo
                    ? 'bg-[#00b894] text-white shadow-lg scale-105'
                    : 'bg-[#3a3d45] text-gray-300 hover:bg-[#4a4d55] hover:scale-102'
                }`}
              >
                {tipo === 'llamada' ? '📞 Llamada' : tipo === 'reunion' ? '🤝 Reunión' : '✅ Tarea'}
              </button>
            ))}
          </div>
        </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos comunes */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded-lg px-3 py-2.5 text-white focus:border-[#00b894] focus:outline-none transition-colors"
                  placeholder="Nombre de la actividad"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded-lg px-3 py-2.5 text-white focus:border-[#00b894] focus:outline-none transition-colors resize-none"
                  rows={2}
                  placeholder="Breve descripción de la actividad"
                  required
                />
              </div>
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Hora</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Duración (minutos)</label>
            <input
              type="number"
              value={formData.duracion}
              onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
              className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
              min="15"
              step="15"
              required
            />
          </div>

          {/* Campos específicos por tipo */}
          {tipoActividad === 'llamada' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Resultado</label>
                <input
                  type="text"
                  value={formData.resultado}
                  onChange={(e) => setFormData(prev => ({ ...prev, resultado: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  placeholder="Resultado de la llamada"
                />
              </div>
            </>
          )}

          {tipoActividad === 'reunion' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tipo de Reunión</label>
                <select
                  value={formData.tipoReunion}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipoReunion: e.target.value as 'presencial' | 'virtual' | 'híbrida' }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                >
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="híbrida">Híbrida</option>
                </select>
              </div>
              {formData.tipoReunion === 'presencial' && (
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Lugar</label>
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(e) => setFormData(prev => ({ ...prev, lugar: e.target.value }))}
                    className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                    placeholder="Ubicación de la reunión"
                  />
                </div>
              )}
              {formData.tipoReunion === 'virtual' && (
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Link de Reunión</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}
            </>
          )}

          {tipoActividad === 'tarea' && (
            <>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Prioridad</label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData(prev => ({ ...prev, prioridad: e.target.value as 'baja' | 'media' | 'alta' | 'urgente' }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Asignar a</label>
                <select
                  value={formData.asignadoA}
                  onChange={(e) => setFormData(prev => ({ ...prev, asignadoA: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                >
                  <option value="">Seleccionar miembro del equipo</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={formData.fechaLimite}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaLimite: e.target.value }))}
                  className="w-full bg-[#3a3d45] border border-[#4a4d55] rounded px-3 py-2 text-white"
                  required
                />
              </div>
            </>
          )}

            <div className="flex space-x-3 pt-6 border-t border-[#3a3d45]">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#00b894] to-[#00a085] text-white py-3 px-6 rounded-lg hover:from-[#00a085] hover:to-[#009874] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✨ Crear Actividad
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#3a3d45] text-gray-300 py-3 px-6 rounded-lg hover:bg-[#4a4d55] transition-all duration-200 font-medium"
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
