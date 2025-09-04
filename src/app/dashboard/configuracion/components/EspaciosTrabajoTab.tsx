'use client';

import { useState, useEffect } from 'react';
import { supabaseService, EspacioTrabajoResponse, EmbUpdoResponse, EspacioConEmbudos } from '@/services/supabaseService';
import NuevoEspacioModal from './NuevoEspacioModal';
import EditarEspacioModal from './EditarEspacioModal';
import ConfirmarEliminarEspacioModal from './ConfirmarEliminarEspacioModal';
import NuevoEmbudoModal from './NuevoEmbudoModal';
import EditarEmbudoModal from './EditarEmbudoModal';
import ConfirmarEliminarEmbudoModal from './ConfirmarEliminarEmbudoModal';

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
  const [selectedEmbudo, setSelectedEmbudo] = useState<EmbUpdoResponse | null>(null);
  const [selectedEmbudoForDelete, setSelectedEmbudoForDelete] = useState<EmbUpdoResponse | null>(null);

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
        supabaseService.getAllEspaciosTrabajo(),
        supabaseService.getAllEmbudos()
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

  const handleEditEmbudo = (embudo: EmbUpdoResponse) => {
    setSelectedEmbudo(embudo);
    setShowEditarEmbudoModal(true);
  };

  const handleEmbudoUpdated = () => {
    // Refrescar la lista de espacios cuando se actualiza un embudo
    loadEspaciosTrabajo();
    setShowEditarEmbudoModal(false);
    setSelectedEmbudo(null);
  };

  const handleDeleteEmbudo = (embudo: EmbUpdoResponse) => {
    setSelectedEmbudoForDelete(embudo);
    setShowEliminarEmbudoModal(true);
  };

  const handleEmbudoDeleted = () => {
    // Refrescar la lista de espacios cuando se elimina un embudo
    loadEspaciosTrabajo();
    setShowEliminarEmbudoModal(false);
    setSelectedEmbudoForDelete(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b894] mx-auto mb-4"></div>
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
            <span>⚠️</span>
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
          <h3 className="text-white text-lg font-medium">Espacios de trabajo</h3>
          <p className="text-gray-400 text-sm">
            Crear, editar y eliminar tus espacios de trabajo
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadEspaciosTrabajo}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>🔄</span>
            <span>Actualizar</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <span>🏗️</span>
            <span>Plantillas</span>
          </button>
          <button 
            onClick={() => setShowNuevoEspacioModal(true)}
            className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <span>➕</span>
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
                  <span className="text-white text-lg font-medium">
                    ⚙️ {espacio.nombre.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditEspacio(espacio)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm transition-colors px-3 py-1 rounded border border-gray-600 hover:border-gray-500"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteEspacio(espacio)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-red-400 text-sm transition-colors px-3 py-1 rounded border border-gray-600 hover:border-red-500"
                  >
                    <span>🗑️</span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Grid de Embudos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Embudos existentes */}
                {espacio.embudos.map((embudo) => (
                  <div 
                    key={embudo.id} 
                    className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4 hover:border-[#00b894] transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm font-medium">
                          {embudo.espacio_id === 1 ? '0' : embudo.espacio_id === 3 ? '1' : '0'}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {embudo.nombre.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditEmbudo(embudo)}
                          className="text-gray-400 hover:text-white text-xs p-1" 
                          title="Editar embudo"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteEmbudo(embudo)}
                          className="text-gray-400 hover:text-red-400 text-xs p-1" 
                          title="Eliminar embudo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {embudo.descripcion && (
                      <p className="text-gray-400 text-xs mb-2">{embudo.descripcion}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      ID: {embudo.id} • {formatDate(embudo.creado_en)}
                    </div>
                  </div>
                ))}

                {/* Botón para agregar nuevo embudo */}
                <div 
                  onClick={() => handleAgregarEmbudo(espacio)}
                  className="bg-[#2a2d35] border-2 border-dashed border-[#3a3d45] rounded-lg p-4 flex items-center justify-center hover:border-[#00b894] transition-colors cursor-pointer group"
                >
                  <div className="text-center">
                    <div className="text-[#00b894] text-2xl mb-2 group-hover:scale-110 transition-transform">
                      +
                    </div>
                    <div className="text-gray-400 text-sm">
                      Agregar Embudo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h4 className="text-white text-lg font-medium mb-2">No hay espacios de trabajo</h4>
          <p className="text-gray-400 text-sm mb-6">No se encontraron espacios de trabajo en el sistema.</p>
          <button 
            onClick={loadEspaciosTrabajo}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
