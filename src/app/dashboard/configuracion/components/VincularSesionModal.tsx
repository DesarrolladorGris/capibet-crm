'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Link, Building2, Workflow, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { embudoServices } from '@/services/embudoServices';
import { espacioTrabajoServices } from '@/services/espacioTrabajoServices';
import { whatsAppApiService, GenerateQRResponse } from '@/config/whatsapp_api';
import { sesionesServices } from '@/services/sesionesServices';
import { whatsappSessionsServices } from '@/services/whatsappSessionsServices';

interface EspacioTrabajo {
  id: number;
  nombre: string;
  descripcion?: string;
  usuario_id?: number;
  creado_en?: string;
}

interface Embudo {
  id: number;
  nombre: string;
  descripcion?: string | null;
  espacio_id: number;
  orden: number;
  creado_en?: string;
}

interface VincularSesionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVincular: (data: {
    nombre: string;
    descripcion: string;
    embudo_id: number;
    type: string;
    sesionId?: number;
  }) => void;
  tipoSesion: string;
}

export default function VincularSesionModal({
  isOpen,
  onClose,
  onVincular,
  tipoSesion
}: VincularSesionModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    embudo_id: '',
  });
  const [espaciosTrabajo, setEspaciosTrabajo] = useState<EspacioTrabajo[]>([]);
  const [embudosPorEspacio, setEmbudosPorEspacio] = useState<Record<number, Embudo[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Estados para el flujo de WhatsApp QR
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState<GenerateQRResponse | null>(null);
  const [qrStep, setQrStep] = useState<'generating' | 'scanning' | 'connected' | 'error'>('generating');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tempSesionData, setTempSesionData] = useState<{
    nombre: string;
    descripcion: string;
    embudo_id: number;
    type: string;
    sessionId: string;
    sesionId?: number; // ID de la sesión creada en la DB
  } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const resetQRState = useCallback(() => {
    setShowQR(false);
    setQrData(null);
    setQrStep('generating');
    setErrorMessage('');
    
    // Limpiar datos temporales del servidor si existen
    if (tempSesionData?.sessionId) {
      fetch(`/api/whatsapp_sessions/temp-data?sessionId=${tempSesionData.sessionId}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error limpiando datos temporales:', err));
    }
    
    setTempSesionData(null);
    
    // Limpiar polling si existe
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval, tempSesionData]);

  const loadEspaciosTrabajo = useCallback(async () => {
    setLoadingData(true);
    try {
      const result = await espacioTrabajoServices.getAllEspaciosTrabajo();
      if (result.success && result.data) {
        setEspaciosTrabajo(result.data);
        // Cargar embudos para cada espacio
        await loadEmbudosForEspacios(result.data);
      }
    } catch (error) {
      console.error('Error loading espacios de trabajo:', error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadEspaciosTrabajo();
      
      if (!showQR || qrStep === 'generating') {
        setFormData({
          nombre: '',
          descripcion: '',
          embudo_id: '',
        });
        setErrorMessage('');
      }
      
      if (qrStep !== 'scanning') {
        resetQRState();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup polling cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const loadEmbudosForEspacios = async (espacios: EspacioTrabajo[]) => {
    const embudosPorEspacioData: Record<number, Embudo[]> = {};
    
    for (const espacio of espacios) {
      try {
        const result = await embudoServices.getEmbudosByEspacio(espacio.id);
        if (result.success && result.data) {
          embudosPorEspacioData[espacio.id] = result.data;
        }
      } catch (error) {
        console.error(`Error loading embudos for espacio ${espacio.id}:`, error);
        embudosPorEspacioData[espacio.id] = [];
      }
    }
    
    setEmbudosPorEspacio(embudosPorEspacioData);
  };

  const generateWhatsAppQR = async () => {
    let qrGenerated = false;
    
    try {
      setLoading(true);
      setQrStep('generating');
      setErrorMessage('');
      
      // Solo generar el QR, NO crear ninguna sesión todavía
      const qrResponse = await whatsAppApiService.generateQR();
      setQrData(qrResponse);
      qrGenerated = true; // Marcar que el QR se generó exitosamente
      
      // Obtener datos del usuario actual desde localStorage
      const userDataStr = localStorage.getItem('userData');
      let userId

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id;
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error);
        }
      }

      // Almacenar los datos del formulario temporalmente asociados al sessionId
      const tempData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        embudo_id: parseInt(formData.embudo_id),
        type: tipoSesion,
        sessionId: qrResponse.sessionId,
        usuario_id: userId,
        creado_por: userId
      };
      
      // Guardar en el servidor temporalmente
      const tempDataResponse = await fetch('/api/whatsapp_sessions/temp-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: qrResponse.sessionId,
          data: tempData
        })
      });

      if (!tempDataResponse.ok) {
        const errorText = await tempDataResponse.text();
        console.error('Error response from temp-data endpoint:', errorText);
        throw new Error(`Error al almacenar datos temporales: ${tempDataResponse.status} ${tempDataResponse.statusText}`);
      }
      
      setTempSesionData(tempData);
      setQrStep('scanning');
      
      console.log('✅ QR generado');
      
      // Iniciar polling para verificar cuando la sesión se cree (el endpoint la creará)
      startPollingForConnection(qrResponse.sessionId);
      
    } catch (error) {
      console.error('Error generating QR:', error);
      
      // Personalizar el mensaje de error según si el QR se generó o no
      if (qrGenerated) {
        setErrorMessage(`QR generado exitosamente, pero hubo un error al procesar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Error al generar QR');
      }
      
      setQrStep('error');
      
      // Solo ocultar el QR si no se generó exitosamente
      // Si ya se generó el QR, mantener showQR=true y solo mostrar el error
      if (!qrGenerated) {
        setShowQR(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar el estado real de la sesión de WhatsApp
  const checkWhatsAppSessionStatus = async (sessionId: string): Promise<boolean> => {
    try {
      // Verificar directamente en la tabla whatsapp_sessions
      const response = await fetch(`/api/whatsapp_sessions?session_id=eq.${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.error('Error verificando estado de WhatsApp session:', response.status);
        return false;
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const whatsappSession = result.data[0];
        // Solo considerar conectada si tiene status 'connected' y datos de conexión
        return whatsappSession.status === 'connected' && 
               whatsappSession.phone_number && 
               whatsappSession.whatsapp_user_id;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando estado de WhatsApp session:', error);
      return false;
    }
  };

  // Función para iniciar polling y verificar cuando la sesión se cree y active
  const startPollingForConnection = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        // Primero verificar el estado real de la sesión de WhatsApp
        const isWhatsAppConnected = await checkWhatsAppSessionStatus(sessionId);
        
        if (isWhatsAppConnected) {
          // Ahora buscar la sesión principal asociada
          const result = await sesionesServices.getSesionesWhatsAppBySession(sessionId);
          
          console.log('🔍 Resultado del polling de sesión principal:', {
            success: result.success,
            dataLength: result.data?.length || 0,
          });
          
          if (result.success && result.data && result.data.length > 0) {
            const sesion = result.data[0];
            
            const whatsappSessionResult = await whatsappSessionsServices.getWhatsAppSessionBySessionId(sessionId);
            if (whatsappSessionResult.success && whatsappSessionResult.data) {
              const whatsappSessionId = whatsappSessionResult.data.id;
              if (sesion.estado === 'activo' && Number(sesion.whatsapp_session) === whatsappSessionId) {
                console.log('✅ Sesión conectada exitosamente detectada via polling');
                
                // Actualizar tempSesionData con el sesionId real
                setTempSesionData(prev => prev ? {
                  ...prev,
                  sesionId: sesion.id
                } : null);
                
                // Limpiar datos temporales del servidor
                fetch(`/api/whatsapp_sessions/temp-data?sessionId=${sessionId}`, {
                  method: 'DELETE'
                }).catch(err => console.error('Error limpiando datos temporales:', err));
                
                handleWhatsAppConnection();
                
                // Limpiar polling
                clearInterval(interval);
                setPollingInterval(null);
              } else {
                console.log('⏳ Sesión principal encontrada pero no está activa o no coincide:');
              }
            } else {
              console.log('⏳ No se pudo obtener la sesión de WhatsApp para sessionId:', sessionId);
            }
          } else {
            console.log('⏳ WhatsApp conectada pero sesión principal no encontrada aún para sessionId:', sessionId);
          }
        } else {
          console.log('⏳ WhatsApp session aún no conectada para sessionId:', sessionId);
        }
      } catch (error) {
        console.error('Error polling session status:', error);
        // Continuar polling en caso de error temporal
      }
    }, 3000); // Verificar cada 3 segundos (reducir frecuencia)

    setPollingInterval(interval);

    // Timeout después de 5 minutos para evitar polling infinito
    setTimeout(() => {
      console.log('⏰ Timeout del polling alcanzado para sessionId:', sessionId);
      clearInterval(interval);
      setPollingInterval(null);
      
      if (qrStep === 'scanning') {
        setErrorMessage('Tiempo de espera agotado. Por favor, intenta nuevamente.');
        setQrStep('error');
      }
      
      // Limpiar datos temporales del servidor en caso de timeout
      fetch(`/api/whatsapp_sessions/temp-data?sessionId=${sessionId}`, {
        method: 'DELETE'
      }).catch(err => console.error('Error limpiando datos temporales:', err));
    }, 300000); // 5 minutos
  };

  // Función para manejar la conexión exitosa
  const handleWhatsAppConnection = () => {
    setQrStep('connected');
    
    setTimeout(() => {
      handleSuccessfulConnection();
    }, 2000);
  };

  const handleSuccessfulConnection = async () => {
    if (tempSesionData && tempSesionData.sesionId) {
      try {
        // Obtener la sesión actualizada para incluir toda la información
        const sesionResult = await sesionesServices.getSesionById(tempSesionData.sesionId);
        
        if (sesionResult.success && sesionResult.data) {
          // Llamar a onVincular con los datos completos incluyendo el ID de la sesión
          onVincular({
            ...tempSesionData,
            sesionId: sesionResult.data.id
          });
        } else {
          // Fallback - asegurar que tempSesionData tenga sesionId
          onVincular({
            ...tempSesionData,
            sesionId: tempSesionData.sesionId
          });
        }
      } catch (error) {
        console.error('Error obteniendo sesión actualizada:', error);
        // Fallback - asegurar que tempSesionData tenga sesionId
        console.log('⚠️ Error fallback: usando tempSesionData con sesionId:', tempSesionData.sesionId);
        onVincular({
          ...tempSesionData,
          sesionId: tempSesionData.sesionId
        });
      }
      
      resetQRState();
    } else {
      console.error('❌ No se puede completar conexión: falta tempSesionData o sesionId');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre de la sesión es requerido');
      return;
    }

    if (!formData.embudo_id) {
      alert('Debe seleccionar un embudo');
      return;
    }

    // Si es WhatsApp QR, mostrar el flujo de QR
    if (tipoSesion === 'whatsapp_qr') {
      setShowQR(true);
      generateWhatsAppQR();
      return;
    }

    // Para otros tipos de sesiones, usar el flujo normal
    onVincular({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      embudo_id: parseInt(formData.embudo_id),
      type: tipoSesion,
    });
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      embudo_id: '',
    });
    resetQRState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2a2d35] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#F29A1F] bg-opacity-20 rounded-lg">
              <Link className="w-6 h-6 text-[#F29A1F]" />
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold">
                Vincular Sesión a Canal
              </h3>
              <p className="text-gray-400 text-sm">
                Configura una nueva sesión para {tipoSesion.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mostrar QR para WhatsApp o formulario normal */}
        {showQR && tipoSesion === 'whatsapp_qr' ? (
          <div className="space-y-6">
            {/* Header de QR */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-[#25D366] bg-opacity-20 rounded-lg">
                  <QrCode className="w-8 h-8 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="text-white text-lg font-semibold">
                    {qrStep === 'generating' && 'Generando QR...'}
                    {qrStep === 'scanning' && 'Escanea el QR con WhatsApp'}
                    {qrStep === 'connected' && '¡Conectado exitosamente!'}
                    {qrStep === 'error' && 'Error de conexión'}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {qrStep === 'generating' && 'Preparando código QR para vinculación'}
                    {qrStep === 'scanning' && 'Usa la cámara de WhatsApp para escanear el código'}
                    {qrStep === 'connected' && 'Tu cuenta de WhatsApp ha sido vinculada correctamente'}
                    {qrStep === 'error' && 'Hubo un problema al conectar tu cuenta'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del QR */}
            <div className="bg-[#1a1d23] rounded-lg p-6">
              {qrStep === 'generating' && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25D366]"></div>
                  <span className="ml-3 text-gray-400">Generando código QR...</span>
                </div>
              )}

              {qrStep === 'scanning' && qrData && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <Image 
                      src={qrData.qr} 
                      alt="QR Code for WhatsApp" 
                      width={256}
                      height={256}
                      className="mx-auto"
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-white font-medium">Instrucciones:</p>
                    <ol className="text-gray-400 text-sm space-y-2 text-left max-w-md mx-auto">
                      <li>1. Abre WhatsApp en tu teléfono</li>
                      <li>2. Ve a Configuración {'>'} Dispositivos vinculados</li>
                      <li>3. Toca &quot;Vincular un dispositivo&quot;</li>
                      <li>4. Escanea este código QR</li>
                    </ol>
                    <div className="flex items-center justify-center mt-4">
                      <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse mr-2"></div>
                      <span className="text-gray-400 text-sm">Esperando que escanees el código...</span>
                    </div>
                  </div>
                </div>
              )}

              {qrStep === 'connected' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">¡Vinculación exitosa!</h3>
                  <p className="text-gray-400">
                    Tu cuenta de WhatsApp ha sido vinculada correctamente a {tempSesionData?.nombre}
                  </p>
                </div>
              )}

              {qrStep === 'error' && (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">Error de vinculación</h3>
                  <p className="text-gray-400 mb-4">{errorMessage}</p>
                  <button
                    onClick={() => {
                      // Si tenemos QR data, solo retry el proceso post-QR
                      // Si no tenemos QR data, resetear todo y empezar de nuevo
                      if (qrData) {
                        setQrStep('scanning');
                        setErrorMessage('');
                        // Reintenta el polling o proceso post-QR
                        if (tempSesionData?.sessionId) {
                          startPollingForConnection(tempSesionData.sessionId);
                        }
                      } else {
                        resetQRState();
                        generateWhatsAppQR();
                      }
                    }}
                    className="bg-[#F29A1F] hover:bg-[#E8890F] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {qrData ? 'Reanudar escaneo' : 'Intentar de nuevo'}
                  </button>
                </div>
              )}
            </div>

            {/* Botones para QR */}
            <div className="flex space-x-4 pt-4 border-t border-[#3a3d45]">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {qrStep === 'connected' ? 'Finalizar' : 'Cancelar'}
              </button>
              {qrStep === 'scanning' && (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQR(false);
                      resetQRState();
                    }}
                    className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-3 rounded-lg transition-colors font-medium"
                  >
                    Volver al formulario
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Para testing - simular conexión exitosa
                      handleWhatsAppConnection();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium text-sm"
                  >
                    Simular conexión ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mostrar error si hubo problema con QR */}
            {errorMessage && tipoSesion === 'whatsapp_qr' && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h4 className="text-red-500 font-medium">Error al generar QR</h4>
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Nombre de la sesión */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Nombre de la sesión <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F29A1F] transition-colors"
                placeholder="Ej: Ventas por WhatsApp"
                required
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
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#F29A1F] transition-colors resize-none"
              placeholder="Descripción de la sesión..."
              rows={3}
            />
          </div>

          {/* Selector de Embudos */}
          <div>
            <label className="block text-white text-sm font-medium mb-3">
              Seleccionar Embudo <span className="text-red-400">*</span>
            </label>
            
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F29A1F]"></div>
                <span className="ml-3 text-gray-400">Cargando embudos...</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {espaciosTrabajo.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No hay espacios de trabajo disponibles</p>
                  </div>
                ) : (
                  espaciosTrabajo.map((espacio) => (
                    <div key={espacio.id} className="bg-[#1a1d23] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="w-5 h-5 text-[#F29A1F]" />
                        <div>
                          <h4 className="text-white font-medium">{espacio.nombre}</h4>
                          {espacio.descripcion && (
                            <p className="text-gray-400 text-sm">{espacio.descripcion}</p>
                          )}
                        </div>
                      </div>
                      
                      {embudosPorEspacio[espacio.id] && embudosPorEspacio[espacio.id].length > 0 ? (
                        <div className="space-y-2">
                          {embudosPorEspacio[espacio.id].map((embudo) => (
                            <label
                              key={embudo.id}
                              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                formData.embudo_id === embudo.id.toString()
                                  ? 'bg-[#F29A1F] bg-opacity-20 border border-[#F29A1F]'
                                  : 'bg-[#2a2d35] hover:bg-[#3a3d45] border border-transparent'
                              }`}
                            >
                              <input
                                type="radio"
                                name="embudo_id"
                                value={embudo.id}
                                checked={formData.embudo_id === embudo.id.toString()}
                                onChange={(e) => setFormData({ ...formData, embudo_id: e.target.value })}
                                className="sr-only"
                              />
                              <Workflow className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <div className="text-white text-sm font-medium">{embudo.nombre}</div>
                                {embudo.descripcion && (
                                  <div className="text-gray-400 text-xs">{embudo.descripcion}</div>
                                )}
                              </div>
                              {formData.embudo_id === embudo.id.toString() && (
                                <div className="w-2 h-2 bg-[#F29A1F] rounded-full"></div>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Workflow className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No hay embudos en este espacio</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-4 border-t border-[#3a3d45]">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.nombre.trim() || !formData.embudo_id || loading}
                className="flex-1 bg-[#F29A1F] hover:bg-[#F29A1F] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {loading ? 'Vinculando...' : tipoSesion === 'whatsapp_qr' ? 'Generar QR' : 'Vincular'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
