'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/utils/auth';
import { mensajesServices } from '@/services/mensajesServices';
import { MensajeResponse } from '@/app/api/mensajes/domain/mensaje';
import { canalesServices, Canal } from '@/services/canalesServices';
import { espacioTrabajoServices } from '@/services/espacioTrabajoServices';
import { EspacioTrabajoResponse } from '@/app/api/espacio_trabajos/domain/espacio_trabajo';
import { contactoServices, ContactResponse } from '@/services/contactoServices';

// Tipos para los chats basados en datos reales
interface Chat {
  id: number;
  contacto: ContactResponse;
  ultimoMensaje: MensajeResponse;
  canal: Canal & { icono?: string };
  noLeidos: number;
  estado: 'activo' | 'archivado' | 'pausado';
}

// Interfaz extendida para mensajes con propiedades de UI
interface MensajeConUI extends MensajeResponse {
  leido?: boolean;
  estado?: 'enviado' | 'entregado' | 'leido';
}

// Mapeo de tipos de canal a iconos (igual que en DraggableMensaje)
const getChannelInfoByType = (tipo: string): { name: string; icon: string } => {
  const typeMap: { [key: string]: { name: string; icon: string } } = {
    'whatsapp': { name: 'WhatsApp', icon: '📱' },
    'whatsapp-api': { name: 'WhatsApp API', icon: '📱' },
    'instagram': { name: 'Instagram', icon: '📷' },
    'messenger': { name: 'Messenger', icon: '💬' },
    'telegram': { name: 'Telegram', icon: '✈️' },
    'telegram-bot': { name: 'Telegram Bot', icon: '🤖' },
    'web-chat': { name: 'Web Chat', icon: '💬' },
    'email': { name: 'Email', icon: '📧' },
    'sms': { name: 'SMS', icon: '📱' },
    'facebook': { name: 'Facebook', icon: '📘' },
    'twitter': { name: 'Twitter', icon: '🐦' },
    'linkedin': { name: 'LinkedIn', icon: '💼' }
  };
  
  const normalizedType = tipo.toLowerCase().trim();
  
  if (typeMap[normalizedType]) {
    return typeMap[normalizedType];
  }
  
  const capitalizedType = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  return { name: capitalizedType, icon: '📢' };
};

export default function ChatsPage() {
  // Estados para datos reales
  const [espaciosTrabajo, setEspaciosTrabajo] = useState<EspacioTrabajoResponse[]>([]);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [contactos, setContactos] = useState<ContactResponse[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<MensajeConUI[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Función para cargar todos los datos necesarios
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Cargando datos para chats...');
      
      // Cargar datos en paralelo
      const [espaciosResult, mensajesResult, canalesResult, contactosResult] = await Promise.all([
        espacioTrabajoServices.getAllEspaciosTrabajo(),
        mensajesServices.getAllMensajes(),
        canalesServices.getAllCanales(),
        contactoServices.getAllContactos()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        const espacios = espaciosResult.data;
        setEspaciosTrabajo(espacios);
        
        // Seleccionar el primer espacio por defecto
        if (espacios.length > 0 && !selectedEspacio) {
          setSelectedEspacio(espacios[0]);
        }
      }
      
      if (mensajesResult.success && mensajesResult.data) {
        setMensajes(mensajesResult.data);
      }
      
      if (canalesResult.success && canalesResult.data) {
        setCanales(canalesResult.data);
      }
      
      if (contactosResult.success && contactosResult.data) {
        setContactos(contactosResult.data);
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [selectedEspacio]);

  // Función para obtener el tipo de canal por ID
  const getCanalTipo = useCallback((canalId: number): string | undefined => {
    const canal = canales.find(c => c.id === canalId);
    return canal?.tipo;
  }, [canales]);

  // Función para crear chats basados en mensajes del espacio seleccionado
  const createChatsFromMessages = useCallback(() => {
    if (!selectedEspacio || !mensajes.length || !canales.length || !contactos.length) {
      setChats([]);
      return;
    }

    // Filtrar mensajes por canales del espacio seleccionado
    const canalesDelEspacio = canales.filter(canal => canal.espacio_id === selectedEspacio.id);
    const canalesIds = canalesDelEspacio.map(canal => canal.id);
    const mensajesDelEspacio = mensajes.filter(mensaje => canalesIds.includes(mensaje.canal_id));

    // Agrupar mensajes por contacto y canal
    const chatsMap = new Map<string, Chat>();

    mensajesDelEspacio.forEach(mensaje => {
      const contacto = contactos.find(c => c.id === mensaje.contacto_id);
      const canal = canales.find(c => c.id === mensaje.canal_id);

      if (contacto && canal) {
        const chatKey = `${contacto.id}-${canal.id}`;
        const channelInfo = getChannelInfoByType(canal.tipo);

        if (!chatsMap.has(chatKey)) {
          chatsMap.set(chatKey, {
            id: parseInt(chatKey.replace('-', '')),
            contacto,
            ultimoMensaje: mensaje,
            canal: {
              ...canal,
              icono: channelInfo.icon
            },
            noLeidos: 0, // TODO: Implementar lógica de no leídos
            estado: 'activo'
          });
        } else {
          const chat = chatsMap.get(chatKey)!;
          // Actualizar con el mensaje más reciente
          if (new Date(mensaje.creado_en) > new Date(chat.ultimoMensaje.creado_en)) {
            chat.ultimoMensaje = mensaje;
          }
        }
      }
    });

    // Convertir a array y ordenar por último mensaje
    const chatsArray = Array.from(chatsMap.values()).sort((a, b) => 
      new Date(b.ultimoMensaje.creado_en).getTime() - new Date(a.ultimoMensaje.creado_en).getTime()
    );

    setChats(chatsArray);
  }, [selectedEspacio, mensajes, canales, contactos]);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  useEffect(() => {
    createChatsFromMessages();
  }, [createChatsFromMessages]);

  // Filtrar chats por búsqueda
  const filteredChats = chats.filter(chat =>
    chat.contacto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.contacto.telefono.includes(searchQuery) ||
    chat.ultimoMensaje.contenido.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Seleccionar chat
  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    
    // Cargar mensajes del contacto y canal específico
    const chatMessages = mensajes.filter(mensaje => 
      mensaje.contacto_id === chat.contacto.id && 
      mensaje.canal_id === chat.canal.id
    ).sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
    
    setMessages(chatMessages);
    
    // Marcar como leído
    if (chat.noLeidos > 0) {
      setChats(chats.map(c => 
        c.id === chat.id ? { ...c, noLeidos: 0 } : c
      ));
    }
  };

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: MensajeConUI = {
      id: Date.now(),
      canal_id: selectedChat.canal.id || 0,
      remitente_id: 1, // TODO: Obtener ID del usuario actual
      contenido: newMessage.trim(),
      contacto_id: selectedChat.contacto.id || 0,
      sesion_id: 1, // TODO: Obtener sesión actual
      destinatario_id: selectedChat.contacto.id || 0,
      embudo_id: 1, // TODO: Obtener embudo si aplica
      creado_en: new Date().toISOString(),
      leido: false,
      estado: 'enviado'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Actualizar último mensaje del chat
    setChats(chats.map(c => 
      c.id === selectedChat.id 
        ? { 
            ...c, 
            ultimoMensaje: message
          } 
        : c
    ));
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
      } else {
        return date.toLocaleDateString('es-ES');
      }
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header de Chats */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[var(--text-primary)] font-semibold text-2xl">Chats</h1>
          </div>

          {/* Center Section - Selector de Espacio */}
          <div className="flex items-center space-x-4">
            {espaciosTrabajo.length > 0 && (
              <div className="relative">
                <select
                  value={selectedEspacio?.id || ''}
                  onChange={(e) => {
                    const espacioId = parseInt(e.target.value);
                    const espacio = espaciosTrabajo.find(e => e.id === espacioId);
                    setSelectedEspacio(espacio || null);
                  }}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-4 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="">Seleccionar espacio...</option>
                  {espaciosTrabajo.map(espacio => (
                    <option key={espacio.id} value={espacio.id}>
                      {espacio.nombre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
            {selectedEspacio && (
              <div className="text-[var(--text-muted)] text-sm">
                {chats.length} conversación{chats.length !== 1 ? 'es' : ''}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex">
        {/* Lista de chats */}
        <div className="w-1/3 bg-[var(--bg-primary)] border-r border-[var(--border-primary)] flex flex-col">
          {/* Loading state */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[var(--text-muted)] text-4xl mb-4">⏳</div>
                <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">Cargando chats...</h3>
                <p className="text-[var(--text-muted)] text-sm">Obteniendo conversaciones del espacio de trabajo</p>
              </div>
            </div>
          )}
          
          {/* No workspace selected */}
          {!isLoading && !selectedEspacio && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[var(--text-muted)] text-4xl mb-4">🏢</div>
                <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">Selecciona un espacio</h3>
                <p className="text-[var(--text-muted)] text-sm">Elige un espacio de trabajo para ver sus conversaciones</p>
              </div>
            </div>
          )}
          
          {/* Show chats when workspace is selected and not loading */}
          {!isLoading && selectedEspacio && (
            <>
          {/* Buscador */}
          <div className="p-4 border-b border-[var(--border-primary)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 pl-9 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
              />
              <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Lista de chats */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`p-4 border-b border-[var(--border-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-[var(--bg-secondary)] border-l-4 border-l-[var(--accent-primary)]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#F29A1F] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>

                  {/* Información del chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-[var(--text-primary)] font-medium truncate">{chat.contacto.nombre}</h3>
                        <span className="text-xs">{chat.canal.icono}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[var(--text-muted)] text-xs">{formatTime(chat.ultimoMensaje.creado_en)}</span>
                        {chat.noLeidos > 0 && (
                          <span className="bg-[var(--accent-primary)] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {chat.noLeidos}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[var(--text-muted)] text-sm truncate flex-1">
                        {chat.ultimoMensaje.contenido}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-[var(--text-muted)] text-4xl mb-4">💬</div>
                <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">No hay chats</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  {searchQuery ? 'No se encontraron chats con ese término' : 'Aún no tienes conversaciones'}
                </p>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Área de conversación */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#F29A1F] rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium">{selectedChat.contacto.nombre}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">{selectedChat.canal.icono}</span>
                        <span className="text-[var(--text-muted)] text-sm">{getChannelInfoByType(selectedChat.canal.tipo).name}</span>
                        <span className="text-[var(--text-muted)]">•</span>
                        <span className="text-[var(--text-muted)] text-sm">{selectedChat.contacto.telefono}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.remitente_id === 1 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.remitente_id === 1
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
                      }`}
                    >
                      <p className="text-sm">{message.contenido}</p>
                      <div className={`text-xs mt-1 ${
                        message.remitente_id === 1 ? 'text-green-100' : 'text-[var(--text-muted)]'
                      }`}>
                        {formatTime(message.creado_en)}
                        {message.remitente_id === 1 && (
                          <span className="ml-1">
                            {message.estado === 'enviado' && '✓'}
                            {message.estado === 'entregado' && '✓✓'}
                            {message.leido && <span className="text-blue-300">✓✓</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de mensaje */}
              <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] p-4">
                <div className="flex items-center space-x-3">
                  <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Estado sin chat seleccionado */
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)]">
              <div className="text-center">
                <div className="text-[var(--text-muted)] text-6xl mb-4">💬</div>
                <h3 className="text-[var(--text-primary)] text-xl font-medium mb-2">Selecciona una conversación</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  Elige un chat de la lista para comenzar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
