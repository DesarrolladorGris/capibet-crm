'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseService, EspacioConEmbudos, EspacioTrabajoResponse, EmbUpdoResponse, MensajeResponse } from '@/services/supabaseService';
import NuevoEmbudoModal from '@/app/dashboard/configuracion/components/NuevoEmbudoModal';
import EditarEmbudoModal from '@/app/dashboard/configuracion/components/EditarEmbudoModal';
import ConfirmarEliminarEmbudoModal from '@/app/dashboard/configuracion/components/ConfirmarEliminarEmbudoModal';
import NuevoMensajeModal from './components/NuevoMensajeModal';
import DetallesMensajeModal from './components/DetallesMensajeModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
// import {
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import DraggableEmbudo from './components/DraggableEmbudo';

export default function EmbudosPage() {
  const [espaciosConEmbudos, setEspaciosConEmbudos] = useState<EspacioConEmbudos[]>([]);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [showNuevoEmbudoModal, setShowNuevoEmbudoModal] = useState(false);
  const [showEditarEmbudoModal, setShowEditarEmbudoModal] = useState(false);
  const [showEliminarEmbudoModal, setShowEliminarEmbudoModal] = useState(false);
  const [showNuevoMensajeModal, setShowNuevoMensajeModal] = useState(false);
  const [showDetallesMensajeModal, setShowDetallesMensajeModal] = useState(false);
  const [selectedEmbudo, setSelectedEmbudo] = useState<EmbUpdoResponse | null>(null);
  const [selectedEmbudoForDelete, setSelectedEmbudoForDelete] = useState<EmbUpdoResponse | null>(null);
  const [selectedMensaje, setSelectedMensaje] = useState<MensajeResponse | null>(null);

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadEspaciosYEmbudos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Cargar espacios, embudos y mensajes en paralelo
      const [espaciosResult, embudosResult, mensajesResult] = await Promise.all([
        supabaseService.getAllEspaciosTrabajo(),
        supabaseService.getAllEmbudos(),
        supabaseService.getAllMensajes()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        const espacios = espaciosResult.data;
        const embudos = embudosResult.success ? embudosResult.data || [] : [];
        const mensajesData = mensajesResult.success ? mensajesResult.data || [] : [];
        
        // Guardar los mensajes en el estado
        setMensajes(mensajesData);
        
        // Asociar embudos a sus espacios correspondientes y ordenarlos
        const espaciosConEmbudos: EspacioConEmbudos[] = espacios.map(espacio => ({
          ...espacio,
          embudos: embudos
            .filter(embudo => embudo.espacio_id === espacio.id)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0)) // Ordenar por campo orden
        }));
        
        setEspaciosConEmbudos(espaciosConEmbudos);
        
        // Seleccionar el primer espacio por defecto si no hay ninguno seleccionado
        if (!selectedEspacio && espacios.length > 0) {
          setSelectedEspacio(espacios[0]);
        }
        
        console.log('Espacios con embudos cargados:', espaciosConEmbudos);
        console.log('Mensajes cargados:', mensajesData);
      } else {
        setError(espaciosResult.error || 'Error al cargar espacios de trabajo');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading espacios y embudos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEspacio]);

  // Función para obtener mensajes de un embudo específico
  const getMensajesByEmbudo = useCallback((embudoId: number): MensajeResponse[] => {
    return mensajes.filter(mensaje => mensaje.embudo_id === embudoId);
  }, [mensajes]);

  useEffect(() => {
    loadEspaciosYEmbudos();
  }, [loadEspaciosYEmbudos]);

  const handleEspacioSelect = (espacio: EspacioTrabajoResponse) => {
    setSelectedEspacio(espacio);
  };

  const handleAgregarEmbudo = () => {
    if (selectedEspacio) {
      setShowNuevoEmbudoModal(true);
    }
  };

  const handleNuevoMensaje = () => {
    if (selectedEspacio) {
      setShowNuevoMensajeModal(true);
    }
  };

  const handleEditEmbudo = (embudo: EmbUpdoResponse) => {
    setSelectedEmbudo(embudo);
    setShowEditarEmbudoModal(true);
  };

  const handleDeleteEmbudo = (embudo: EmbUpdoResponse) => {
    setSelectedEmbudoForDelete(embudo);
    setShowEliminarEmbudoModal(true);
  };

  const handleEmbudoCreated = () => {
    loadEspaciosYEmbudos();
    setShowNuevoEmbudoModal(false);
  };

  const handleEmbudoUpdated = () => {
    loadEspaciosYEmbudos();
    setShowEditarEmbudoModal(false);
    setSelectedEmbudo(null);
  };

  const handleEmbudoDeleted = () => {
    loadEspaciosYEmbudos();
    setShowEliminarEmbudoModal(false);
    setSelectedEmbudoForDelete(null);
  };

  const handleMensajeCreated = () => {
    setShowNuevoMensajeModal(false);
    console.log('Mensaje creado exitosamente');
    // Recargar mensajes para mostrar el nuevo mensaje
    loadEspaciosYEmbudos();
  };

  const handleMensajeClick = (mensaje: MensajeResponse) => {
    console.log('handleMensajeClick llamado con mensaje:', mensaje);
    setSelectedMensaje(mensaje);
    setShowDetallesMensajeModal(true);
  };

  const handleCloseDetallesMensaje = () => {
    setShowDetallesMensajeModal(false);
    setSelectedMensaje(null);
  };

  const handleMensajeDeleted = () => {
    console.log('Mensaje eliminado, recargando datos');
    // Recargar mensajes para actualizar la vista
    loadEspaciosYEmbudos();
    setShowDetallesMensajeModal(false);
    setSelectedMensaje(null);
  };

  // Manejar el final del drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && selectedEspacio) {
      // Encontrar el espacio actual en la lista
      const espacioActual = espaciosConEmbudos.find(e => e.id === selectedEspacio.id);
      if (!espacioActual) return;

      const embudos = [...espacioActual.embudos];
      const oldIndex = embudos.findIndex(embudo => embudo.id === active.id);
      const newIndex = embudos.findIndex(embudo => embudo.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reordenar el array
        const newEmbudos = arrayMove(embudos, oldIndex, newIndex);
        
        // Actualizar el estado local inmediatamente para feedback visual
        setEspaciosConEmbudos(prevEspacios => 
          prevEspacios.map(espacio => 
            espacio.id === selectedEspacio.id 
              ? { ...espacio, embudos: newEmbudos }
              : espacio
          )
        );

        // Persistir el nuevo orden en la base de datos
        const embudosConOrden = newEmbudos.map((embudo, index) => ({
          id: embudo.id,
          orden: index
        }));

        supabaseService.updateEmbudosOrder(embudosConOrden)
          .then(result => {
            if (result.success) {
              console.log('Orden persistido exitosamente en la base de datos');
            } else {
              console.error('Error al persistir orden:', result.error);
            }
          })
          .catch(err => {
            console.error('Error al actualizar orden:', err);
          });

        console.log('Nuevo orden de embudos:', newEmbudos.map((e, i) => ({ id: e.id, nombre: e.nombre, newIndex: i })));
      }
    }
  };

  // Obtener embudos del espacio seleccionado
  const embudosDelEspacio = selectedEspacio 
    ? espaciosConEmbudos.find(e => e.id === selectedEspacio.id)?.embudos || []
    : [];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-white">Cargando espacios y embudos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header con selector de espacio */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Selector de Espacio */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button className="text-gray-400 hover:text-white p-1 rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="relative">
                <select
                  value={selectedEspacio?.id || ''}
                  onChange={(e) => {
                    const espacioId = parseInt(e.target.value);
                    const espacio = espaciosConEmbudos.find(e => e.id === espacioId);
                    if (espacio) {
                      handleEspacioSelect(espacio);
                    }
                  }}
                  className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] appearance-none cursor-pointer pr-8"
                >
                  <option value="">Seleccionar Espacio</option>
                  {espaciosConEmbudos.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Tabs de navegación */}
            <div className="flex space-x-4 ml-8">
              <button className="text-white font-medium px-3 py-1 bg-[#00b894] rounded text-sm">
                Todos
              </button>
              <button className="text-gray-400 hover:text-white font-medium px-3 py-1 hover:bg-[#2a2d35] rounded text-sm">
                Mis Chats
              </button>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNuevoMensaje}
              disabled={!selectedEspacio}
              className="bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              + Nuevo Mensaje
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Embudos */}
      <div className="flex-1 bg-[#1a1d23]">
        {selectedEspacio ? (
          <div className="h-full">
            {/* Información del espacio seleccionado */}
            <div className="px-6 py-4 border-b border-[#3a3d45]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    {embudosDelEspacio.length} embudo{embudosDelEspacio.length !== 1 ? 's' : ''} • 
                    Creado el {new Date(selectedEspacio.creado_en).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de embudos */}
            <div className="p-6">
              {embudosDelEspacio.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={embudosDelEspacio.map(embudo => embudo.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {embudosDelEspacio.map((embudo, index) => (
                        <div key={embudo.id}>
                          <DraggableEmbudo
                            embudo={embudo}
                            index={index}
                            mensajes={getMensajesByEmbudo(embudo.id)}
                            onEdit={handleEditEmbudo}
                            onDelete={handleDeleteEmbudo}
                            onMensajeClick={handleMensajeClick}
                          />
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-white text-lg font-medium mb-2">No hay embudos en este espacio</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Crea tu primer embudo para comenzar a gestionar tu flujo de trabajo.
                  </p>
                  <button 
                    onClick={handleAgregarEmbudo}
                    className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    + Crear Primer Embudo
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">⚙️</div>
              <h3 className="text-white text-lg font-medium mb-2">Selecciona un espacio de trabajo</h3>
              <p className="text-gray-400 text-sm">
                Elige un espacio del selector para ver y gestionar sus embudos.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {selectedEspacio && (
        <NuevoEmbudoModal
          isOpen={showNuevoEmbudoModal}
          onClose={() => setShowNuevoEmbudoModal(false)}
          onEmbudoCreated={handleEmbudoCreated}
          espacioId={selectedEspacio.id}
          espacioNombre={selectedEspacio.nombre}
        />
      )}

      <EditarEmbudoModal
        isOpen={showEditarEmbudoModal}
        onClose={() => {
          setShowEditarEmbudoModal(false);
          setSelectedEmbudo(null);
        }}
        onEmbudoUpdated={handleEmbudoUpdated}
        embudo={selectedEmbudo}
      />

      <ConfirmarEliminarEmbudoModal
        isOpen={showEliminarEmbudoModal}
        onClose={() => {
          setShowEliminarEmbudoModal(false);
          setSelectedEmbudoForDelete(null);
        }}
        onEmbudoDeleted={handleEmbudoDeleted}
        embudo={selectedEmbudoForDelete}
      />

      <NuevoMensajeModal
        isOpen={showNuevoMensajeModal}
        onClose={() => setShowNuevoMensajeModal(false)}
        onMensajeCreated={handleMensajeCreated}
        espacioId={selectedEspacio?.id}
      />

      <DetallesMensajeModal
        isOpen={showDetallesMensajeModal}
        onClose={handleCloseDetallesMensaje}
        mensaje={selectedMensaje}
        onMensajeDeleted={handleMensajeDeleted}
      />
    </div>
  );
}
