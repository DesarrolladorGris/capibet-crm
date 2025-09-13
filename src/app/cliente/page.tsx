'use client';

import { useState, useEffect, useRef } from 'react';
import { supabaseService } from '@/services/supabaseService';

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  isFromClient: boolean;
  status: 'sent' | 'delivered' | 'read';
  senderName: string;
}

interface MensajeInterno {
  id: number;
  created_at: string;
  chat_interno_id: number;
  mensaje: string;
  leido: boolean;
  emisor: 'cliente' | 'operador';
}

export default function ClientChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [userName, setUserName] = useState('Cliente');
  const [userId, setUserId] = useState<number | null>(null);
  const [hasCreatedConversation, setHasCreatedConversation] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar datos del usuario y mensaje de bienvenida
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Cliente';
    const userIdStr = localStorage.getItem('userId');
    
    setUserName(name);
    
    if (userIdStr) {
      const parsedUserId = parseInt(userIdStr);
      setUserId(parsedUserId);
      
      // Verificar si ya existe una conversación para este usuario
      checkExistingConversation(parsedUserId);
    }

    // Los mensajes se cargarán desde checkExistingConversation
  }, []);

  // Función para verificar si ya existe una conversación y cargar mensajes
  const checkExistingConversation = async (clienteId: number) => {
    try {
      console.log('🚀 Verificando conversación existente para cliente:', clienteId);
      const result = await supabaseService.checkClientChatInternoConversation(clienteId);
      
      if (result.success && result.data) {
        console.log('✅ Conversación encontrada:', result.data);
        
        // Verificar si la conversación está finalizada
        if (result.data.estado === 'FINALIZADO') {
          console.log('🔒 Conversación finalizada, permitiendo crear nueva conversación');
          setHasCreatedConversation(false);
          setConversationData(null);
          setWelcomeMessageWithClosedInfo();
        } else {
          setHasCreatedConversation(true);
          setConversationData(result.data);
          // Cargar mensajes existentes
          await loadExistingMessages(result.data.id);
        }
      } else {
        console.log('ℹ️ No se encontró conversación existente');
        // Mostrar solo el mensaje de bienvenida si no hay conversación
        setWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error al verificar conversación existente:', error);
      setWelcomeMessage();
    }
  };

  // Función para cargar mensajes existentes
  const loadExistingMessages = async (chatInternoId: number) => {
    try {
      console.log('🚀 Cargando mensajes existentes para conversación:', chatInternoId);
      const result = await supabaseService.getClientMensajesInternos(chatInternoId);
      
      if (result.success && result.data.length > 0) {
        // Convertir mensajes del servidor al formato de la UI
        const convertedMessages: Message[] = result.data.map((msg: MensajeInterno) => ({
          id: msg.id,
          content: msg.mensaje,
          timestamp: new Date(msg.created_at),
          isFromClient: msg.emisor === 'cliente',
          status: msg.leido ? 'read' : 'delivered',
          senderName: msg.emisor === 'cliente' ? userName : 'Soporte CAPIBET CRM'
        }));
        
        // Agregar mensaje de bienvenida al inicio si no existe
        const hasWelcomeMessage = convertedMessages.some(msg => 
          msg.content.includes('Bienvenido a nuestro sistema de atención al cliente')
        );
        
        if (!hasWelcomeMessage) {
          const welcomeMessage: Message = {
            id: 0,
            content: "¡Hola! Bienvenido a nuestro sistema de atención al cliente. ¿En qué podemos ayudarte hoy?",
            timestamp: new Date(convertedMessages[0]?.timestamp.getTime() - 1000 || Date.now()),
            isFromClient: false,
            status: 'read',
            senderName: 'Soporte CAPIBET CRM'
          };
          convertedMessages.unshift(welcomeMessage);
        }
        
        setMessages(convertedMessages);
        console.log('✅ Mensajes cargados:', convertedMessages.length);
        
        // Marcar mensajes del operador como leídos
        await markOperatorMessagesAsRead(chatInternoId);
      } else {
        console.log('ℹ️ No se encontraron mensajes, mostrando mensaje de bienvenida');
        setWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error al cargar mensajes existentes:', error);
      setWelcomeMessage();
    }
  };

  // Función para establecer el mensaje de bienvenida
  const setWelcomeMessage = () => {
    const welcomeMessage: Message[] = [
      {
        id: 0,
        content: "¡Hola! Bienvenido a nuestro sistema de atención al cliente. ¿En qué podemos ayudarte hoy?",
        timestamp: new Date(),
        isFromClient: false,
        status: 'read',
        senderName: 'Soporte CAPIBET CRM'
      }
    ];
    setMessages(welcomeMessage);
  };

  // Función para establecer el mensaje de bienvenida cuando la conversación anterior fue cerrada
  const setWelcomeMessageWithClosedInfo = () => {
    const welcomeMessage: Message[] = [
      {
        id: 0,
        content: "Tu conversación anterior fue finalizada. ¡Hola! Bienvenido nuevamente a nuestro sistema de atención al cliente. ¿En qué podemos ayudarte hoy?",
        timestamp: new Date(),
        isFromClient: false,
        status: 'read',
        senderName: 'Soporte CAPIBET CRM'
      }
    ];
    setMessages(welcomeMessage);
  };

  // Función para marcar mensajes del operador como leídos
  const markOperatorMessagesAsRead = async (chatInternoId: number) => {
    try {
      console.log('📖 Marcando mensajes del operador como leídos...');
      const result = await supabaseService.markOperatorMessagesAsRead(chatInternoId);
      
      if (result.success) {
        console.log('✅ Mensajes del operador marcados como leídos exitosamente');
      } else {
        console.error('❌ Error al marcar mensajes del operador como leídos:', result.error);
      }
    } catch (error) {
      console.error('❌ Error al marcar mensajes del operador como leídos:', error);
    }
  };

  // Función para verificar nuevas respuestas del operador
  const checkForNewMessages = async () => {
    if (conversationData && conversationData.id) {
      try {
        console.log('🔄 Verificando nuevos mensajes...');
        
        // Primero verificar si la conversación sigue activa
        if (userId) {
          const result = await supabaseService.checkClientChatInternoConversation(userId);
          if (result.success && result.data && result.data.estado === 'FINALIZADO') {
            console.log('🔒 Conversación fue finalizada por el operador');
            setHasCreatedConversation(false);
            setConversationData(null);
            
            // Mostrar mensaje informativo
            const finalizationMessage: Message = {
              id: Date.now(),
              content: "El operador ha finalizado esta conversación. Si necesitas más ayuda, puedes escribir un nuevo mensaje para iniciar una nueva conversación.",
              timestamp: new Date(),
              isFromClient: false,
              status: 'read',
              senderName: 'Sistema CAPIBET CRM'
            };
            setMessages(prev => [...prev, finalizationMessage]);
            return;
          }
        }
        
        // Si la conversación sigue activa, cargar nuevos mensajes
        await loadExistingMessages(conversationData.id);
      } catch (error) {
        console.error('❌ Error al verificar nuevos mensajes:', error);
      }
    }
  };

  // Enfocar el campo de texto cuando la página carga
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Verificar nuevos mensajes periódicamente
  useEffect(() => {
    if (conversationData && conversationData.id) {
      const interval = setInterval(() => {
        checkForNewMessages();
      }, 10000); // Verificar cada 10 segundos

      return () => clearInterval(interval);
    }
  }, [conversationData]);

  // Marcar mensajes como leídos cuando la página está en foco
  useEffect(() => {
    const handleFocus = async () => {
      if (conversationData && conversationData.id) {
        console.log('👀 Página en foco, marcando mensajes del operador como leídos...');
        await markOperatorMessagesAsRead(conversationData.id);
      }
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden && conversationData && conversationData.id) {
        console.log('👀 Página visible, marcando mensajes del operador como leídos...');
        await markOperatorMessagesAsRead(conversationData.id);
      }
    };

    // Marcar como leído cuando la página obtiene foco
    window.addEventListener('focus', handleFocus);
    
    // Marcar como leído cuando la página se vuelve visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationData]);

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (isCreatingConversation) return; // Evitar envíos múltiples mientras se crea la conversación

    const messageContent = newMessage.trim();
    const message: Message = {
      id: Date.now(),
      content: messageContent,
      timestamp: new Date(),
      isFromClient: true,
      status: 'sent',
      senderName: userName
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    let currentConversationData = conversationData;

    // Si no hay conversación activa (primera vez o conversación anterior finalizada)
    if (!hasCreatedConversation && userId) {
      setIsCreatingConversation(true);
      
      try {
        console.log('🚀 Paso 1: Creando nueva conversación de chat interno para cliente:', userId);
        const createResult = await supabaseService.createChatInternoConversation(userId);
        
        if (createResult.success) {
          console.log('✅ Paso 1 completado: Nueva conversación creada exitosamente');
          
          // Paso 2: Obtener la conversación recién creada para obtener su ID
          // Esperamos un momento para asegurar que la conversación esté disponible en la base de datos
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('🚀 Paso 2: Obteniendo nueva conversación para obtener el ID...');
          const getResult = await supabaseService.getChatInternoConversation(userId);
          
          if (getResult.success && getResult.data) {
            currentConversationData = getResult.data;
            setConversationData(currentConversationData);
            setHasCreatedConversation(true);
            console.log('✅ Paso 2 completado: Nueva conversación obtenida:', currentConversationData);
          } else {
            console.error('❌ Error en Paso 2: No se pudo obtener la nueva conversación:', getResult.error);
            console.log('🔄 Intentando obtener conversación sin filtro de estado...');
            
            // Fallback: intentar obtener cualquier conversación del cliente
            const fallbackResult = await supabaseService.checkClientChatInternoConversation(userId);
            if (fallbackResult.success && fallbackResult.data) {
              currentConversationData = fallbackResult.data;
              setConversationData(currentConversationData);
              setHasCreatedConversation(true);
              console.log('✅ Fallback exitoso: Conversación obtenida:', currentConversationData);
            }
          }
        } else {
          console.error('❌ Error en Paso 1: No se pudo crear la nueva conversación:', createResult.error);
        }
      } catch (error) {
        console.error('❌ Error general en creación de nueva conversación:', error);
      } finally {
        setIsCreatingConversation(false);
      }
    }

        // Paso 3: Crear el mensaje interno si tenemos los datos de la conversación
        if (currentConversationData && currentConversationData.id) {
          try {
            console.log('🚀 Paso 3: Creando mensaje interno en conversación:', currentConversationData.id);
            const messageResult = await supabaseService.createMensajeInterno(
              currentConversationData.id, 
              messageContent, 
              'cliente'
            );
            
            if (messageResult.success) {
              console.log('✅ Paso 3 completado: Mensaje interno creado exitosamente:', messageResult.data);
              
              // Recargar mensajes desde el servidor para mostrar el mensaje recién enviado
              await loadExistingMessages(currentConversationData.id);
            } else {
              console.error('❌ Error en Paso 3: No se pudo crear el mensaje interno:', messageResult.error);
            }
          } catch (error) {
            console.error('❌ Error general en creación de mensaje interno:', error);
          }
        } else {
          console.log('⚠️ No se pudo crear mensaje interno: faltan datos de conversación');
        }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        );
      case 'delivered':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <svg className="w-4 h-4 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <svg className="w-4 h-4 text-[#F29A1F]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <svg className="w-4 h-4 text-[#F29A1F] -ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#1a1d23] px-4 md:px-6 py-4 min-h-0 pb-safe">
        <div className="max-w-4xl mx-auto space-y-4 pb-4 md:pb-0">
          {messages.map((message, index) => {
            const showDateDivider = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <div key={message.id}>
                {/* Date Divider */}
                {showDateDivider && (
                  <div className="flex items-center justify-center my-6">
                    <div className="bg-[#2a2d35] text-gray-400 text-xs px-3 py-1 rounded-full border border-[#3a3d45]">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={`flex ${message.isFromClient ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[280px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.isFromClient ? 'order-2' : 'order-1'}`}>
                    {!message.isFromClient && (
                      <p className="text-gray-400 text-xs mb-1 ml-2">{message.senderName}</p>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.isFromClient 
                        ? 'bg-[#F29A1F] text-white' 
                        : 'bg-[#2a2d35] text-white border border-[#3a3d45]'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-2 ${
                        message.isFromClient ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.isFromClient && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[280px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                <p className="text-gray-400 text-xs mb-1 ml-2">Soporte está escribiendo...</p>
                <div className="bg-[#2a2d35] border border-[#3a3d45] rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[#2a2d35] border-t border-[#3a3d45] px-4 md:px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F29A1F] focus:border-[#F29A1F] resize-none max-h-32 text-sm md:text-base"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isCreatingConversation}
              className="absolute right-3 bottom-3 w-8 h-8 bg-[#F29A1F] hover:bg-[#F29A1F] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Help Text */}
          {isCreatingConversation ? (
            <p className="text-[#F29A1F] text-xs mt-2 text-center animate-pulse">
              📞 Conectando con soporte...
            </p>
          ) : (
            <p className="text-gray-500 text-xs mt-2 text-center hidden sm:block">
              Presiona Enter para enviar, Shift + Enter para nueva línea
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
