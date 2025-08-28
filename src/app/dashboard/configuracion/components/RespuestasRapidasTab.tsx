'use client';
import { useState, useEffect } from 'react';

// Interfaces
interface RespuestaRapida {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  activa: boolean;
  created_at?: string;
}

interface RespuestaRapidaFormData {
  titulo: string;
  contenido: string;
  categoria: string;
}

// Datos de prueba
const respuestasPrueba: RespuestaRapida[] = [
  {
    id: 1,
    titulo: 'Bienvenida',
    contenido: '¡Hola! Bienvenido a Capibet Casino. ¿En qué puedo ayudarte hoy?',
    categoria: 'General',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 2,
    titulo: 'Problema de Pago',
    contenido: 'Entiendo que tienes un problema con el pago. Te ayudo a resolverlo paso a paso.',
    categoria: 'Soporte',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 3,
    titulo: 'Promociones',
    contenido: 'Tenemos excelentes promociones disponibles. Te envío el enlace con todos los detalles.',
    categoria: 'Marketing',
    activa: true,
    created_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 4,
    titulo: 'Cierre de Sesión',
    contenido: 'Para cerrar sesión, haz clic en tu nombre en la esquina superior derecha y selecciona "Cerrar Sesión".',
    categoria: 'Cuenta',
    activa: false,
    created_at: '2024-12-28T10:00:00Z'
  }
];

const categoriasPredefinidas = [
  'General',
  'Soporte',
  'Marketing',
  'Cuenta',
  'Pagos',
  'Juegos',
  'Promociones',
  'Técnico'
];

export default function RespuestasRapidasTab() {
  const [respuestas, setRespuestas] = useState<RespuestaRapida[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRespuesta, setEditingRespuesta] = useState<RespuestaRapida | null>(null);
  const [formData, setFormData] = useState<RespuestaRapidaFormData>({
    titulo: '',
    contenido: '',
    categoria: 'General'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategoriaInput, setShowCategoriaInput] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  useEffect(() => {
    console.log('RespuestasRapidasTab: Componente montado, cargando respuestas de prueba...');
    // Usar datos de prueba por ahora
    setRespuestas(respuestasPrueba);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.contenido.trim() || !formData.categoria.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      if (editingRespuesta) {
        // Actualizar respuesta existente
        const updatedRespuestas = respuestas.map(resp =>
          resp.id === editingRespuesta.id
            ? { ...resp, ...formData }
            : resp
        );
        setRespuestas(updatedRespuestas);
        console.log('Respuesta actualizada:', formData);
      } else {
        // Crear nueva respuesta
        const nuevaRespuesta: RespuestaRapida = {
          id: Math.max(...respuestas.map(r => r.id || 0)) + 1,
          ...formData,
          activa: true,
          created_at: new Date().toISOString()
        };
        setRespuestas([nuevaRespuesta, ...respuestas]);
        console.log('Nueva respuesta creada:', nuevaRespuesta);
      }

      cerrarModal();
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      alert('Error al guardar la respuesta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta respuesta?')) {
      return;
    }

    try {
      const updatedRespuestas = respuestas.filter(resp => resp.id !== id);
      setRespuestas(updatedRespuestas);
      console.log('Respuesta eliminada:', id);
    } catch (error) {
      console.error('Error al eliminar respuesta:', error);
      alert('Error al eliminar la respuesta');
    }
  };

  const handleToggleStatus = async (respuesta: RespuestaRapida) => {
    try {
      const updatedRespuestas = respuestas.map(resp =>
        resp.id === respuesta.id
          ? { ...resp, activa: !resp.activa }
          : resp
      );
      setRespuestas(updatedRespuestas);
      console.log('Estado cambiado para respuesta:', respuesta.id);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const abrirModal = (respuesta?: RespuestaRapida) => {
    if (respuesta) {
      setEditingRespuesta(respuesta);
      setFormData({
        titulo: respuesta.titulo,
        contenido: respuesta.contenido,
        categoria: respuesta.categoria
      });
    } else {
      setEditingRespuesta(null);
      setFormData({
        titulo: '',
        contenido: '',
        categoria: 'General'
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingRespuesta(null);
    setFormData({
      titulo: '',
      contenido: '',
      categoria: 'General'
    });
    setShowCategoriaInput(false);
    setNuevaCategoria('');
  };

  const agregarCategoria = () => {
    if (nuevaCategoria.trim() && !categoriasPredefinidas.includes(nuevaCategoria.trim())) {
      categoriasPredefinidas.push(nuevaCategoria.trim());
      setFormData({ ...formData, categoria: nuevaCategoria.trim() });
      setNuevaCategoria('');
      setShowCategoriaInput(false);
    }
  };

  const respuestasFiltradas = respuestas.filter(respuesta =>
    respuesta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    respuesta.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    respuesta.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando respuestas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Respuestas Rápidas</h3>
          <p className="text-sm text-gray-600">
            Gestiona respuestas predefinidas para el soporte al cliente
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nueva Respuesta</span>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar respuestas por título, contenido o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-3 top-2.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{respuestas.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {respuestas.filter(r => r.activa).length}
          </div>
          <div className="text-sm text-gray-600">Activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {respuestas.filter(r => !r.activa).length}
          </div>
          <div className="text-sm text-gray-600">Inactivas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(respuestas.map(r => r.categoria)).size}
          </div>
          <div className="text-sm text-gray-600">Categorías</div>
        </div>
      </div>

      {/* Lista de respuestas */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {respuestasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <div>
                <div className="text-4xl mb-4">🔍</div>
                <p>No se encontraron respuestas para &quot;{searchTerm}&quot;</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-4">💬</div>
                <p>No hay respuestas rápidas configuradas</p>
                <button
                  onClick={() => abrirModal()}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Crear la primera respuesta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {respuestasFiltradas.map((respuesta) => (
              <div key={respuesta.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {respuesta.titulo}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        respuesta.activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {respuesta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {respuesta.categoria}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {respuesta.contenido}
                    </p>
                    <div className="text-xs text-gray-400">
                      Creada: {new Date(respuesta.created_at || '').toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(respuesta)}
                      className={`p-2 rounded-lg ${
                        respuesta.activa
                          ? 'text-green-600 hover:bg-green-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={respuesta.activa ? 'Desactivar' : 'Activar'}
                    >
                      {respuesta.activa ? '✅' : '⭕'}
                    </button>
                    <button
                      onClick={() => abrirModal(respuesta)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(respuesta.id!)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingRespuesta ? 'Editar Respuesta' : 'Nueva Respuesta'}
              </h3>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Bienvenida, Problema de Pago..."
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {categoriasPredefinidas.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoriaInput(!showCategoriaInput)}
                    className="px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    +
                  </button>
                </div>
                
                {showCategoriaInput && (
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="text"
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      placeholder="Nueva categoría"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={agregarCategoria}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido *
                </label>
                <textarea
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Escribe la respuesta predefinida..."
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Puedes usar variables como {'{nombre}'}, {'{email}'}, etc.
                </div>
              </div>

              {/* Botones */}
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
                  {editingRespuesta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mensaje de modo prueba */}
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
