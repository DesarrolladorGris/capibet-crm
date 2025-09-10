'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/utils/auth';

// Tipos para las tareas
interface Task {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora: string;
  categoria: 'trabajo' | 'personal' | 'reunion' | 'llamada' | 'otro';
  prioridad: 'alta' | 'media' | 'baja';
  completada: boolean;
  color: string;
}

// Datos de ejemplo
const taskData: Task[] = [
  {
    id: 1,
    titulo: 'Reunión con cliente',
    descripcion: 'Revisión del proyecto Q4',
    fecha: '2025-09-15',
    hora: '10:00',
    categoria: 'reunion',
    prioridad: 'alta',
    completada: false,
    color: '#ff6b6b'
  },
  {
    id: 2,
    titulo: 'Llamada de seguimiento',
    descripcion: 'Seguimiento de propuesta comercial',
    fecha: '2025-09-15',
    hora: '14:30',
    categoria: 'llamada',
    prioridad: 'media',
    completada: false,
    color: '#4ecdc4'
  }
];

const categorias = [
  { id: 'trabajo', label: 'Trabajo', color: '#4ecdc4' },
  { id: 'personal', label: 'Personal', color: '#45b7d1' },
  { id: 'reunion', label: 'Reunión', color: '#ff6b6b' },
  { id: 'llamada', label: 'Llamada', color: '#96ceb4' },
  { id: 'otro', label: 'Otro', color: '#feca57' }
];

const prioridades = [
  { id: 'alta', label: 'Alta', color: '#ff6b6b' },
  { id: 'media', label: 'Media', color: '#feca57' },
  { id: 'baja', label: 'Baja', color: '#96ceb4' }
];

export default function CalendarioPage() {
  const [tasks, setTasks] = useState<Task[]>(taskData);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const router = useRouter();

  // Form state para nueva tarea
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    categoria: 'trabajo' as Task['categoria'],
    prioridad: 'media' as Task['prioridad']
  });

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Obtener días del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Obtener tareas para una fecha específica
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.fecha === dateStr);
  };

  // Manejar navegación de mes
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Abrir modal para nueva tarea
  const openNewTaskModal = (date?: string) => {
    setEditingTask(null);
    setFormData({
      titulo: '',
      descripcion: '',
      fecha: date || '',
      hora: '',
      categoria: 'trabajo',
      prioridad: 'media'
    });
    setShowTaskModal(true);
  };

  // Abrir modal para editar tarea
  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      fecha: task.fecha,
      hora: task.hora,
      categoria: task.categoria,
      prioridad: task.prioridad
    });
    setShowTaskModal(true);
  };

  // Guardar tarea
  const handleSaveTask = () => {
    if (!formData.titulo || !formData.fecha || !formData.hora) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const categoria = categorias.find(c => c.id === formData.categoria);
    const taskData: Task = {
      id: editingTask ? editingTask.id : Date.now(),
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: formData.fecha,
      hora: formData.hora,
      categoria: formData.categoria,
      prioridad: formData.prioridad,
      completada: editingTask ? editingTask.completada : false,
      color: categoria?.color || '#4ecdc4'
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      setTasks([...tasks, taskData]);
    }

    setShowTaskModal(false);
  };

  // Eliminar tarea
  const handleDeleteTask = (taskId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // Marcar tarea como completada
  const toggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completada: !t.completada } : t
    ));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Calendario */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-semibold text-2xl">Calendario</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Botones de vista */}
            <div className="flex items-center bg-[#2a2d35] rounded-lg border border-[#3a3d45]">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-[#00b894] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
                </button>
              ))}
            </div>

            <button 
              onClick={() => openNewTaskModal()}
              className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación del calendario */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="text-gray-400 hover:text-white p-2 rounded"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-white font-semibold text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="text-gray-400 hover:text-white p-2 rounded"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-gray-400 hover:text-white text-sm px-3 py-1 rounded border border-[#3a3d45] hover:border-gray-400"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 bg-[#1a1d23] p-6">
        {/* Vista de mes */}
        {viewMode === 'month' && (
          <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45]">
            {/* Header de días */}
            <div className="grid grid-cols-7 border-b border-[#3a3d45]">
              {dayNames.map((day) => (
                <div key={day} className="p-4 text-center text-gray-400 font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const dayStr = day.toISOString().split('T')[0];
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = dayStr === todayStr;
                const dayTasks = getTasksForDate(day);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-[#3a3d45] p-2 ${
                      !isCurrentMonth ? 'bg-[#1a1d23] opacity-50' : 'hover:bg-[#3a3d45]'
                    } transition-colors cursor-pointer`}
                    onClick={() => openNewTaskModal(dayStr)}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday 
                        ? 'bg-[#00b894] text-white w-6 h-6 rounded-full flex items-center justify-center' 
                        : isCurrentMonth 
                          ? 'text-white' 
                          : 'text-gray-500'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Tareas del día */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer transition-opacity ${
                            task.completada ? 'opacity-50 line-through' : ''
                          }`}
                          style={{ backgroundColor: task.color + '20', color: task.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditTaskModal(task);
                          }}
                          title={`${task.hora} - ${task.titulo}`}
                        >
                          {task.hora} {task.titulo}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{dayTasks.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de tareas para hoy (sidebar derecho) */}
        <div className="mt-6">
          <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] p-4">
            <h3 className="text-white font-semibold mb-4">Tareas de Hoy</h3>
            <div className="space-y-3">
              {getTasksForDate(today).length > 0 ? (
                getTasksForDate(today).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 bg-[#1a1d23] rounded border border-[#3a3d45] ${
                      task.completada ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completada}
                        onChange={() => toggleTaskComplete(task.id)}
                        className="w-4 h-4 text-[#00b894] bg-[#1a1d23] border-[#3a3d45] rounded focus:ring-[#00b894] focus:ring-2"
                      />
                      <div>
                        <div className={`text-white font-medium ${task.completada ? 'line-through' : ''}`}>
                          {task.titulo}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {task.hora} • {categorias.find(c => c.id === task.categoria)?.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: task.color }}
                      />
                      <button
                        onClick={() => openEditTaskModal(task)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-400 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">
                  No hay tareas programadas para hoy
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva/Editar Tarea */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] w-full max-w-md mx-4">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-[#3a3d45]">
              <h3 className="text-white font-semibold">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                  placeholder="Título de la tarea"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] resize-none"
                  rows={3}
                  placeholder="Descripción de la tarea"
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Hora *</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                  />
                </div>
              </div>

              {/* Categoría y Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as Task['categoria'] })}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Task['prioridad'] })}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                  >
                    {prioridades.map((pri) => (
                      <option key={pri.id} value={pri.id}>
                        {pri.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[#3a3d45]">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTask}
                className="px-4 py-2 bg-[#00b894] hover:bg-[#00a085] text-white rounded transition-colors"
              >
                {editingTask ? 'Actualizar' : 'Crear'} Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
