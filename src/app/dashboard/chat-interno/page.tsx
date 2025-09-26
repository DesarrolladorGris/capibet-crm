'use client';

import { X, Paperclip, Filter, Plus, Smile, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { chatInternoServices } from '@/services/chatInternoServices';
import { userServices } from '@/services/userServices';

// Lista de iconos para mensajes
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😂', '🤣', '😍', '😊', '😌', '😚',
  '😘', '😋', '😉', '😎', '🤔', '🤗', '😏', '😒', '😜', '🤯',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '❤️', '💙', '💚', '💛',
  '💜', '🧡', '❤️', '💕', '💞', '💓', '💗', '💖', '✨', '🌟',
  '🔥', '⚡', '💯', '🎉', '🎊', '🎈', '🎁', '✅', '❌', '⚠️',
  '🚀', '💡', '🎯', '🏆', '💰', '💸', '💎', '🎪', '🎭', '🎨'
];

interface ChatInternoConversation {
  id: number;
  created_at: string;
  emisor_id: number;
  receptor_id: number;
  estado: string;
  tema: string;
  emisor_nombre?: string;
  receptor_nombre?: string;
  emisor_email?: string;
  receptor_email?: string;
  unread_count?: number;
  total_messages?: number;
}

interface MensajeInterno {
  id: number;
  chat_interno_id: number;
  mensaje: string;
  leido: boolean;
  emisor: 'emisor' | 'receptor';
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
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{id: number, tema: string} | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  
  // Estados para nuevo chat
  const [newChatTema, setNewChatTema] = useState('');
  const [newChatReceptor, setNewChatReceptor] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estados para iconos en mensajes
  const [selectedEmoji, setSelectedEmoji] = useState('');
  
  // Estados para polling de mensajes nuevas
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  
  // Estado para recarga manual
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para filtrar conversaciones por estado
  const getFilteredConversations = () => {
    if (statusFilter === 'TODOS') {
      return conversations;
    }
    
    // Aplicar filtro con normalización para asegurar que funciona independientemente 
    // del formato que se use en la base de datos (EN_CURSO vs EN CURSO, etc.)
    const filtered = conversations.filter(conv => {
      const normalizedConvEstado = conv.estado?.toUpperCase().replace(/\s+/g, '_');
      const normalizedFilter = statusFilter.toUpperCase().replace(/\s+/g, '_');
      
      return normalizedConvEstado === normalizedFilter || conv.estado === statusFilter;
    });
    
    console.log('Filtrando conversaciones:', {
      statusFilter,
      totalConversations: conversations.length,
      filteredConversations: filtered.length,
      filterApplied: filtered,
      allStates: conversations.map(c => ({ id: c.id, estado: c.estado }))
    });
    
    return filtered;
  };

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
    
    // Obtener ID del usuario logueado
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(parseInt(userId));
    }
    
    // Cargar usuarios para el formulario de nuevo chat
    loadUsuarios();
  }, []);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Cerrar emoji picker cuando se presiona Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showEmojiPicker]);

  // Cerrar emoji picker cuando se hace click fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        const target = event.target as Element;
        const isInsidePicker = target.closest('.emoji-picker-container');
        if (!isInsidePicker) {
          setShowEmojiPicker(false);
        }
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showEmojiPicker]);

  // Polling automático para verificar mensajes nuevos cada 7 segundos
  useEffect(() => {
    if (!isPollingEnabled || !selectedConversation) {
      return;
    }

    console.log('🔄 Iniciando polling de mensajes cada 7 segundos');

    const interval = setInterval(() => {
      if (isPollingEnabled && selectedConversation) {
        checkNewMessages();
      }
    }, 7000);

    // Cleanup al cambiar de conversación o desmontar componente
    return () => {
      console.log('🛑 Limpiando polling de mensajes');
      clearInterval(interval);
    };
  }, [isPollingEnabled, selectedConversation, lastMessageCount]);

  // Deshabilitar polling cuando la ventana no está enfocada o página no visibles
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPollingEnabled(false);
        console.log('🛑 Página no visible - polling deshabilitado');
      } else {
        setIsPollingEnabled(true);
        console.log('🔄 Página visible - polling habilitado');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => setIsPollingEnabled(true));
    window.addEventListener('blur', () => setIsPollingEnabled(false));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => setIsPollingEnabled(true));
      window.removeEventListener('blur', () => setIsPollingEnabled(false));
    };
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
        // Usar el nuevo chatInternoServices para obtener conversaciones
        const result = await chatInternoServices.getAllChatInterno();
        if (result.success && result.data) {
          // Enriquecer con datos de los usuarios (emisor y receptor)
          const usuariosResult = await userServices.getAllUsuarios();
          const usuarios = usuariosResult.success && usuariosResult.data ? usuariosResult.data : [];
          
          const enrichedConversations: ChatInternoConversation[] = result.data.map((conv) => ({
            id: conv.id,
            created_at: conv.created_at || new Date().toISOString(),
            emisor_id: conv.emisor_id,
            receptor_id: conv.receptor_id,
            estado: conv.estado,
            tema: conv.tema,
            // Buscar datos del emisor y receptor
            emisor_nombre: usuarios.find((user: {id: number}) => user.id === conv.emisor_id)?.nombre_usuario || `Usuario ${conv.emisor_id}`,
            receptor_nombre: usuarios.find((user: {id: number}) => user.id === conv.receptor_id)?.nombre_usuario || `Usuario ${conv.receptor_id}`,
            emisor_email: usuarios.find((user: {id: number}) => user.id === conv.emisor_id)?.correo_electronico || '',
            receptor_email: usuarios.find((user: {id: number}) => user.id === conv.receptor_id)?.correo_electronico || '',
            unread_count: 0,
            total_messages: 0  // Se actualizará más abajo
          }));
          
          // Actualizar conversaciones inmediatamente con datos básicos
          setConversations(enrichedConversations);
          
          // Cargar conteo de mensajes para cada conversación en paralelo
          Promise.all(
            enrichedConversations.map(async (conversation) => {
              const messageCount = await loadMessageCountForConversation(conversation.id);
              return {
                ...conversation,
                total_messages: messageCount
              };
            })
          ).then((conversationsWithCounts) => {
            console.log('📊 Conteos de mensajes actualizados:', conversationsWithCounts.map(c => ({
              tema: c.tema,
              total_messages: c.total_messages
            })));
            setConversations(conversationsWithCounts);
          });
          
          // Debug: Verificar estados de las conversaciones
          console.log('🔍 Conversaciones de chat interno cargadas:', enrichedConversations.map(conv => ({
            id: conv.id,
            tema: conv.tema,
            emisor: conv.emisor_nombre,
            receptor: conv.receptor_nombre,
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
      const result = await chatInternoServices.getMensajesByChat(chatInternoId);
      if (result.success && result.data) {
        // Mapear a la estructura esperada usando emisor_id/receptor_id en lugar del campo emisor string
        const mensajes: MensajeInterno[] = result.data.map(msg => {
          // Determinar si el mensaje fue enviado por el usuario actual usando emisor_id
          const isCurrentUserSender = msg.emisor_id === currentUserId;
          
          return {
            id: msg.id,
            chat_interno_id: msg.chat_interno_id,
            mensaje: msg.mensaje,
            leido: msg.leido,
            emisor: isCurrentUserSender ? 'emisor' : 'receptor', // Usuario actual es 'emisor', otro usuario es 'receptor'
            created_at: msg.created_at || new Date().toISOString()
          };
        });
        setMessages(mensajes);
        setLastMessageCount(result.data.length);
      } else {
        console.error('Error al cargar mensajes:', result.error);
        setMessages([]);
        setLastMessageCount(0);
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setMessages([]);
      setLastMessageCount(0);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const result = await userServices.getAllUsuarios();
      if (result.success && result.data) {
        setUsuarios(result.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Función para seleccionar un emoji
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  // Función para cargar mensajes por conversación para obtener el conteo total
  const loadMessageCountForConversation = async (convId: number): Promise<number> => {
    try {
      const result = await chatInternoServices.getMensajesByChat(convId);
      if (result.success && result.data) {
        return result.data.length;
      }
      return 0;
    } catch (error) {
      console.error('Error al cargar conteo de mensajes:', error);
      return 0;
    }
  };

  // Función para recarga manual de conversaciones
  const handleManualRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      console.log('🔄 Recarga manual iniciada...');
      await loadConversations();
      console.log('✅ Recarga manual completada');
    } catch (error) {
      console.error('❌ Error en recarga manual:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para verificar mensajes nuevos con polling
  const checkNewMessages = async () => {
    if (!isPollingEnabled || !selectedConversation) {
      return;
    }

    try {
      console.log('🔄 Verificando mensajes nuevos...');
      const result = await chatInternoServices.getMensajesByChat(selectedConversation.id);
      
      if (result.success && result.data && result.data.length > lastMessageCount) {
        console.log(`📧 Nuevos mensajes detectados: ${result.data.length - lastMessageCount} mensajes`);
        
        // Actualizar mensajes
        const mensajes: MensajeInterno[] = result.data.map(msg => {
          const isCurrentUserSender = msg.emisor_id === currentUserId;
          
          return {
            id: msg.id,
            chat_interno_id: msg.chat_interno_id,
            mensaje: msg.mensaje,
            leido: msg.leido,
            emisor: isCurrentUserSender ? 'emisor' : 'receptor',
            created_at: msg.created_at || new Date().toISOString()
          };
        });
        
        setMessages(mensajes);
        setLastMessageCount(result.data.length);
        
        // Actualizar también el total de mensajes en la lista de conversaciones
        if (result.data) {
          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv.id === selectedConversation.id
                ? { ...conv, total_messages: result.data?.length || 0 }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('❌ Error verificando mensajes nuevos:', error);
    }
  };

  // Función para verificar si un chat es eliminable (PENDIENTE y sin mensajes)
  const isChatEliminable = (conversation: any) => {
    return conversation.estado === 'PENDIENTE' && (conversation.total_messages === 0 || !conversation.total_messages);
  };

  // Función para iniciar eliminación de chat interno (abre modal)
  const handleDeleteChat = (conversationId: number, conversationTema: string) => {
    setChatToDelete({ id: conversationId, tema: conversationTema });
    setShowDeleteConfirmModal(true);
  };

  // Función para confirmar eliminación de chat interno
  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      console.log(`🗑️ Eliminando chat: ${chatToDelete.id}`);
      const result = await chatInternoServices.deleteChatInterno(chatToDelete.id);
      
      if (result.success) {
        console.log('✅ Chat eliminado exitosamente');
        // Recargar la lista de conversaciones
        await loadConversations();
        // Si el chat eliminado era el seleccionado, limpiar la selección
        if (selectedConversation && selectedConversation.id === chatToDelete.id) {
          setSelectedConversation(null);
          setMessages([]);
        }
      } else {
        console.error('❌ Error al eliminar chat:', result.error);
        alert(`Error al eliminar chat: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error eliminando chat:', error);
      alert('Error al eliminar chat. Inténtalo de nuevo.');
    } finally {
      // Cerrar el modal
      setShowDeleteConfirmModal(false);
      setChatToDelete(null);
    }
  };

  // Función para cancelar eliminación
  const cancelDeleteChat = () => {
    setShowDeleteConfirmModal(false);
    setChatToDelete(null);
  };

  const handleNewChat = async () => {
    if (!newChatTema.trim() || !newChatReceptor || !currentUserId) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      console.log('🚀 Creando nueva conversación...');
      
      const result = await chatInternoServices.createChatInterno({
        emisor_id: currentUserId,
        receptor_id: newChatReceptor,
        tema: newChatTema.trim(),
        estado: 'PENDIENTE'
      });

      if (result.success) {
        console.log('✅ Nueva conversación creada exitosamente');
        
        // Limpiar formulario
        setNewChatTema('');
        setNewChatReceptor(null);
        setShowNewChatModal(false);
        
        // Recargar conversaciones
        await loadConversations();
      } else {
        console.error('❌ Error al crear conversación:', result.error);
        alert('Error al crear la conversación. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      alert('Error inesperado al crear la conversación');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId) return;

    const mensajeToSend = newMessage.trim();
    const finalMessage = selectedEmoji ? `${selectedEmoji} ${mensajeToSend}` : mensajeToSend;
    
    // Desactivar polling temporalmente mientras se envía mensaje
    setIsPollingEnabled(false);
    
    setNewMessage(''); // Limpiamos inmediatamente para mejor UX
    setSelectedEmoji(''); // Limpiamos el emoji seleccionado

    // Actualizar mensajes de forma optimista (agregamos el mensaje inmediatamente)
    const newMensajeFromUser: MensajeInterno = {
      id: Date.now(), // ID temporal mientras se carga el real
      chat_interno_id: selectedConversation.id,
      mensaje: finalMessage,
      leido: false,
      emisor: 'emisor', // Usuario actual es siempre 'emisor' cuando envía
      created_at: new Date().toISOString()
    };

    // Agregar mensaje inmediatamente a la UI para mostrar el mensaje rápidamente
    setMessages(prev => [...prev, newMensajeFromUser]);

    try {
      // Determinar si el usuario actual es emisor o receptor del chat
      const isEmisor = selectedConversation.emisor_id === currentUserId;

      console.log(`💬 Enviando mensaje...`);

      // Paso 1: Crear el mensaje con la nueva estructura
      const messageResult = await chatInternoServices.createMensajeInterno({
        chat_interno_id: selectedConversation.id,
        mensaje: finalMessage,
        emisor_id: currentUserId,
        receptor_id: isEmisor ? selectedConversation.receptor_id : selectedConversation.emisor_id
      });

      if (messageResult.success) {
        console.log('✅ Mensaje creado exitosamente');
        
        // Paso 2: Actualizar el estado de la conversación a EN_CURSO si está PENDIENTE
        if (selectedConversation.estado === 'PENDIENTE') {
          console.log('🚀 Actualizando estado a EN_CURSO...');
          
          const updateResult = await chatInternoServices.updateChatInternoById(
            selectedConversation.id,
            { estado: 'EN_CURSO' }
          );

          if (updateResult.success) {
            console.log('✅ Estado actualizado a EN_CURSO');
            
            // Actualizar el estado local de la conversación
            setSelectedConversation(prev => prev ? {
              ...prev,
              estado: 'EN_CURSO'
            } : null);
          } else {
            console.error('❌ Error al actualizar estado:', updateResult.error);
          }
        }

        // Paso 3: Marcar mensajes pendientes como leídos
        console.log('🚀 Marcando mensajes como leídos...');
        const readResult = await chatInternoServices.marcarMensajesComoLeidos(selectedConversation.id);
        
        if (readResult.success) {
          console.log('✅ Mensajes marcados como leídos exitosamente');
        } else {
          console.error('❌ Error al marcar mensajes como leídos:', readResult.error);
        }

        // Recargar mensajes en segundo plano para obtener datos correctos desde el servidor
        // y reemplazar el mensaje temporal con el del servidor
        setTimeout(async () => {
          await loadMessages(selectedConversation.id);
          // En efecto recargar el conteo de mensajes para la conversación actual
          // pero también obtener la lista fresca actualizada de conversaciones desde la server to avoid inconsistency.
          const currentCount = await loadMessageCountForConversation(selectedConversation.id);
          
          setConversations(prevConversations => 
            prevConversations.map(conv => 
              conv.id === selectedConversation.id 
                ? { ...conv, total_messages: currentCount }
                : conv
            )
          );
          setIsPollingEnabled(true);
        }, 300);
      } else {
        console.error('Error al enviar mensaje:', messageResult.error);
        // Si hay error al crear el mensaje, remover el mensaje temporal
        setMessages(prev => prev.filter(msg => msg.id !== newMensajeFromUser.id));
        setNewMessage(mensajeToSend); // Devolver el mensaje al input para que pueda reintentarlo
        alert('Error al enviar mensaje. Por favor intenta de nuevo.');
        // Reactivar polling en caso de error
        setIsPollingEnabled(true);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Si hay error, remover el mensaje temporal
      setMessages(prev => prev.filter(msg => msg.id !== newMensajeFromUser.id));
      setNewMessage(mensajeToSend); // Devolver el mensaje al input para que pueda reintentarlo
      // Reactivar polling en caso de error
      setIsPollingEnabled(true);
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
      const result = await chatInternoServices.finalizarChatInterno(selectedConversation.id);

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
                onClick={() => setShowNewChatModal(true)}
                className="p-1 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-green-500 hover:text-green-400"
                title="Nuevo mensaje interno"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`p-1 transition-colors rounded-full ${
                  isRefreshing 
                    ? 'bg-[var(--bg-secondary)] cursor-not-allowed animate-spin' 
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}
                title={isRefreshing ? "Recargando..." : "Recargar conversaciones"}
              >
                <RefreshCw 
                  size={20} 
                  className={`transition-colors ${
                    isRefreshing ? 'text-blue-400' : 'hover:text-blue-400'
                  }`}
                />
              </button>
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
                  {/* Mostrar siempre el conteo total de mensajes */}
                  <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.total_messages && conversation.total_messages > 9 ? '9+' : (conversation.total_messages || 0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{conversation.tema}</h3>
                  <p className="text-sm text-[var(--text-muted)] truncate">
                    {conversation.emisor_nombre} → {conversation.receptor_nombre}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {new Date(conversation.created_at).toLocaleDateString('es-ES')}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      conversation.estado === 'EN CURSO' || conversation.estado === 'CURSO' || conversation.estado === 'EN_CURSO'
                        ? 'bg-green-500 bg-opacity-30 text-green-600 border border-green-500' 
                        : conversation.estado === 'PENDIENTE'
                        ? 'bg-yellow-500 bg-opacity-30 text-yellow-600 border border-yellow-500'
                        : conversation.estado === 'FINALIZADO'
                        ? 'bg-gray-500 bg-opacity-30 text-gray-600 border border-gray-500'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                    }`}>
                      {conversation.estado || 'SIN ESTADO'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatDate(conversation.created_at)}
                      </span>
                      {/* Botón de eliminar solo para chats eliminables (PENDIENTE y sin mensajes) */}
                      {isChatEliminable(conversation) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar que se ejecute la selección de chat
                            handleDeleteChat(conversation.id, conversation.tema);
                          }}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          title="Eliminar chat"
                        >
                          <Trash2 size={14} className="text-red-500 hover:text-red-700" />
                        </button>
                      )}
                    </div>
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
                  <h3 className="font-semibold">{selectedConversation.tema}</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {selectedConversation.emisor_nombre} → {selectedConversation.receptor_nombre}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {new Date(selectedConversation.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  selectedConversation.estado === 'EN CURSO' || selectedConversation.estado === 'CURSO' || selectedConversation.estado === 'EN_CURSO'
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
            <div className="flex-1 overflow-y-auto p-4 bg-no-repeat bg-center" style={{ backgroundImage: 'url(/chat-bg-dice-pattern.svg)', backgroundSize: '140px', backgroundRepeat: 'repeat' }}>
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
                      className={`flex ${message.emisor === 'emisor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.emisor === 'emisor' 
                          ? 'bg-[var(--accent-primary)] text-white' 
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      }`}>
                        <p className="text-sm">{message.mensaje}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.emisor === 'emisor' 
                            ? 'text-white text-opacity-70' 
                            : 'text-[var(--text-muted)]'
                        }`}>
                          <span className="text-xs">
                            {formatTime(message.created_at)}
                          </span>
                          {message.emisor === 'receptor' && (
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
                  {/* Emoji selector y input */}
                  <div className="flex items-center flex-1 relative">
                    {selectedEmoji && (
                      <span className="absolute left-2 text-lg">{selectedEmoji}</span>
                    )}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Mensaje"
                      className={`w-full bg-transparent focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] ${selectedEmoji ? 'pl-8' : ''}`}
                      disabled={showEmojiPicker}
                    />
                    
                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="emoji-picker-container absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-4 w-96 max-h-96 overflow-y-auto z-50 shadow-2xl">
                        <div className="grid grid-cols-10 gap-1">
                          {EMOJI_LIST.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="p-1.5 hover:bg-[var(--bg-primary)] rounded-lg text-lg transition-colors"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-primary)]">
                          <button
                            onClick={() => setSelectedEmoji('')}
                            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                          >
                            Limpiar
                          </button>
                          <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-sm text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] px-3 py-1 rounded-lg transition-colors"
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Emoji button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <Smile size={20} />
                  </button>

                  {/* Send button */}
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
                <option value="EN_CURSO">En Curso</option>
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
                onClick={() => {
                  // El filtro se aplica automáticamente al cerrar
                  setShowFilterModal(false);
                }}
                className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-md transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva conversación */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Nuevo Chat Interno
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Tema del Chat
              </label>
              <input
                type="text"
                value={newChatTema}
                onChange={(e) => setNewChatTema(e.target.value)}
                placeholder="Ej: MORA, Consulta sobre inversión..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Enviar a
              </label>
              <select
                value={newChatReceptor || ''}
                onChange={(e) => setNewChatReceptor(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              >
                <option value="">Seleccionar usuario...</option>
                {usuarios.filter(user => user.id !== currentUserId).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre_usuario} ({user.correo_electronico})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNewChat}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newChatTema.trim() || !newChatReceptor}
              >
                Crear Chat
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

      {/* Modal para confirmar eliminación de chat */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Eliminar Chat
              </h3>
              <button
                onClick={cancelDeleteChat}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-6">
              ¿Estás seguro de que quieres eliminar el chat "<strong>{chatToDelete?.tema}</strong>"?
              <br /><br />
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteChat}
                className="px-4 py-2 border border-[var(--border-primary)] text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteChat}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInternoPage;
