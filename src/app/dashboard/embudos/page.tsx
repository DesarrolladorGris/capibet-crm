'use client';

import { useState, useEffect } from 'react';
import { supabaseService, EspacioConEmbudos, EspacioTrabajoResponse, EmbUpdoResponse } from '@/services/supabaseService';
import NuevoEmbudoModal from '@/app/dashboard/configuracion/components/NuevoEmbudoModal';
import EditarEmbudoModal from '@/app/dashboard/configuracion/components/EditarEmbudoModal';
import ConfirmarEliminarEmbudoModal from '@/app/dashboard/configuracion/components/ConfirmarEliminarEmbudoModal';
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DraggableEmbudo from './components/DraggableEmbudo';

export default function EmbudosPage() {
  const [espaciosConEmbudos, setEspaciosConEmbudos] = useState<EspacioConEmbudos[]>([]);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [showNuevoEmbudoModal, setShowNuevoEmbudoModal] = useState(false);
  const [showEditarEmbudoModal, setShowEditarEmbudoModal] = useState(false);
  const [showEliminarEmbudoModal, setShowEliminarEmbudoModal] = useState(false);
  const [selectedEmbudo, setSelectedEmbudo] = useState<EmbUpdoResponse | null>(null);
  const [selectedEmbudoForDelete, setSelectedEmbudoForDelete] = useState<EmbUpdoResponse | null>(null);

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadEspaciosYEmbudos();
  }, []);

  const loadEspaciosYEmbudos = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Cargar espacios y embudos en paralelo
      const [espaciosResult, embudosResult] = await Promise.all([
        supabaseService.getAllEspaciosTrabajo(),
        supabaseService.getAllEmbudos()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        const espacios = espaciosResult.data;
        const embudos = embudosResult.success ? embudosResult.data || [] : [];
        
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
      } else {
        setError(espaciosResult.error || 'Error al cargar espacios de trabajo');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading espacios y embudos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEspacioSelect = (espacio: EspacioTrabajoResponse) => {
    setSelectedEspacio(espacio);
  };

  const handleAgregarEmbudo = () => {
    if (selectedEspacio) {
      setShowNuevoEmbudoModal(true);
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
    <div className="h-full flex">
      {/* Sidebar izquierdo - Selector de espacios */}
      <div className="w-80 bg-[#1a1d23] border-r border-[#3a3d45] p-4">
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-2">Espacios de trabajo</h2>
          <p className="text-gray-400 text-sm">Selecciona un espacio para ver sus embudos</p>
        </div>

        <div className="space-y-2">
          {espaciosConEmbudos.map((espacio) => (
            <button
              key={espacio.id}
              onClick={() => handleEspacioSelect(espacio)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedEspacio?.id === espacio.id
                  ? 'bg-[#00b894] border-[#00b894] text-white'
                  : 'bg-[#2a2d35] border-[#3a3d45] text-gray-300 hover:bg-[#3a3d45] hover:border-[#4a4d55]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {espacio.nombre}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {espacio.embudos.length} embudo{espacio.embudos.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-lg">
                  ⚙️
                </div>
              </div>
            </button>
          ))}
        </div>

        {espaciosConEmbudos.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">🏢</div>
            <p className="text-gray-400 text-sm">No hay espacios de trabajo</p>
          </div>
        )}
      </div>

      {/* Contenido principal - Embudos del espacio seleccionado */}
      <div className="flex-1 bg-[#2a2d35]">
        {selectedEspacio ? (
          <div className="h-full">
            {/* Header del espacio seleccionado */}
            <div className="bg-[#1a1d23] border-b border-[#3a3d45] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-white text-2xl font-bold flex items-center space-x-3">
                    <span>⚙️</span>
                    <span>{selectedEspacio.nombre.toUpperCase()}</span>
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {embudosDelEspacio.length} embudo{embudosDelEspacio.length !== 1 ? 's' : ''} • 
                    Creado el {new Date(selectedEspacio.creado_en).toLocaleDateString('es-ES')}
                  </p>
                </div>
                                 <div className="flex items-center space-x-3">
                   <button
                     onClick={handleAgregarEmbudo}
                     className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                   >
                     <span>+</span>
                     <span>Nuevo Embudo</span>
                   </button>
                   <button
                     onClick={() => console.log('Agregar nuevo chat')}
                     className="flex items-center space-x-2 bg-[#3498db] hover:bg-[#2980b9] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                   >
                     <span>💬</span>
                     <span>Nuevo Chat</span>
                   </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full">
                      {embudosDelEspacio.map((embudo, index) => (
                        <div key={embudo.id} className="h-full">
                          <DraggableEmbudo
                            embudo={embudo}
                            index={index}
                            onEdit={handleEditEmbudo}
                            onDelete={handleDeleteEmbudo}
                          />
                        </div>
                      ))}

                      {/* Botón para agregar nuevo embudo */}
                      <div 
                        onClick={handleAgregarEmbudo}
                        className="bg-[#1a1d23] border-2 border-dashed border-[#3a3d45] rounded-lg p-4 flex items-center justify-center hover:border-[#00b894] transition-colors cursor-pointer group h-full min-h-80"
                      >
                        <div className="text-center">
                          <div className="text-[#00b894] text-3xl mb-2 group-hover:scale-110 transition-transform">
                            +
                          </div>
                          <div className="text-gray-400 text-sm">
                            Agregar Embudo
                          </div>
                        </div>
                      </div>
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
                Elige un espacio de la lista para ver y gestionar sus embudos.
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
    </div>
  );
}
