'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Etiqueta {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
  activa: boolean;
}

// Datos de prueba
const etiquetasPrueba: Etiqueta[] = [
  { id: 1, nombre: 'Urgente', color: '#ff4757', descripcion: 'Para casos urgentes', activa: true },
  { id: 2, nombre: 'Seguimiento', color: '#3742fa', descripcion: 'Requiere seguimiento', activa: true },
  { id: 3, nombre: 'Resuelto', color: '#2ed573', descripcion: 'Caso resuelto', activa: true },
  { id: 4, nombre: 'En proceso', color: '#ffa502', descripcion: 'En proceso de resolución', activa: false },
];

export default function EtiquetasTab() {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEtiqueta, setEditingEtiqueta] = useState<Etiqueta | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    color: '#00b894',
    descripcion: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setEtiquetas(etiquetasPrueba);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEtiqueta) {
        // Actualizar etiqueta existente
        const etiquetaActualizada = {
          ...editingEtiqueta,
          ...formData
        };
        setEtiquetas(etiquetas.map(e => e.id === editingEtiqueta.id ? etiquetaActualizada : e));
      } else {
        // Crear nueva etiqueta
        const nuevaEtiqueta: Etiqueta = {
          id: Date.now(),
          ...formData,
          activa: true,
        };
        setEtiquetas([...etiquetas, nuevaEtiqueta]);
      }
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar etiqueta:', error);
      alert('Error al guardar la etiqueta');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setEtiquetas(etiquetas.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
    }
  };

  const handleToggleStatus = async (etiqueta: Etiqueta) => {
    try {
      const etiquetaActualizada = { ...etiqueta, activa: !etiqueta.activa };
      setEtiquetas(etiquetas.map(e => e.id === etiqueta.id ? etiquetaActualizada : e));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const abrirModal = (etiqueta?: Etiqueta) => {
    if (etiqueta) {
      setEditingEtiqueta(etiqueta);
      setFormData({
        nombre: etiqueta.nombre,
        color: etiqueta.color,
        descripcion: etiqueta.descripcion
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
    etiqueta.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-white">Cargando etiquetas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-xl font-semibold mb-2">Gestión de Etiquetas</h2>
          <p className="text-gray-400 text-sm">Organiza y categoriza tus conversaciones</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded font-medium transition-colors"
        >
          <span>🏷️</span>
          <span>Nueva Etiqueta</span>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar etiquetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
        />
      </div>

      {/* Lista de Etiquetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {etiquetasFiltradas.map((etiqueta) => (
          <div
            key={etiqueta.id}
            className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4 hover:border-[#00b894] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: etiqueta.color }}
                ></div>
                <span className="text-white font-medium">{etiqueta.nombre}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => abrirModal(etiqueta)}
                  className="text-gray-400 hover:text-white p-1 rounded"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleStatus(etiqueta)}
                  className={`p-1 rounded ${etiqueta.activa ? 'text-green-400' : 'text-gray-500'}`}
                  title={etiqueta.activa ? 'Desactivar' : 'Activar'}
                >
                  {etiqueta.activa ? '✓' : '○'}
                </button>
                <button
                  onClick={() => handleDelete(etiqueta.id)}
                  className="text-gray-400 hover:text-red-400 p-1 rounded"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm">{etiqueta.descripcion}</p>
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded ${etiqueta.activa ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {etiqueta.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {etiquetasFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <div className="text-gray-400 text-lg mb-2">No se encontraron etiquetas</div>
          <div className="text-gray-500 text-sm">
            {searchTerm ? 'Prueba con otros términos de búsqueda' : 'Crea tu primera etiqueta para comenzar'}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#3a3d45]">
              <h3 className="text-white text-lg font-semibold">
                {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                  placeholder="Nombre de la etiqueta"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 bg-[#1a1d23] border border-[#3a3d45] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894]"
                    placeholder="#00b894"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] resize-none"
                  rows={3}
                  placeholder="Descripción de la etiqueta"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-2 rounded font-medium transition-colors"
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