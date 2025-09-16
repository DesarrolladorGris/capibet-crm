'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Hammer, Plus, Settings, Edit2, Trash2, Building2 } from 'lucide-react';
import { espacioTrabajoServices, EspacioTrabajoResponse } from '@/services/espacioTrabajoServices';
import { supabaseService, EspacioConEmbudos } from '@/services/supabaseService';
import { embudoServices, EmbudoResponse } from '@/services/embudoServices';
import NuevoEspacioModal from './NuevoEspacioModal';
import EditarEspacioModal from './EditarEspacioModal';
import ConfirmarEliminarEspacioModal from './ConfirmarEliminarEspacioModal';
import NuevoEmbudoModal from './NuevoEmbudoModal';
import EditarEmbudoModal from './EditarEmbudoModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmarEliminarEmbudoModal from './ConfirmarEliminarEmbudoModal';
import DraggableEmbudo from './DraggableEmbudo';

export default function EspaciosTrabajoTab() {
  const [espaciosConEmbudos, setEspaciosConEmbudos] = useState<EspacioConEmbudos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNuevoEspacioModal, setShowNuevoEspacioModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [showNuevoEmbudoModal, setShowNuevoEmbudoModal] = useState(false);
  const [showEditarEmbudoModal, setShowEditarEmbudoModal] = useState(false);
  const [showEliminarEmbudoModal, setShowEliminarEmbudoModal] = useState(false);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [selectedEspacioForEmbudo, setSelectedEspacioForEmbudo] = useState<EspacioTrabajoResponse | null>(null);
  const [selectedEmbudo, setSelectedEmbudo] = useState<EmbudoResponse | null>(null);
  const [selectedEmbudoForDelete, setSelectedEmbudoForDelete] = useState<EmbudoResponse | null>(null);
  
  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // Cargar espacios de trabajo al montar el componente
  useEffect(() => {
    loadEspaciosTrabajo();
  }, []);

  const loadEspaciosTrabajo = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Cargar espacios y embudos en paralelo
      const [espaciosResult, embudosResult] = await Promise.all([
        espacioTrabajoServices.getAllEspaciosTrabajo(),
        embudoServices.getAllEmbudos()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        const espacios = espaciosResult.data;
        const embudos = embudosResult.success ? embudosResult.data || [] : [];
        
        // Asociar embudos a sus espacios correspondientes
        const espaciosConEmbudos: EspacioConEmbudos[] = espacios.map(espacio => ({
          ...espacio,
          embudos: embudos.filter(embudo => embudo.espacio_id === espacio.id)
        }));
        
        setEspaciosConEmbudos(espaciosConEmbudos);
        console.log('Espacios con embudos cargados:', espaciosConEmbudos);
      } else {
        setError(espaciosResult.error || 'Error al cargar espacios de trabajo');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error loading espacios de trabajo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  const handleEspacioCreated = () => {
    // Refrescar la lista de espacios cuando se crea uno nuevo
    loadEspaciosTrabajo();
  };

  const handleEditEspacio = (espacio: EspacioTrabajoResponse) => {
    setSelectedEspacio(espacio);
    setShowEditarModal(true);
  };

  const handleEspacioUpdated = () => {
    // Refrescar la lista de espacios cuando se actualiza uno
    loadEspaciosTrabajo();
    setShowEditarModal(false);
    setSelectedEspacio(null);
  };

  const handleDeleteEspacio = (espacio: EspacioTrabajoResponse) => {
    setSelectedEspacio(espacio);
    setShowEliminarModal(true);
  };

  const handleEspacioDeleted = () => {
    // Refrescar la lista de espacios cuando se elimina uno
    loadEspaciosTrabajo();
    setShowEliminarModal(false);
    setSelectedEspacio(null);
  };

  const handleAgregarEmbudo = (espacio: EspacioTrabajoResponse) => {
    setSelectedEspacioForEmbudo(espacio);
    setShowNuevoEmbudoModal(true);
  };

  const handleEmbudoCreated = () => {
    // Refrescar la lista de espacios cuando se crea un embudo
    loadEspaciosTrabajo();
    setShowNuevoEmbudoModal(false);
    setSelectedEspacioForEmbudo(null);
  };

  const handleEditEmbudo = (embudo: EmbudoResponse) => {
    setSelectedEmbudo(embudo);
    setShowEditarEmbudoModal(true);
  };

  const handleEmbudoUpdated = () => {
    // Refrescar la lista de espacios cuando se actualiza un embudo
    loadEspaciosTrabajo();
    setShowEditarEmbudoModal(false);
    setSelectedEmbudo(null);
  };

  const handleDeleteEmbudo = (embudo: EmbudoResponse) => {
    setSelectedEmbudoForDelete(embudo);
    setShowEliminarEmbudoModal(true);
  };

  const handleEmbudoDeleted = () => {
    // Refrescar la lista de espacios cuando se elimina un embudo
    loadEspaciosTrabajo();
    setShowEliminarEmbudoModal(false);
    setSelectedEmbudoForDelete(null);
  };

  // Manejar el final del drag & drop para embudos
  const handleDragEnd = async (event: DragEndEvent, espacioId: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    console.log('🚀 Drag end:', active.id, 'over:', over.id);

    // Encontrar el espacio actual
    const espacioIndex = espaciosConEmbudos.findIndex(e => e.id === espacioId);
    if (espacioIndex === -1) return;

    const espacio = espaciosConEmbudos[espacioIndex];
    const oldIndex = espacio.embudos.findIndex(embudo => embudo.id === active.id);
    const newIndex = espacio.embudos.findIndex(embudo => embudo.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reordenar localmente para feedback inmediato
    const newEmbudos = arrayMove(espacio.embudos, oldIndex, newIndex);
    
    // Actualizar el estado local
    const newEspaciosConEmbudos = [...espaciosConEmbudos];
    newEspaciosConEmbudos[espacioIndex] = {
      ...espacio,
      embudos: newEmbudos
    };
    setEspaciosConEmbudos(newEspaciosConEmbudos);

    // Preparar datos para el API (asignar nuevos órdenes)
    const embudosConOrden = newEmbudos.map((embudo, index) => ({
      id: embudo.id,
      orden: index + 1
    }));

    console.log('📡 Actualizando orden en API:', embudosConOrden);

    try {
      const result = await embudoServices.updateEmbudosOrder(embudosConOrden);
      
      if (result.success) {
        console.log('✅ Orden de embudos actualizado exitosamente');
        // Recargar para asegurar consistencia
        loadEspaciosTrabajo();
      } else {
        console.error('❌ Error al actualizar orden:', result.error);
        // Revertir cambios locales en caso de error
        loadEspaciosTrabajo();
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      // Revertir cambios locales en caso de error
      loadEspaciosTrabajo();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-[var(--text-primary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p>Cargando espacios de trabajo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button 
            onClick={loadEspaciosTrabajo}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[var(--text-primary)] text-lg font-medium">Espacios de trabajo</h3>
          <p className="text-[var(--text-muted)] text-sm">
            Crear, editar y eliminar tus espacios de trabajo
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadEspaciosTrabajo}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Actualizar</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Hammer className="w-5 h-5" />
            <span>Plantillas</span>
          </button>
          <button 
            onClick={() => setShowNuevoEspacioModal(true)}
            className="flex items-center space-x-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Espacio</span>
          </button>
        </div>
      </div>

      {/* Lista de Espacios de Trabajo con Embudos */}
      {espaciosConEmbudos.length > 0 ? (
        <div className="space-y-6">
          {espaciosConEmbudos.map((espacio) => (
            <div key={espacio.id} className="space-y-4">
              {/* Header del Espacio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-[var(--text-primary)] text-lg font-medium">
                    <Settings className="w-5 h-5 mr-2" /> {espacio.nombre.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditEspacio(espacio)}
                    className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors px-3 py-1 rounded border border-[var(--border-primary)] hover:border-[var(--border-secondary)] cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteEspacio(espacio)}
                    className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-red-400 text-sm transition-colors px-3 py-1 rounded border border-[var(--border-primary)] hover:border-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Grid de Embudos con Drag & Drop */}
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, espacio.id)}
              >
                <SortableContext 
                  items={espacio.embudos.map(embudo => embudo.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Embudos existentes draggables */}
                    {espacio.embudos
                      .sort((a, b) => (a.orden || 0) - (b.orden || 0)) // Ordenar por campo orden
                      .map((embudo) => (
                      <DraggableEmbudo
                        key={embudo.id}
                        embudo={embudo}
                        onEdit={handleEditEmbudo}
                        onDelete={handleDeleteEmbudo}
                        formatDate={formatDate}
                      />
                    ))}

                    {/* Botón para agregar nuevo embudo */}
                    <div 
                      onClick={() => handleAgregarEmbudo(espacio)}
                      className="bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-primary)] rounded-lg p-4 flex items-center justify-center hover:border-[var(--accent-primary)] transition-colors cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="text-[var(--accent-primary)] text-2xl mb-2 group-hover:scale-110 transition-transform">
                          +
                        </div>
                        <div className="text-[var(--text-muted)] text-sm">
                          Agregar Embudo
                        </div>
                      </div>
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="text-[var(--text-muted)] w-24 h-24 mx-auto mb-4" />
          <h4 className="text-[var(--text-primary)] text-lg font-medium mb-2">No hay espacios de trabajo</h4>
          <p className="text-[var(--text-muted)] text-sm mb-6">No se encontraron espacios de trabajo en el sistema.</p>
          <button 
            onClick={loadEspaciosTrabajo}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Recargar espacios de trabajo
          </button>
        </div>
      )}

      {/* Modal de Nuevo Espacio */}
      <NuevoEspacioModal
        isOpen={showNuevoEspacioModal}
        onClose={() => setShowNuevoEspacioModal(false)}
        onEspacioCreated={handleEspacioCreated}
      />

      {/* Modal de Editar Espacio */}
      <EditarEspacioModal
        isOpen={showEditarModal}
        onClose={() => {
          setShowEditarModal(false);
          setSelectedEspacio(null);
        }}
        onEspacioUpdated={handleEspacioUpdated}
        espacio={selectedEspacio}
      />

      {/* Modal de Confirmar Eliminación */}
      <ConfirmarEliminarEspacioModal
        isOpen={showEliminarModal}
        onClose={() => {
          setShowEliminarModal(false);
          setSelectedEspacio(null);
        }}
        onEspacioDeleted={handleEspacioDeleted}
        espacio={selectedEspacio}
      />

      {/* Modal de Nuevo Embudo */}
      {selectedEspacioForEmbudo && (
        <NuevoEmbudoModal
          isOpen={showNuevoEmbudoModal}
          onClose={() => {
            setShowNuevoEmbudoModal(false);
            setSelectedEspacioForEmbudo(null);
          }}
          onEmbudoCreated={handleEmbudoCreated}
          espacioId={selectedEspacioForEmbudo.id}
          espacioNombre={selectedEspacioForEmbudo.nombre}
        />
      )}

      {/* Modal de Editar Embudo */}
      <EditarEmbudoModal
        isOpen={showEditarEmbudoModal}
        onClose={() => {
          setShowEditarEmbudoModal(false);
          setSelectedEmbudo(null);
        }}
        onEmbudoUpdated={handleEmbudoUpdated}
        embudo={selectedEmbudo}
      />

      {/* Modal de Confirmar Eliminación de Embudo */}
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
