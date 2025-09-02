'use client';

import { useState, useEffect } from 'react';
import CreateTaskModal from './CreateTaskModal';

interface Evento {
  id: string;
  titulo: string;
  tipo: 'llamada' | 'reunion' | 'tarea';
  fecha: string;
  hora: string;
  duracion?: number;
  descripcion: string;
  color: string;
  asignados?: string[];
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  categoria?: string;
}

export default function CalendarioTab() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: '1',
      titulo: 'Llamada con Cliente ABC',
      tipo: 'llamada',
      fecha: '2024-01-15',
      hora: '10:00',
      duracion: 30,
      descripcion: 'Seguimiento de propuesta comercial',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      titulo: 'Reunión de Ventas',
      tipo: 'reunion',
      fecha: '2024-01-15',
      hora: '14:00',
      duracion: 60,
      descripcion: 'Revisión semanal de objetivos',
      color: 'bg-green-500'
    },
    {
      id: '3',
      titulo: 'Revisar Propuesta',
      tipo: 'tarea',
      fecha: '2024-01-16',
      hora: '09:00',
      descripcion: 'Analizar propuesta para cliente premium',
      color: 'bg-orange-500'
    }
  ]);

  const [showNuevoEvento, setShowNuevoEvento] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    tipo: 'llamada' as 'llamada' | 'reunion' | 'tarea',
    fecha: '',
    hora: '',
    duracion: 30,
    descripcion: ''
  });

  useEffect(() => {
    // Actualizar fecha actual cada minuto
    const interval = setInterval(() => {
      setFechaActual(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNuevoEvento = () => {
    if (nuevoEvento.titulo && nuevoEvento.fecha && nuevoEvento.hora) {
      const evento: Evento = {
        id: Date.now().toString(),
        ...nuevoEvento,
        color: getColorByTipo(nuevoEvento.tipo)
      };
      setEventos([...eventos, evento]);
      setNuevoEvento({
        titulo: '',
        tipo: 'llamada',
        fecha: '',
        hora: '',
        duracion: 30,
        descripcion: ''
      });
      setShowNuevoEvento(false);
    }
  };

  const handleCreateTask = (taskData: {
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
  }) => {
    const evento: Evento = {
      id: Date.now().toString(),
      titulo: taskData.titulo,
      tipo: 'tarea',
      fecha: taskData.fecha,
      hora: taskData.hora,
      duracion: taskData.duracion,
      descripcion: taskData.descripcion,
      color: getColorByTipo('tarea'),
      asignados: taskData.asignados,
      prioridad: taskData.prioridad,
      categoria: taskData.categoria
    };
    setEventos([...eventos, evento]);
  };

  const handleDateClick = (fecha: string) => {
    setSelectedDate(fecha);
    setSelectedTime('09:00');
    setShowCreateTask(true);
  };

  const getColorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'llamada': return 'bg-blue-500';
      case 'reunion': return 'bg-green-500';
      case 'tarea': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'llamada': return '📞';
      case 'reunion': return '🤝';
      case 'tarea': return '✅';
      default: return '📅';
    }
  };

  const getDiasSemana = () => {
    const dias = [];
    const inicioSemana = new Date(fechaActual);
    inicioSemana.setDate(fechaActual.getDate() - fechaActual.getDay());
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      dias.push(fecha);
    }
    return dias;
  };

  const getEventosDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventos.filter(e => e.fecha === fechaStr);
  };



  const renderVistaDia = () => {
    const eventosHoy = getEventosDia(fechaActual);
    const horas = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white text-xl font-medium">
            {fechaActual.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        <div className="bg-[#1a1d23] rounded-lg p-4">
          {horas.map(hora => {
            const eventosHora = eventosHoy.filter(e => parseInt(e.hora.split(':')[0]) === hora);
            return (
              <div key={hora} className="flex border-b border-[#3a3d45] last:border-b-0">
                <div className="w-20 p-2 text-gray-400 text-sm font-medium">
                  {hora.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {eventosHora.map(evento => (
                    <div
                      key={evento.id}
                      className={`${evento.color} text-white p-2 rounded mb-2 text-sm`}
                    >
                      <div className="font-medium">{evento.titulo}</div>
                      <div className="text-xs opacity-90">{evento.hora} - {evento.descripcion}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVistaSemana = () => {
    const diasSemana = getDiasSemana();

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white text-xl font-medium">
            Semana del {diasSemana[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al {diasSemana[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {diasSemana.map((dia, index) => {
            const eventosDia = getEventosDia(dia);
            const esHoy = dia.toDateString() === fechaActual.toDateString();
            
            return (
              <div key={index} className={`bg-[#1a1d23] rounded-lg p-2 ${esHoy ? 'ring-2 ring-[#00b894]' : ''}`}>
                <div className="text-center mb-2">
                  <div className={`text-sm font-medium ${esHoy ? 'text-[#00b894]' : 'text-gray-400'}`}>
                    {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-bold ${esHoy ? 'text-[#00b894]' : 'text-white'}`}>
                    {dia.getDate()}
                  </div>
                </div>
                <div className="space-y-1">
                  {eventosDia.slice(0, 3).map(evento => (
                    <div
                      key={evento.id}
                      className={`${evento.color} text-white p-1 rounded text-xs truncate`}
                      title={evento.titulo}
                    >
                      {evento.titulo}
                    </div>
                  ))}
                  {eventosDia.length > 3 && (
                    <div className="text-gray-400 text-xs text-center">
                      +{eventosDia.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVistaMes = () => {
    const primerDia = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const inicioCalendario = new Date(primerDia);
    inicioCalendario.setDate(primerDia.getDate() - primerDia.getDay());
    
    const dias = [];
    for (let i = 0; i < 42; i++) {
      const fecha = new Date(inicioCalendario);
      fecha.setDate(inicioCalendario.getDate() + i);
      dias.push(fecha);
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-white text-xl font-medium">
            {fechaActual.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <div key={dia} className="p-2 text-center text-gray-400 text-sm font-medium">
              {dia}
            </div>
          ))}
          {dias.map((dia, index) => {
            const eventosDia = getEventosDia(dia);
            const esHoy = dia.toDateString() === fechaActual.toDateString();
            const esMesActual = dia.getMonth() === fechaActual.getMonth();
            
            return (
                             <div
                 key={index}
                 className={`min-h-[80px] p-1 border border-[#3a3d45] ${
                   esHoy ? 'bg-[#00b894] bg-opacity-20' : ''
                 } cursor-pointer hover:bg-[#3a3d45] transition-colors`}
                 onClick={() => handleDateClick(dia.toISOString().split('T')[0])}
               >
                <div className={`text-right text-sm mb-1 ${
                  esHoy ? 'text-[#00b894] font-bold' : esMesActual ? 'text-white' : 'text-gray-600'
                }`}>
                  {dia.getDate()}
                </div>
                <div className="space-y-1">
                  {eventosDia.slice(0, 2).map(evento => (
                    <div
                      key={evento.id}
                      className={`${evento.color} text-white p-1 rounded text-xs truncate`}
                      title={evento.titulo}
                    >
                      {evento.titulo}
                    </div>
                  ))}
                  {eventosDia.length > 2 && (
                    <div className="text-gray-400 text-xs text-center">
                      +{eventosDia.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVista = () => {
    switch (vista) {
      case 'dia':
        return renderVistaDia();
      case 'semana':
        return renderVistaSemana();
      case 'mes':
        return renderVistaMes();
      default:
        return renderVistaSemana();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const nuevaFecha = new Date(fechaActual);
              nuevaFecha.setDate(fechaActual.getDate() - 1);
              setFechaActual(nuevaFecha);
            }}
            className="bg-[#1a1d23] hover:bg-[#2a2d35] text-white p-2 rounded-lg transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setFechaActual(new Date())}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => {
              const nuevaFecha = new Date(fechaActual);
              nuevaFecha.setDate(fechaActual.getDate() + 1);
              setFechaActual(nuevaFecha);
            }}
            className="bg-[#1a1d23] hover:bg-[#2a2d35] text-white p-2 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVista('dia')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              vista === 'dia' 
                ? 'bg-[#00b894] text-white' 
                : 'bg-[#1a1d23] text-gray-400 hover:text-white'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setVista('semana')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              vista === 'semana' 
                ? 'bg-[#00b894] text-white' 
                : 'bg-[#1a1d23] text-gray-400 hover:text-white'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setVista('mes')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              vista === 'mes' 
                ? 'bg-[#00b894] text-white' 
                : 'bg-[#1a1d23] text-gray-400 hover:text-white'
            }`}
          >
            Mes
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>✅</span>
            <span>Nueva Tarea</span>
          </button>
          <button
            onClick={() => setShowNuevoEvento(true)}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>📅</span>
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Modal Nuevo Evento */}
      {showNuevoEvento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white text-lg font-medium mb-4">Nuevo Evento</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título del evento"
                value={nuevoEvento.titulo}
                onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <select
                value={nuevoEvento.tipo}
                                 onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value as 'llamada' | 'reunion' | 'tarea'})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              >
                <option value="llamada">Llamada</option>
                <option value="reunion">Reunión</option>
                <option value="tarea">Tarea</option>
              </select>
              <input
                type="date"
                value={nuevoEvento.fecha}
                onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <input
                type="time"
                value={nuevoEvento.hora}
                onChange={(e) => setNuevoEvento({...nuevoEvento, hora: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Duración (minutos)"
                value={nuevoEvento.duracion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, duracion: parseInt(e.target.value) || 30})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <textarea
                placeholder="Descripción"
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 h-20 resize-none"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNuevoEvento(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevoEvento}
                className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista del Calendario */}
      <div className="bg-[#2a2d35] rounded-lg p-6">
        {renderVista()}
      </div>

             {/* Lista de Eventos Próximos */}
       <div className="bg-[#1a1d23] rounded-lg p-6">
         <h3 className="text-white text-lg font-medium mb-4">Eventos Próximos</h3>
         <div className="space-y-3">
           {eventos
             .filter(e => new Date(e.fecha) >= new Date())
             .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
             .slice(0, 5)
             .map(evento => (
               <div key={evento.id} className="flex items-center space-x-3 p-3 bg-[#2a2d35] rounded-lg">
                 <div className={`w-3 h-3 rounded-full ${evento.color}`}></div>
                 <div className="flex-1">
                   <div className="text-white font-medium">{evento.titulo}</div>
                   <div className="text-gray-400 text-sm">
                     {evento.fecha} a las {evento.hora} - {evento.descripcion}
                   </div>
                   {evento.tipo === 'tarea' && evento.asignados && (
                     <div className="text-blue-400 text-xs mt-1">
                       Asignado a: {evento.asignados.length} miembro{evento.asignados.length !== 1 ? 's' : ''}
                     </div>
                   )}
                 </div>
                 <span className="text-2xl">{getIconByTipo(evento.tipo)}</span>
               </div>
             ))}
         </div>
       </div>

       {/* Modal de Creación de Tareas */}
       <CreateTaskModal
         isOpen={showCreateTask}
         onClose={() => setShowCreateTask(false)}
         onSubmit={handleCreateTask}
         initialDate={selectedDate}
         initialTime={selectedTime}
       />
     </div>
   );
 }
