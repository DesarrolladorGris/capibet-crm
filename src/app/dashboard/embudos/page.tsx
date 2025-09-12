'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabaseService, EspacioConEmbudos, EspacioTrabajoResponse, EmbUpdoResponse, MensajeResponse, Canal } from '@/services/supabaseService';
import NuevoEmbudoModal from '@/app/dashboard/configuracion/components/NuevoEmbudoModal';
import EditarEmbudoModal from '@/app/dashboard/configuracion/components/EditarEmbudoModal';
import ConfirmarEliminarEmbudoModal from '@/app/dashboard/configuracion/components/ConfirmarEliminarEmbudoModal';
import NuevoMensajeModal from './components/NuevoMensajeModal';
import DetallesMensajeModal from './components/DetallesMensajeModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
// import {
//   useSortable,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
import DraggableEmbudo from './components/DraggableEmbudo';
import { BarChart3 } from 'lucide-react';

export default function EmbudosPage() {
  const [espaciosConEmbudos, setEspaciosConEmbudos] = useState<EspacioConEmbudos[]>([]);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
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

  // Estados para drag & drop
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Distancia mínima para activar drag
      },
    })
  );

  const loadEspaciosYEmbudos = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Cargar espacios, embudos, mensajes y canales en paralelo
      const [espaciosResult, embudosResult, mensajesResult, canalesResult] = await Promise.all([
        supabaseService.getAllEspaciosTrabajo(),
        supabaseService.getAllEmbudos(),
        supabaseService.getAllMensajes(),
        supabaseService.getAllCanales()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        const espacios = espaciosResult.data;
        const embudos = embudosResult.success ? embudosResult.data || [] : [];
        const mensajesData = mensajesResult.success ? mensajesResult.data || [] : [];
        const canalesData = canalesResult.success ? canalesResult.data || [] : [];
        
        // Guardar los mensajes y canales en el estado
        setMensajes(mensajesData);
        setCanales(canalesData);
        
        // Asociar embudos a sus espacios correspondientes y ordenarlos
        const espaciosConEmbudos: EspacioConEmbudos[] = espacios.map(espacio => ({
          ...espacio,
          embudos: embudos
            .filter(embudo => embudo.espacio_id === espacio.id)
            .sort((a, b) => (a.orden || 0) - (b.orden || 0)) // Ordenar por campo orden
        }));
        
        setEspaciosConEmbudos(espaciosConEmbudos);
        
        // Seleccionar el primer espacio por defecto si no hay ninguno seleccionado
        setSelectedEspacio(prevSelected => {
          if (!prevSelected && espacios.length > 0) {
            return espacios[0];
          }
          return prevSelected;
        });
        
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
  }, []); // Removí selectedEspacio de las dependencias

  // Función para obtener el tipo de canal por ID
  const getCanalTipo = useCallback((canalId: number): string | undefined => {
    const canal = canales.find(c => c.id === canalId);
    return canal?.tipo;
  }, [canales]);

  // Función para obtener mensajes de un embudo específico con tipo de canal
  const getMensajesByEmbudo = useCallback((embudoId: number): MensajeResponse[] => {
    return mensajes
      .filter(mensaje => mensaje.embudo_id === embudoId)
      .map(mensaje => ({
        ...mensaje,
        tipo: getCanalTipo(mensaje.canal_id) // Enriquecer con tipo de canal
      }));
  }, [mensajes, getCanalTipo]);

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

  const handleMensajeMoved = async (mensajeId: number, nuevoEmbudoId: number) => {
    console.log('Iniciando movimiento de mensaje:', mensajeId, 'al embudo:', nuevoEmbudoId);
    
    try {
      // 1. Llamar al servicio para persistir el cambio en la base de datos
      const result = await mensajesService.moveMensajeToEmbudo(mensajeId, nuevoEmbudoId);
      
      if (result.success) {
        console.log('Mensaje movido exitosamente en la base de datos');
        
        // 2. Actualizar el estado local para feedback inmediato
        setMensajes(prevMensajes => 
          prevMensajes.map(mensaje => 
            mensaje.id === mensajeId 
              ? { ...mensaje, embudo_id: nuevoEmbudoId }
              : mensaje
          )
        );
        
        // 3. Recargar datos para asegurar consistencia (opcional, ya que el estado local está actualizado)
        // loadEspaciosYEmbudos();
      } else {
        console.error('Error al mover mensaje:', result.error);
        // Aquí podrías mostrar una notificación de error al usuario
      }
    } catch (error) {
      console.error('Error inesperado al mover mensaje:', error);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };

  // Manejar el inicio del drag
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(String(event.active.id));
  };

  // Manejar el final del drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { active: active.id, over: over?.id });
    setActiveId(null);

    if (!over || !over.id) {
      console.log('No over target or no over.id');
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    
    console.log('Processing:', { activeIdStr, overIdStr });

    // Verificar si es un mensaje siendo arrastrado
    if (activeIdStr.startsWith('mensaje-')) {
      console.log('Es un mensaje siendo arrastrado');
      const mensajeId = parseInt(activeIdStr.replace('mensaje-', ''));
      
      // Verificar si se está soltando sobre un embudo
      if (overIdStr.startsWith('embudo-drop-')) {
        console.log('Se está soltando sobre un embudo');
        const nuevoEmbudoId = parseInt(overIdStr.replace('embudo-drop-', ''));
        
        // Encontrar el mensaje actual
        const mensajeActual = mensajes.find(m => m.id === mensajeId);
        if (!mensajeActual) {
          console.log('Mensaje no encontrado');
          return;
        }
        
        if (mensajeActual.embudo_id === nuevoEmbudoId) {
          console.log('Es el mismo embudo, no hacer nada');
          return;
        }

        console.log('Moviendo mensaje:', mensajeId, 'al embudo:', nuevoEmbudoId);
        // Mover el mensaje
        handleMensajeMoved(mensajeId, nuevoEmbudoId);
        return;
      } else {
        console.log('No se está soltando sobre un embudo válido');
      }
    } else {
      console.log('No es un mensaje siendo arrastrado');
    }

    // Solo manejar mensajes, no hay reordenamiento de embudos
  };

  // Obtener embudos del espacio seleccionado
  const embudosDelEspacio = selectedEspacio 
    ? espaciosConEmbudos.find(e => e.id === selectedEspacio.id)?.embudos || []
    : [];

  // Debug: Log de mensajes y embudos
  React.useEffect(() => {
    if (mensajes.length > 0 || embudosDelEspacio.length > 0) {
      console.log('🔍 Debug info:', {
        mensajes: mensajes.length,
        embudos: embudosDelEspacio.length,
        mensajeIds: mensajes.map(m => `mensaje-${m.id}`),
        embudoIds: embudosDelEspacio.map(e => `embudo-drop-${e.id}`),
        selectedEspacio: selectedEspacio?.id
      });
    }
  }, [mensajes.length, embudosDelEspacio.length, selectedEspacio?.id]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-[var(--text-primary)]">Cargando espacios y embudos...</div>
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
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Selector de Espacio */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded">
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
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] appearance-none cursor-pointer pr-8"
                >
                  <option value="">Seleccionar Espacio</option>
                  {espaciosConEmbudos.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Tabs de navegación */}
            <div className="flex space-x-4 ml-8">
              <button className="text-white font-medium px-3 py-1 bg-[var(--accent-primary)] rounded text-sm">
                Todos
              </button>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium px-3 py-1 hover:bg-[var(--bg-secondary)] rounded text-sm">
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

        {/* Main Content - Error */}
        <div className="flex-1 bg-[#1a1d23] p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header con selector de espacio */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Selector de Espacio */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded">
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
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] appearance-none cursor-pointer pr-8"
                >
                  <option value="">Seleccionar Espacio</option>
                  {espaciosConEmbudos.map((espacio) => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Tabs de navegación */}
            <div className="flex space-x-4 ml-8">
              <button className="text-white font-medium px-3 py-1 bg-[var(--accent-primary)] rounded text-sm">
                Todos
              </button>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium px-3 py-1 hover:bg-[var(--bg-secondary)] rounded text-sm">
                Mis Chats
              </button>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleNuevoMensaje}
              disabled={!selectedEspacio}
              className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              + Nuevo Mensaje
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Embudos */}
      <div className="flex-1 bg-[var(--bg-primary)]">
        {selectedEspacio ? (
          <div className="h-full">
            {/* Información del espacio seleccionado */}
            <div className="px-6 py-4 border-b border-[var(--border-primary)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-muted)] text-sm">
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
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
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
                          onMensajeMoved={handleMensajeMoved}
                        />
                      </div>
                    ))}
                  </div>
                </DndContext>
              ) : (
                <div className="text-center py-16">
                  <div className="text-[var(--text-muted)] text-6xl mb-4">📊</div>
                  <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">No hay embudos en este espacio</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-6">
                    Crea tu primer embudo para comenzar a gestionar tu flujo de trabajo.
                  </p>
                  <button 
                    onClick={handleAgregarEmbudo}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
              <div className="text-[var(--text-muted)] text-6xl mb-4">⚙️</div>
              <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">Selecciona un espacio de trabajo</h3>
              <p className="text-[var(--text-muted)] text-sm">
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
