'use client';

import { useState, useEffect, useCallback } from 'react';
import { mensajesServices } from '@/services/mensajesServices';
import { MensajeData } from '@/app/api/mensajes/domain/mensaje';
import { sesionesServices } from '@/services/sesionesServices';
import { SesionResponse } from '@/app/api/sesiones/domain/sesion';
import { canalesServices, Canal } from '@/services/canalesServices';
import { embudoServices } from '@/services/embudoServices';
import { EmbudoResponse } from '@/app/api/embudos/domain/embudo';
import { contactoServices, ContactResponse } from '@/services/contactoServices';

interface NuevoMensajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMensajeCreated: () => void;
  espacioId?: number;
}

export default function NuevoMensajeModal({ 
  isOpen, 
  onClose, 
  onMensajeCreated,
  espacioId 
}: NuevoMensajeModalProps) {
  const [contenido, setContenido] = useState('');
  const [canalId, setCanalId] = useState<number>(0);
  const [sesionId, setSesionId] = useState<number>(0);
  const [contactoId, setContactoId] = useState<number>(0);
  const [destinatarioId] = useState<number>(0); // Siempre 0, no necesita setter
  const [embudoId, setEmbudoId] = useState<number>(0);
  
  // Estados para datos auxiliares
  const [canales, setCanales] = useState<Canal[]>([]);
  const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
  const [contactos, setContactos] = useState<ContactResponse[]>([]);
  const [embudos, setEmbudos] = useState<EmbudoResponse[]>([]);
  const [userId, setUserId] = useState<number>(0);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadInitialData = useCallback(async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      // Obtener userId del localStorage
      const userIdString = localStorage.getItem('userId');
      const currentUserId = userIdString ? parseInt(userIdString, 10) : 0;
      setUserId(currentUserId);

      // Cargar datos en paralelo
      const [canalesResult, contactosResult, embudosResult] = await Promise.all([
        canalesServices.getAllCanales(),
        contactoServices.getAllContactos(),
        espacioId ? embudoServices.getEmbudosByEspacio(espacioId) : embudoServices.getAllEmbudos()
      ]);

      if (canalesResult.success && canalesResult.data) {
        // Filtrar canales por espacio si está disponible
        const canalesFiltrados = espacioId 
          ? canalesResult.data.filter(canal => canal.espacio_id === espacioId)
          : canalesResult.data;
        setCanales(canalesFiltrados);
      }

      if (contactosResult.success && contactosResult.data) {
        setContactos(contactosResult.data);
      }

      if (embudosResult.success && embudosResult.data) {
        setEmbudos(embudosResult.data);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Error al cargar datos iniciales');
    } finally {
      setLoadingData(false);
    }
  }, [espacioId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, loadInitialData]);

  // Cargar sesiones cuando se selecciona un canal
  const loadSesiones = async (selectedCanalId: number) => {
    try {
      const sesionesResult = await sesionesServices.getSesionesByCanal(selectedCanalId);
      if (sesionesResult.success && sesionesResult.data) {
        setSesiones(sesionesResult.data);
      }
    } catch (error) {
      console.error('Error loading sesiones:', error);
    }
  };

  const handleCanalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCanalId = parseInt(e.target.value);
    setCanalId(selectedCanalId);
    setSesionId(0); // Reset sesión
    setSesiones([]); // Limpiar sesiones
    
    if (selectedCanalId > 0) {
      loadSesiones(selectedCanalId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!contenido.trim()) {
      setError('El contenido del mensaje es requerido');
      return;
    }

    if (!canalId) {
      setError('Debe seleccionar un canal');
      return;
    }

    if (!sesionId) {
      setError('Debe seleccionar una sesión');
      return;
    }

    if (!contactoId) {
      setError('Debe seleccionar un contacto');
      return;
    }

    if (!embudoId) {
      setError('Debe seleccionar un embudo');
      return;
    }

    setIsLoading(true);

    try {
      const mensajeData: MensajeData = {
        canal_id: canalId,
        remitente_id: userId,
        contenido: contenido.trim(),
        contacto_id: contactoId,
        sesion_id: sesionId,
        destinatario_id: destinatarioId,
        embudo_id: embudoId
      };

      console.log('Enviando mensaje:', mensajeData);

      const result = await mensajesServices.createMensaje(mensajeData);

      if (result.success) {
        console.log('Mensaje creado exitosamente');
        onMensajeCreated();
        handleClose();
      } else {
        setError(result.error || 'Error al crear el mensaje');
      }
    } catch (error) {
      console.error('Error creating mensaje:', error);
      setError('Error inesperado al crear el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setContenido('');
    setCanalId(0);
    setSesionId(0);
    setContactoId(0);
    setEmbudoId(0);
    setSesiones([]);
    setError(null);
    // destinatarioId siempre es 0, no necesita reseteo
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45] w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold">Nuevo Mensaje</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loadingData ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Cargando datos...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Grid de 2 columnas para los campos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Canal */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Canal *
                  </label>
                  <select
                    value={canalId}
                    onChange={handleCanalChange}
                    className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F]"
                    required
                  >
                    <option value="">Seleccionar canal</option>
                    {canales.map((canal) => (
                      <option key={canal.id} value={canal.id}>
                        {canal.descripcion} ({canal.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Embudo */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Embudo *
                  </label>
                  <select
                    value={embudoId}
                    onChange={(e) => setEmbudoId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F]"
                    required
                  >
                    <option value="">Seleccionar embudo</option>
                    {embudos.map((embudo) => (
                      <option key={embudo.id} value={embudo.id}>
                        {embudo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sesión */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Sesión *
                  </label>
                  <select
                    value={sesionId}
                    onChange={(e) => setSesionId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F]"
                    required
                    disabled={!canalId}
                  >
                    <option value="">Seleccionar sesión</option>
                    {sesiones.map((sesion) => (
                      <option key={sesion.id} value={sesion.id}>
                        {sesion.nombre} ({sesion.estado})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contacto */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Contacto *
                  </label>
                  <select
                    value={contactoId}
                    onChange={(e) => setContactoId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F]"
                    required
                  >
                    <option value="">Seleccionar contacto</option>
                    {contactos.map((contacto) => (
                      <option key={contacto.id} value={contacto.id}>
                        {contacto.nombre_completo || `${contacto.nombre} ${contacto.apellido || ''}`.trim()} - {contacto.telefono}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Contenido - ocupa todo el ancho */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Contenido del Mensaje *
                </label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1d23] border border-[#3a3d45] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] h-24 resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#F29A1F] hover:bg-[#F29A1F] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors cursor-pointer"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

