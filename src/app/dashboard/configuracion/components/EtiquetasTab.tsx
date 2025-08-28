'use client';

import { useState, useEffect } from 'react';

// Tipos para las etiquetas
interface Etiqueta {
  id?: number;
  nombre: string;
  color: string;
  descripcion?: string;
  activa: boolean;
  created_at?: string;
}

interface EtiquetaFormData {
  nombre: string;
  color: string;
  descripcion: string;
}

// Datos de prueba
const etiquetasPrueba: Etiqueta[] = [
  {
    id: 1,
    nombre: 'Cliente VIP',
    color: '#00b894',
    descripcion: 'Clientes de alto valor',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Urgente',
    color: '#d63031',
    descripcion: 'Tareas prioritarias',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Nuevo',
    color: '#0984e3',
    descripcion: 'Elementos recientes',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 4,
    nombre: 'Oferta',
    color: '#fd79a8',
    descripcion: 'Promociones activas',
    activa: false,
    created_at: '2024-12-28T10:00:00Z'
  }
];

export default function EtiquetasTab() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);
  const [formData, setFormData] = useState<EtiquetaFormData>({
    nombre: '',
    color: '#00b894',
    descripcion: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Colores predefinidos para las etiquetas
  const coloresPredefinidos = [
    '#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#fd79a8',
    '#fdcb6e', '#e17055', '#d63031', '#2d3436', '#636e72'
  ];

  useEffect(() => {
    console.log('EtiquetasTab: Componente montado, cargando etiquetas de prueba...');
    // Usar datos de prueba por ahora
    setEtiquetas(etiquetasPrueba);
    setLoading(false);
  }, [etiquetasPrueba]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre de la etiqueta es obligatorio');
      return;
    }

    try {
      if (editingEtiqueta) {
        // Actualizar etiqueta existente
        const etiquetasActualizadas = etiquetas.map(etiqueta =>
          etiqueta.id === editingEtiqueta.id
            ? { ...etiqueta, ...formData }
            : etiqueta
        );
        setEtiquetas(etiquetasActualizadas);
        cerrarModal();
        alert('Etiqueta actualizada exitosamente');
      } else {
        // Crear nueva etiqueta
        const nuevaEtiqueta: Etiqueta = {
          id: Date.now(), // ID temporal
          ...formData,
          activa: true,
          created_at: new Date().toISOString()
        };
        setEtiquetas([...etiquetas, nuevaEtiqueta]);
        cerrarModal();
        alert('Etiqueta creada exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar etiqueta:', error);
      alert('Error al guardar la etiqueta');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta etiqueta?')) {
      try {
        const etiquetasFiltradas = etiquetas.filter(etiqueta => etiqueta.id !== id);
        setEtiquetas(etiquetasFiltradas);
        alert('Etiqueta eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar etiqueta:', error);
        alert('Error al eliminar la etiqueta');
      }
    }
  };

  const handleToggleStatus = async (etiqueta: Etiqueta) => {
    try {
      const etiquetasActualizadas = etiquetas.map(e =>
        e.id === etiqueta.id ? { ...e, activa: !e.activa } : e
      );
      setEtiquetas(etiquetasActualizadas);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado de la etiqueta');
    }
  };

  const abrirModal = (etiqueta?: Etiqueta) => {
    if (etiqueta) {
      setEditingEtiqueta(etiqueta);
      setFormData({
        nombre: etiqueta.nombre,
        color: etiqueta.color,
        descripcion: etiqueta.descripcion || ''
      });
    } else {
      setEditingEtiqueta(null);
      setFormData({
        nombre: '',
        color: '#00b894',
        descripcion: ''
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingEtiqueta(null);
    setFormData({
      nombre: '',
      color: '#00b894',
      descripcion: ''
    });
  };

  const etiquetasFiltradas = etiquetas.filter(etiqueta =>
    etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etiqueta.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b894]"></div>
          <span className="ml-3 text-gray-400">Cargando etiquetas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white text-xl font-semibold mb-2">Gestión de Etiquetas</h3>
          <p className="text-gray-400">Organiza y categoriza tu contenido con etiquetas personalizadas</p>
          <p className="text-gray-500 text-sm mt-1">Total de etiquetas: {etiquetas.length}</p>
          <p className="text-yellow-400 text-xs mt-1">⚠️ Modo de prueba - Datos locales</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>🏷️</span>
          <span>Nueva Etiqueta</span>
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar etiquetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Lista de etiquetas */}
      <div className="grid gap-4">
        {etiquetasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🏷️</span>
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm ? 'No se encontraron etiquetas' : 'No hay etiquetas creadas'}
            </p>
            <p className="text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera etiqueta para empezar'}
            </p>
          </div>
        ) : (
          etiquetasFiltradas.map((etiqueta) => (
            <div
              key={etiqueta.id}
              className={`bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4 transition-all hover:border-[#00b894] ${
                !etiqueta.activa ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: etiqueta.color }}
                  ></div>
                  <div>
                    <h4 className={`text-white font-medium ${!etiqueta.activa ? 'line-through' : ''}`}>
                      {etiqueta.nombre}
                    </h4>
                    {etiqueta.descripcion && (
                      <p className="text-gray-400 text-sm mt-1">{etiqueta.descripcion}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Color: {etiqueta.color}</span>
                      {etiqueta.created_at && (
                        <span>Creada: {new Date(etiqueta.created_at).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(etiqueta)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      etiqueta.activa
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {etiqueta.activa ? 'Activa' : 'Inactiva'}
                  </button>
                  
                  <button
                    onClick={() => abrirModal(etiqueta)}
                    className="bg-[#0984e3] hover:bg-[#0873c4] text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  
                  <button
                    onClick={() => handleDelete(etiqueta.id!)}
                    className="bg-[#d63031] hover:bg-[#c0392b] text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para crear/editar etiqueta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nombre de la etiqueta *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
                  placeholder="Ej: Cliente VIP, Urgente, etc."
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Color de la etiqueta
                </label>
                <div className="flex space-x-2 mb-2">
                  {coloresPredefinidos.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-white scale-110' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 bg-[#1a1d23] border border-[#3a3d45] rounded-lg cursor-pointer"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
                  placeholder="Describe el propósito de esta etiqueta..."
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingEtiqueta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
