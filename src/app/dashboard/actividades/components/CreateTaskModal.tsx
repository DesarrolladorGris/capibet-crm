'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TeamMemberSelector from './TeamMemberSelector';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskData) => void;
  initialDate?: string;
  initialTime?: string;
}

interface TaskData {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  duracion: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  categoria: string;
  etiquetas: string[];
  asignados: string[];
  fechaLimite?: string;
  recordatorio?: string;
}

interface TaskErrors {
  titulo?: string;
  fecha?: string;
  hora?: string;
  asignados?: string;
}

export default function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDate = '',
  initialTime = ''
}: CreateTaskModalProps) {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [taskData, setTaskData] = useState<TaskData>({
    titulo: '',
    descripcion: '',
    fecha: initialDate || new Date().toISOString().split('T')[0],
    hora: initialTime || '09:00',
    duracion: 60,
    prioridad: 'media',
    categoria: '',
    etiquetas: [''],
    asignados: user ? [user.id] : [],
    fechaLimite: '',
    recordatorio: ''
  });

  const [errors, setErrors] = useState<TaskErrors>({});

  const categories = [
    'Ventas', 'Marketing', 'Tecnología', 'Recursos Humanos', 
    'Finanzas', 'Operaciones', 'Servicio al Cliente', 'Desarrollo'
  ];

  const priorities = [
    { value: 'baja', label: 'Baja', color: 'text-green-400', bgColor: 'bg-green-500' },
    { value: 'media', label: 'Media', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
    { value: 'alta', label: 'Alta', color: 'text-orange-400', bgColor: 'bg-orange-500' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-400', bgColor: 'bg-red-500' }
  ];

  const reminders = [
    { value: '', label: 'Sin recordatorio' },
    { value: '15min', label: '15 minutos antes' },
    { value: '30min', label: '30 minutos antes' },
    { value: '1h', label: '1 hora antes' },
    { value: '1d', label: '1 día antes' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: TaskErrors = {};

    if (step === 1) {
      if (!taskData.titulo.trim()) newErrors.titulo = 'El título es obligatorio';
      if (!taskData.fecha) newErrors.fecha = 'La fecha es obligatoria';
      if (!taskData.hora) newErrors.hora = 'La hora es obligatoria';
    }

    if (step === 2) {
      if (taskData.asignados.length === 0) newErrors.asignados = 'Debe asignar al menos un miembro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onSubmit(taskData);
      onClose();
      setActiveStep(1);
      setTaskData({
        titulo: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        duracion: 60,
        prioridad: 'media',
        categoria: '',
        etiquetas: [''],
        asignados: user ? [user.id] : [],
        fechaLimite: '',
        recordatorio: ''
      });
    }
  };

  const addEtiqueta = () => {
    setTaskData({
      ...taskData,
      etiquetas: [...taskData.etiquetas, '']
    });
  };

  const removeEtiqueta = (index: number) => {
    const etiquetas = taskData.etiquetas.filter((_, i) => i !== index);
    setTaskData({ ...taskData, etiquetas });
  };

  const updateEtiqueta = (index: number, value: string) => {
    const etiquetas = [...taskData.etiquetas];
    etiquetas[index] = value;
    setTaskData({ ...taskData, etiquetas });
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2a2d35] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#3a3d45]">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Crear Nueva Tarea</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-4 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= activeStep 
                    ? 'bg-[#00b894] text-white' 
                    : 'bg-[#3a3d45] text-gray-400'
                }`}>
                  {step < activeStep ? '✓' : step}
                </div>
                <span className={`ml-2 text-sm ${
                  step <= activeStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step === 1 ? 'Información' : step === 2 ? 'Asignación' : 'Configuración'}
                </span>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ml-2 ${
                    step < activeStep ? 'bg-[#00b894]' : 'bg-[#3a3d45]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Información básica */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Título de la tarea *
                  </label>
                  <input
                    type="text"
                    value={taskData.titulo}
                    onChange={(e) => setTaskData({...taskData, titulo: e.target.value})}
                    className={`w-full bg-[#1a1d23] border rounded px-3 py-2 text-white placeholder-gray-400 ${
                      errors.titulo ? 'border-red-500' : 'border-[#3a3d45]'
                    }`}
                    placeholder="Ej: Revisar propuesta comercial"
                  />
                  {errors.titulo && <p className="text-red-400 text-xs mt-1">{errors.titulo}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={taskData.descripcion}
                    onChange={(e) => setTaskData({...taskData, descripcion: e.target.value})}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
                    placeholder="Describe los detalles de la tarea..."
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={taskData.fecha}
                    onChange={(e) => setTaskData({...taskData, fecha: e.target.value})}
                    className={`w-full bg-[#1a1d23] border rounded px-3 py-2 text-white ${
                      errors.fecha ? 'border-red-500' : 'border-[#3a3d45]'
                    }`}
                  />
                  {errors.fecha && <p className="text-red-400 text-xs mt-1">{errors.fecha}</p>}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={taskData.hora}
                    onChange={(e) => setTaskData({...taskData, hora: e.target.value})}
                    className={`w-full bg-[#1a1d23] border rounded px-3 py-2 text-white ${
                      errors.hora ? 'border-red-500' : 'border-[#3a3d45]'
                    }`}
                  />
                  {errors.hora && <p className="text-red-400 text-xs mt-1">{errors.hora}</p>}
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={taskData.duracion}
                    onChange={(e) => setTaskData({...taskData, duracion: parseInt(e.target.value) || 60})}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
                    min="15"
                    step="15"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Categoría
                  </label>
                  <select
                    value={taskData.categoria}
                    onChange={(e) => setTaskData({...taskData, categoria: e.target.value})}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Asignación */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Asignar a miembros del equipo *
                </label>
                <TeamMemberSelector
                  selectedMembers={taskData.asignados}
                  onMembersChange={(members) => setTaskData({...taskData, asignados: members})}
                  multiple={true}
                  placeholder="Seleccionar miembros del equipo"
                />
                {errors.asignados && <p className="text-red-400 text-xs mt-1">{errors.asignados}</p>}
              </div>

              <div className="bg-[#1a1d23] p-4 rounded-lg">
                <h4 className="text-white font-medium mb-3">Miembros seleccionados:</h4>
                {taskData.asignados.length === 0 ? (
                  <p className="text-gray-400 text-sm">No hay miembros asignados</p>
                ) : (
                  <div className="space-y-2">
                    {taskData.asignados.map(memberId => {
                      // Aquí deberías obtener la información del miembro desde el contexto
                      const memberName = memberId === user?.id ? user.name : `Miembro ${memberId}`;
                      return (
                        <div key={memberId} className="flex items-center justify-between bg-[#2a2d35] p-2 rounded">
                          <span className="text-white text-sm">{memberName}</span>
                          <button
                            onClick={() => setTaskData({
                              ...taskData, 
                              asignados: taskData.asignados.filter(id => id !== memberId)
                            })}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Configuración avanzada */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Prioridad
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorities.map(priority => (
                      <button
                        key={priority.value}
                                                 onClick={() => setTaskData({...taskData, prioridad: priority.value as 'baja' | 'media' | 'alta' | 'urgente'})}
                        className={`p-2 rounded text-sm font-medium transition-colors ${
                          taskData.prioridad === priority.value
                            ? `${priority.bgColor} text-white`
                            : 'bg-[#1a1d23] text-gray-400 hover:text-white hover:bg-[#3a3d45]'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Recordatorio
                  </label>
                  <select
                    value={taskData.recordatorio}
                    onChange={(e) => setTaskData({...taskData, recordatorio: e.target.value})}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
                  >
                    {reminders.map(reminder => (
                      <option key={reminder.value} value={reminder.value}>
                        {reminder.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={taskData.fechaLimite}
                    onChange={(e) => setTaskData({...taskData, fechaLimite: e.target.value})}
                    className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Etiquetas
                </label>
                {taskData.etiquetas.map((etiqueta, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Etiqueta"
                      value={etiqueta}
                      onChange={(e) => updateEtiqueta(index, e.target.value)}
                      className="flex-1 bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
                    />
                    {taskData.etiquetas.length > 1 && (
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3a3d45] flex justify-between">
          <div>
            {activeStep > 1 && (
              <button
                onClick={handlePrevious}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Anterior
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            {activeStep < 3 ? (
              <button
                onClick={handleNext}
                className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Crear Tarea
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
