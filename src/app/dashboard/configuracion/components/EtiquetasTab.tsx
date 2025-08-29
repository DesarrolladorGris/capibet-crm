'use client';
import { useState, useEffect } from 'react';

interface Etiqueta {
  id?: number;
  nombre: string;
  color: string;
  descripcion: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
}

interface EtiquetaFormData {
  nombre: string;
  color: string;
  descripcion: string;
}

const coloresPredefinidos = [
  '#00b894', '#d63031', '#0984e3', '#fd79a8', '#fdcb6e',
  '#6c5ce7', '#e17055', '#2d3436', '#00cec9', '#a29bfe'
];

const etiquetasPrueba: Etiqueta[] = [
  {
    id: 1,
    nombre: 'Cliente VIP',
    color: '#00b894',
    descripcion: 'Clientes de alto valor y prioridad máxima',
    activa: true,
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 2,
    nombre: 'Urgente',
    color: '#d63031',
    descripcion: 'Tareas y solicitudes prioritarias',
    activa: true,
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 3,
    nombre: 'Nuevo',
    color: '#0984e3',
    descripcion: 'Elementos y clientes recientes',
    activa: true,
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 4,
    nombre: 'Oferta',
    color: '#fd79a8',
    descripcion: 'Promociones y ofertas activas',
    activa: true,
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 5,
    nombre: 'Completado',
    color: '#00b894',
    descripcion: 'Tareas y procesos finalizados',
    activa: false,
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#00b894');

  useEffect(() => {
    setEtiquetas(etiquetasPrueba);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.color.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingEtiqueta) {
        const updatedEtiquetas = etiquetas.map(etq =>
          etq.id === editingEtiqueta.id
            ? { ...etq, ...formData, updated_at: new Date().toISOString() }
            : etq
        );
        setEtiquetas(updatedEtiquetas);
      } else {
        const nuevaEtiqueta: Etiqueta = {
          id: Math.max(...etiquetas.map(e => e.id || 0)) + 1,
          ...formData,
          activa: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setEtiquetas([nuevaEtiqueta, ...etiquetas]);
      }
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar etiqueta:', error);
      alert('Error al guardar la etiqueta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta etiqueta?')) {
      return;
    }

    try {
      const updatedEtiquetas = etiquetas.filter(etq => etq.id !== id);
      setEtiquetas(updatedEtiquetas);
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      alert('Error al eliminar la etiqueta');
    }
  };

  const handleToggleStatus = async (etiqueta: Etiqueta) => {
    try {
      const updatedEtiquetas = etiquetas.map(etq =>
        etq.id === etiqueta.id
          ? { ...etq, activa: !etq.activa, updated_at: new Date().toISOString() }
          : etq
      );
      setEtiquetas(updatedEtiquetas);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
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
    setShowColorPicker(false);
  };

  const seleccionarColor = (color: string) => {
    setFormData({ ...formData, color });
    setCustomColor(color);
    setShowColorPicker(false);
  };

  const etiquetasFiltradas = etiquetas.filter(etiqueta =>
    etiqueta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etiqueta.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando etiquetas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Etiquetas</h3>
          <p className="text-sm text-gray-600">
            Organiza y categoriza elementos con etiquetas personalizables
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>🏷️</span>
          <span>Nueva Etiqueta</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar etiquetas por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{etiquetas.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {etiquetas.filter(e => e.activa).length}
          </div>
          <div className="text-sm text-gray-600">Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {etiquetas.filter(e => !e.activa).length}
          </div>
          <div className="text-sm text-gray-600">Inactivas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(etiquetas.map(e => e.color)).size}
          </div>
          <div className="text-sm text-gray-600">Colores únicos</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {etiquetasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <p>No se encontraron etiquetas para &quot;{searchTerm}&quot;</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">🏷️</div>
                <p>No hay etiquetas configuradas</p>
                <button
                  onClick={() => abrirModal()}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Crear la primera etiqueta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {etiquetasFiltradas.map((etiqueta) => (
              <div key={etiqueta.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: etiqueta.color }}
                      ></div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {etiqueta.nombre}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        etiqueta.activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {etiqueta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {etiqueta.descripcion || 'Sin descripción'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Creada: {new Date(etiqueta.created_at || '').toLocaleDateString()}</span>
                      {etiqueta.updated_at && (
                        <span>Actualizada: {new Date(etiqueta.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(etiqueta)}
                      className={`p-2 rounded-lg ${
                        etiqueta.activa
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={etiqueta.activa ? 'Desactivar' : 'Activar'}
                    >
                      {etiqueta.activa ? '✅' : '⭕'}
                    </button>
                    <button
                      onClick={() => abrirModal(etiqueta)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(etiqueta.id!)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Cliente VIP, Urgente..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
                        style={{ backgroundColor: formData.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      ></div>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#000000"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    🎨
                  </button>
                </div>
                
                {showColorPicker && (
                  <div className="mt-3">
                    <div className="grid grid-cols-6 gap-2">
                      {coloresPredefinidos.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => seleccionarColor(color)}
                          className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        ></button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setFormData({ ...formData, color: e.target.value });
                        }}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el propósito de esta etiqueta..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingEtiqueta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-yellow-400 mr-3">⚠️</div>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Modo Prueba</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Este módulo está funcionando con datos de ejemplo. Para conectar a la base de datos real, 
              ejecuta el SQL en Supabase y activa la conexión en el código.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
