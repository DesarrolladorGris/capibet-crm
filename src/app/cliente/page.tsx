'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  isFromClient: boolean;
  status: 'sent' | 'delivered' | 'read';
  senderName: string;
}

export default function ClientChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [userName, setUserName] = useState('Cliente');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar nombre del usuario y mensaje de bienvenida
  useEffect(() => {
    const name = localStorage.getItem('userName') || 'Cliente';
    setUserName(name);

    const welcomeMessage: Message[] = [
      {
        id: 1,
        content: "¡Hola! Bienvenido a nuestro sistema de atención al cliente. ¿En qué podemos ayudarte hoy?",
        timestamp: new Date(),
        isFromClient: false,
        status: 'read',
        senderName: 'Soporte CapiBet CRM'
      }
    ];
    setMessages(welcomeMessage);
  }, []);

  // Enfocar el campo de texto cuando la página carga
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      content: newMessage.trim(),
      timestamp: new Date(),
      isFromClient: true,
      status: 'sent',
      senderName: userName
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular respuesta automática después de un momento
    setTimeout(() => {
      // Actualizar estado del mensaje a 'delivered'
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));

      // Simular que el agente está escribiendo
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoResponse: Message = {
          id: Date.now() + 1,
          content: "Gracias por tu mensaje. Un agente revisará tu consulta y te responderá pronto.",
          timestamp: new Date(),
          isFromClient: false,
          status: 'sent',
          senderName: 'Sistema Automático'
        };
        setMessages(prev => [...prev, autoResponse]);

        // Marcar mensaje original como leído
        setTimeout(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, status: 'read' } : msg
          ));
        }, 1000);
      }, 2000);
    }, 1000);
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
            <svg className="w-4 h-4 text-[#00b894]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            <svg className="w-4 h-4 text-[#00b894] -ml-1" fill="currentColor" viewBox="0 0 20 20">
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
                        ? 'bg-[#00b894] text-white' 
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
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] resize-none max-h-32 text-sm md:text-base"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-3 bottom-3 w-8 h-8 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {/* Help Text */}
          <p className="text-gray-500 text-xs mt-2 text-center hidden sm:block">
            Presiona Enter para enviar, Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
