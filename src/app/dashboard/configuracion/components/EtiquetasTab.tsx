'use client';
import { useState, useEffect } from 'react';

interface Etiqueta {
  id?: number;
  nombre: string;
  color: string;
  activa: boolean;
  created_at?: string;
}

interface EtiquetaFormData {
  nombre: string;
  color: string;
  descripcion: string;
}

const etiquetasPrueba: Etiqueta[] = [
  {
    id: 1,
    nombre: 'Cliente VIP',
    color: '#00b894',
    activa: true,
  },
  {
    id: 2,
    nombre: 'Urgente',
    color: '#d63031',
    activa: true,
  },
  {
    id: 3,
    nombre: 'Nuevo',
    color: '#0984e3',
    activa: true,
  },
  {
    id: 4,
    nombre: 'Oferta',
    color: '#fd79a8',
    activa: false,
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

  useEffect(() => {
    setEtiquetas(etiquetasPrueba);
    setLoading(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
      return;
    }

    try {
      if (editingEtiqueta) {
        );
      } else {
        const nuevaEtiqueta: Etiqueta = {
          ...formData,
          activa: true,
        };
      }
    } catch (error) {
      console.error('Error al guardar etiqueta:', error);
      alert('Error al guardar la etiqueta');
    }
  };

  const handleDelete = async (id: number) => {
    }
  };

  const handleToggleStatus = async (etiqueta: Etiqueta) => {
    try {
      );
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
  );

  if (loading) {
    return (
      </div>
    );
  }

  return (
        <div>
        </div>
        <button
          onClick={() => abrirModal()}
        >
          <span>🏷️</span>
          <span>Nueva Etiqueta</span>
        </button>
      </div>

        </div>
      </div>

        {etiquetasFiltradas.length === 0 ? (
          </div>
        ) : (
                      )}
                    </div>
                  </div>
                </div>
              </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                {editingEtiqueta ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
              </h3>
              <button
                onClick={cerrarModal}
              >
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                </label>
                </div>
              </div>

              <div>
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el propósito de esta etiqueta..."
                />
              </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
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
