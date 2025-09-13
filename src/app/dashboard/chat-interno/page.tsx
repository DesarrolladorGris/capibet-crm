'use client';

import { X, Paperclip, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface ChatInternoConversation {
  id: number;
  created_at: string;
  cliente_id: number;
  operador_id: number | null;
  estado: string;
  cliente_nombre?: string;
  cliente_email?: string;
  operador_nombre?: string;
  unread_count?: number;
  total_messages?: number;
}

interface MensajeInterno {
  id: number;
  chat_interno_id: number;
  mensaje: string;
  leido: boolean;
  emisor: 'cliente' | 'operador';
  created_at: string;
}

const ChatInternoPage = () => {
  const [conversations, setConversations] = useState<ChatInternoConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatInternoConversation | null>(null);
  const [messages, setMessages] = useState<MensajeInterno[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Función para filtrar conversaciones por estado
  const getFilteredConversations = () => {
    if (statusFilter === 'TODOS') {
      return conversations;
    }
    return conversations.filter(conv => conv.estado === statusFilter);
  };

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
    
    // Obtener ID del usuario logueado
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
  }, []);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await supabaseService.getAllChatInternoConversations();
      if (result.success) {
        // Enriquecer con datos del cliente y operador
        const usuariosResult = await supabaseService.getAllUsuarios();
        const usuarios = usuariosResult.success ? usuariosResult.data : [];
        
        // Obtener conteo de mensajes no leídos
        const unreadCountsResult = await supabaseService.getUnreadMessagesCounts();
        const unreadCounts = unreadCountsResult.success ? unreadCountsResult.data : {};
        
        // Obtener conteo total de mensajes
        const totalCountsResult = await supabaseService.getTotalMessagesCounts();
        const totalCounts = totalCountsResult.success ? totalCountsResult.data : {};
        
        const enrichedConversations = result.data.map((conv: any) => {
          // Obtener datos del cliente
          const cliente = usuarios.find((user: any) => user.id === conv.cliente_id);
          
          // Obtener datos del operador (si está asignado)
          const operador = conv.operador_id ? usuarios.find((user: any) => user.id === conv.operador_id) : null;
          
          return {
            ...conv,
            cliente_nombre: cliente?.nombre_usuario || `Cliente ${conv.cliente_id}`,
            cliente_email: cliente?.correo_electronico || '',
            operador_nombre: operador?.nombre_usuario || null,
            unread_count: unreadCounts[conv.id] || 0,
            total_messages: totalCounts[conv.id] || 0
          };
        });
        
        setConversations(enrichedConversations);
        
        // Debug: Verificar estados de las conversaciones
        console.log('🔍 Estados de conversaciones cargadas:', enrichedConversations.map(conv => ({
          id: conv.id,
          cliente: conv.cliente_nombre,
          estado: conv.estado
        })));
        
        // Seleccionar la primera conversación si existe
        if (enrichedConversations.length > 0) {
          setSelectedConversation(enrichedConversations[0]);
        }
      } else {
        console.error('Error al cargar conversaciones:', result.error);
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatInternoId: number) => {
    setLoadingMessages(true);
    try {
      const result = await supabaseService.getMensajesInternosByConversation(chatInternoId);
      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error al cargar mensajes:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    try {
      // Paso 1: Crear el mensaje
      const messageResult = await supabaseService.createMensajeInterno(
        selectedConversation.id,
        newMessage.trim(),
        'operador'
      );

      if (messageResult.success) {
        // Paso 2: Actualizar la conversación con el operador_id
        console.log('🚀 Asignando operador a la conversación:', {
          chatInternoId: selectedConversation.id,
          operadorId: currentUserId
        });
        
        const updateResult = await supabaseService.updateChatInternoConversation(
          selectedConversation.id,
          currentUserId
        );

        if (updateResult.success) {
          console.log('✅ Operador asignado exitosamente a la conversación');
          
          // Obtener el nombre del operador actual
          const currentUserName = localStorage.getItem('userName') || 'Operador';
          
          // Actualizar el estado local de la conversación
          setSelectedConversation(prev => prev ? {
            ...prev,
            operador_id: currentUserId,
            operador_nombre: currentUserName,
            estado: 'EN CURSO'
          } : null);

          // Actualizar también en la lista de conversaciones
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, operador_id: currentUserId, operador_nombre: currentUserName, estado: 'EN CURSO' }
              : conv
          ));
        } else {
          console.error('❌ Error al asignar operador:', updateResult.error);
        }

        // Paso 3: Marcar mensajes del cliente como leídos
        console.log('🚀 Marcando mensajes del cliente como leídos...');
        const readResult = await supabaseService.markMensajesInternosAsRead(selectedConversation.id);
        
        if (readResult.success) {
          console.log('✅ Mensajes marcados como leídos exitosamente');
          
          // Actualizar el conteo de no leídos en la conversación seleccionada
          setSelectedConversation(prev => prev ? {
            ...prev,
            unread_count: 0,
            total_messages: (prev.total_messages || 0) + 1
          } : null);

          // Actualizar también en la lista de conversaciones
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation.id 
              ? { ...conv, unread_count: 0, total_messages: (conv.total_messages || 0) + 1 }
              : conv
          ));
        } else {
          console.error('❌ Error al marcar mensajes como leídos:', readResult.error);
        }

        setNewMessage('');
        // Recargar mensajes para reflejar el estado de leído
        loadMessages(selectedConversation.id);
      } else {
        console.error('Error al enviar mensaje:', messageResult.error);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Función para mostrar modal de confirmación de cierre
  const handleCloseConversation = () => {
    setShowCloseModal(true);
  };

  // Función para confirmar el cierre de conversación
  const confirmCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      console.log('🔒 Cerrando conversación:', selectedConversation.id);
      const result = await supabaseService.finalizeChatInternoConversation(selectedConversation.id);

      if (result.success) {
        console.log('✅ Conversación cerrada exitosamente');
        
        // Actualizar el estado local de la conversación
        setSelectedConversation(prev => prev ? {
          ...prev,
          estado: 'FINALIZADO'
        } : null);

        // Actualizar también en la lista de conversaciones
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, estado: 'FINALIZADO' }
            : conv
        ));

        setShowCloseModal(false);
      } else {
        console.error('❌ Error al cerrar conversación:', result.error);
        alert('Error al cerrar la conversación. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al cerrar conversación:', error);
      alert('Error inesperado al cerrar la conversación');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };
  if (loading) {
    return (
      <div className="flex h-full bg-[var(--bg-primary)] text-[var(--text-primary)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Conversations List */}
      <div className="w-1/4 border-r border-[var(--border-primary)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-primary)]">
          <h2 className="text-xl font-semibold flex items-center justify-between">
            Mensajes internos
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[var(--text-muted)]">{getFilteredConversations().length}</span>
              <button 
                onClick={() => setShowFilterModal(true)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
                title="Filtrar conversaciones"
              >
                <Filter size={20} />
              </button>
            </div>
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {getFilteredConversations().length === 0 ? (
            <div className="p-4 text-center text-[var(--text-muted)]">
              <p>No hay conversaciones</p>
            </div>
          ) : (
            getFilteredConversations().map((conversation) => (
              <div 
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-3 flex items-center space-x-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-[var(--bg-secondary)]' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-[#F29A1F] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  {conversation.total_messages && conversation.total_messages > 0 && (
                    <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.total_messages > 9 ? '9+' : conversation.total_messages}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{conversation.cliente_nombre}</h3>
                  <p className="text-sm text-[var(--text-muted)] truncate">{conversation.cliente_email}</p>
                  {conversation.operador_nombre && (
                    <p className="text-xs text-[var(--accent-primary)] truncate">
                      👤 {conversation.operador_nombre}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      conversation.estado === 'EN CURSO' || conversation.estado === 'CURSO'
                        ? 'bg-green-500 bg-opacity-30 text-green-600 border border-green-500' 
                        : conversation.estado === 'PENDIENTE'
                        ? 'bg-yellow-500 bg-opacity-30 text-yellow-600 border border-yellow-500'
                        : conversation.estado === 'FINALIZADO'
                        ? 'bg-gray-500 bg-opacity-30 text-gray-600 border border-gray-500'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                    }`}>
                      {conversation.estado || 'SIN ESTADO'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatDate(conversation.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#F29A1F] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.cliente_nombre}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{selectedConversation.cliente_email}</p>
                  {selectedConversation.operador_nombre && (
                    <p className="text-xs text-[var(--accent-primary)]">
                      👤 Asignado a: {selectedConversation.operador_nombre}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  selectedConversation.estado === 'EN CURSO' || selectedConversation.estado === 'CURSO'
                    ? 'bg-green-500 bg-opacity-30 text-green-600 border border-green-500' 
                    : selectedConversation.estado === 'PENDIENTE'
                    ? 'bg-yellow-500 bg-opacity-30 text-yellow-600 border border-yellow-500'
                    : selectedConversation.estado === 'FINALIZADO'
                    ? 'bg-gray-500 bg-opacity-30 text-gray-600 border border-gray-500'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }`}>
                  {selectedConversation.estado || 'SIN ESTADO'}
                </span>
                <button 
                  onClick={handleCloseConversation}
                  disabled={selectedConversation.estado === 'FINALIZADO'}
                  className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                    selectedConversation.estado === 'FINALIZADO'
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={selectedConversation.estado === 'FINALIZADO' ? 'Conversación ya finalizada' : 'Cerrar conversación'}
                >
                  <X size={16} />
                  <span className="text-sm">
                    {selectedConversation.estado === 'FINALIZADO' ? 'Cerrada' : 'Cerrar'}
                  </span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-no-repeat bg-center" style={{ backgroundImage: 'url(/chat-bg-pattern.svg)', backgroundSize: '100px', backgroundRepeat: 'repeat' }}>
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
                    <p className="text-sm text-[var(--text-muted)]">Cargando mensajes...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
                    <Paperclip size={48} className="text-[var(--text-muted)]"/>
                  </div>
                  <h4 className="text-xl font-semibold">Aún no hay mensajes</h4>
                  <p className="text-[var(--text-muted)]">Inicia una conversación</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.emisor === 'operador' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.emisor === 'operador' 
                          ? 'bg-[var(--accent-primary)] text-white' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      }`}>
                        <p className="text-sm">{message.mensaje}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.emisor === 'operador' 
                            ? 'text-white text-opacity-70' 
                            : 'text-[var(--text-muted)]'
                        }`}>
                          <span className="text-xs">
                            {formatTime(message.created_at)}
                          </span>
                          {message.emisor === 'cliente' && (
                            <span className="text-xs flex items-center ml-2">
                              {message.leido ? (
                                <span className="text-[var(--accent-primary)]">✓✓</span>
                              ) : (
                                <span>✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-[var(--bg-secondary)] flex items-center space-x-4">
              {selectedConversation.estado === 'FINALIZADO' ? (
                <div className="flex-1 text-center py-3">
                  <span className="text-[var(--text-muted)] text-sm">
                    🔒 Esta conversación ha sido cerrada
                  </span>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Mensaje"
                    className="flex-1 bg-transparent focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4">
              <Paperclip size={48} className="text-[var(--text-muted)]"/>
            </div>
            <h4 className="text-xl font-semibold">Selecciona una conversación</h4>
            <p className="text-[var(--text-muted)]">Elige una conversación para ver los mensajes</p>
          </div>
        )}
      </div>

      {/* Modal de filtro de conversaciones */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Filtrar Conversaciones
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Estado de la conversación
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN CURSO">En Curso</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setStatusFilter('TODOS');
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-md transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para cerrar conversación */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Cerrar Conversación
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-6">
              ¿Estás seguro de que deseas cerrar esta conversación? Esta acción marcará la conversación como finalizada y no se puede deshacer.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCloseConversation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Cerrar Conversación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInternoPage;
