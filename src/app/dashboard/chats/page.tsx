'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Smartphone, Camera, MessageCircle, Send, Bot, Mail, Facebook, Twitter, Briefcase, Megaphone, Building2, Check } from 'lucide-react';
import { isUserAuthenticated } from '@/utils/auth';
import { mensajesServices } from '@/services/mensajesServices';
import { MensajeResponse } from '@/app/api/mensajes/domain/mensaje';
import { chatServices } from '@/services/chatServices';
import { ChatResponse } from '@/app/api/chats/domain/chat';
// Tipos para WhatsApp API (por ahora solo este tipo)
import { espacioTrabajoServices } from '@/services/espacioTrabajoServices';
import { EspacioTrabajoResponse } from '@/app/api/espacio_trabajos/domain/espacio_trabajo';
import { contactoServices, ContactResponse } from '@/services/contactoServices';
import { embudoServices } from '@/services/embudoServices';
import { EmbudoResponse } from '@/app/api/embudos/domain/embudo';
import { sesionesServices } from '@/services/sesionesServices';
import { SesionResponse } from '@/app/api/sesiones/domain/sesion';
import EmbudosFilter from './components/EmbudosFilter';
import ContextMenu from './components/ContextMenu';

// Tipos para los chats basados en datos reales de la API
interface Chat {
  id: number;
  contacto: ContactResponse;
  ultimoMensaje?: MensajeResponse;
  sesion: SesionResponse;
  chat_data: ChatResponse;
  noLeidos: number;
  estado: 'activo' | 'archivado' | 'pausado';
}

// Interfaz extendida para mensajes con propiedades de UI
interface MensajeConUI extends MensajeResponse {
  leido?: boolean;
  estado?: 'enviado' | 'entregado' | 'leido';
}

// Mapeo de tipos de canal a iconos (igual que en DraggableMensaje)
const getChannelInfoByType = (tipo: string): { name: string; icon: React.ReactNode } => {
  const typeMap: { [key: string]: { name: string; icon: React.ReactNode } } = {
    'whatsapp-api': { name: 'WhatsApp', icon: <Image src="/wpp_logo.svg" alt="WhatsApp API" width={16} height={16} className="filter brightness-0 invert" /> },
    'whatsapp_qr': { name: 'WhatsApp', icon: <Image src="/wpp_logo.svg" alt="WhatsApp QR" width={16} height={16} className="filter brightness-0 invert" /> },
    'instagram': { name: 'Instagram', icon: <Camera className="w-4 h-4" /> },
    'messenger': { name: 'Messenger', icon: <MessageCircle className="w-4 h-4" /> },
    'telegram': { name: 'Telegram', icon: <Send className="w-4 h-4" /> },
    'telegram-bot': { name: 'Telegram Bot', icon: <Bot className="w-4 h-4" /> },
    'web-chat': { name: 'Web Chat', icon: <MessageCircle className="w-4 h-4" /> },
    'email': { name: 'Email', icon: <Mail className="w-4 h-4" /> },
    'sms': { name: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
    'facebook': { name: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    'twitter': { name: 'Twitter', icon: <Twitter className="w-4 h-4" /> },
    'linkedin': { name: 'LinkedIn', icon: <Briefcase className="w-4 h-4" /> }
  };
  
  const normalizedType = tipo.toLowerCase().trim();
  
  if (typeMap[normalizedType]) {
    return typeMap[normalizedType];
  }
  
  const capitalizedType = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  return { name: capitalizedType, icon: <Megaphone className="w-4 h-4" /> };
};

export default function ChatsPage() {
  // Estados para datos reales
  const [espaciosTrabajo, setEspaciosTrabajo] = useState<EspacioTrabajoResponse[]>([]);
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioTrabajoResponse | null>(null);
  const [mensajes, setMensajes] = useState<MensajeResponse[]>([]);
  const [contactos, setContactos] = useState<ContactResponse[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<MensajeConUI[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para embudos y sesiones
  const [embudos, setEmbudos] = useState<EmbudoResponse[]>([]);
  const [sesiones, setSesiones] = useState<SesionResponse[]>([]);
  const [selectedEmbudo, setSelectedEmbudo] = useState<EmbudoResponse | null>(null);
  const [sesionesDelEmbudo, setSesionesDelEmbudo] = useState<number[]>([]);
  
  // Estados para el menú contextual
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    chatId: number | null;
    chatName: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    chatId: null,
    chatName: ''
  });
  
  const router = useRouter();

  // Función para cargar datos cuando se selecciona un espacio
  const loadDataForEspacio = useCallback(async (espacioId: number) => {
    try {
      console.log('⚡ Cargando embudos y sesiones para espacio:', espacioId);
      
      // Cargar embudos y sesiones del espacio en paralelo
      const [embudosResult, sesionesResult] = await Promise.all([
        embudoServices.getEmbudosByEspacio(espacioId),
        sesionesServices.getAllSesiones()
      ]);
      
      console.log('📊 Resultado embudos:', embudosResult);
      console.log('📊 Resultado sesiones:', sesionesResult);
      
      if (embudosResult.success && embudosResult.data) {
        console.log('✅ Embudos cargados:', embudosResult.data.length);
        setEmbudos(embudosResult.data);
      } else {
        console.log('❌ Error cargando embudos');
        setEmbudos([]);
      }
      
      if (sesionesResult.success && sesionesResult.data) {
        console.log('✅ Sesiones totales:', sesionesResult.data.length);
        
        // Filtrar sesiones que pertenecen a embudos de este espacio
        const embudosIds = embudosResult.data?.map(e => e.id) || [];
        console.log('📊 IDs de embudos del espacio:', embudosIds);
        
        const sesionesDelEspacio = sesionesResult.data.filter(sesion => 
          embudosIds.includes(sesion.embudo_id)
        );
        console.log('✅ Sesiones del espacio filtradas:', sesionesDelEspacio.length);
        console.log('📊 Tipos de sesiones:', [...new Set(sesionesDelEspacio.map(s => s.type))]);
        
        setSesiones(sesionesDelEspacio);
        setSesionesDelEmbudo(sesionesDelEspacio.map(s => s.id));
      } else {
        console.log('❌ Error cargando sesiones');
        setSesiones([]);
        setSesionesDelEmbudo([]);
      }
      
      // Resetear embudo seleccionado cuando cambia el espacio
      setSelectedEmbudo(null);
      
    } catch (error) {
      console.error('Error cargando datos del espacio:', error);
      setEmbudos([]);
      setSesiones([]);
      setSesionesDelEmbudo([]);
    }
  }, []);

  // Función para cargar todos los datos necesarios
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('⚡ Cargando datos para chats...');
      
      // Cargar datos en paralelo
      const [espaciosResult, contactosResult] = await Promise.all([
        espacioTrabajoServices.getAllEspaciosTrabajo(),
        contactoServices.getAllContactos()
      ]);
      
      if (espaciosResult.success && espaciosResult.data) {
        setEspaciosTrabajo(espaciosResult.data);
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
  }, []);

  // Función para obtener el icono del tipo de sesión
  const getSessionIcon = (type: string) => {
    return getChannelInfoByType(type === 'whatsapp_api' ? 'whatsapp-api' : type);
  };

  // Función helper para extraer el contenido del mensaje
  const getMessageContent = (message: MensajeResponse): string => {
    if (typeof message.content === 'object' && message.content) {
      // Para mensajes de WhatsApp API y WhatsApp QR
      if ('message_content' in message.content && typeof message.content.message_content === 'string') {
        return message.content.message_content;
      }
      
      // Para mensajes de WhatsApp QR, también verificar en raw_message
      if (message.type === 'whatsapp_qr' && 
          'raw_message' in message.content &&
          typeof message.content.raw_message === 'object' &&
          message.content.raw_message &&
          'message' in message.content.raw_message &&
          typeof message.content.raw_message.message === 'object' &&
          message.content.raw_message.message &&
          'conversation' in message.content.raw_message.message &&
          typeof message.content.raw_message.message.conversation === 'string') {
        return message.content.raw_message.message.conversation;
      }
    }
    return 'Mensaje multimedia o no disponible';
  };

  // Función para determinar si un mensaje de WhatsApp QR fue enviado por nosotros
  const isMessageFromMe = (message: MensajeResponse): boolean => {
    // Solo procesar mensajes de WhatsApp QR
    if (message.type !== 'whatsapp_qr') {
      // Para otros tipos, usar la lógica existente basada en remitente_id
      return message.remitente_id !== null;
    }

    // Para WhatsApp QR, usar content.raw_message.key.fromMe
    if (typeof message.content === 'object' && 
        message.content &&
        'raw_message' in message.content &&
        typeof message.content.raw_message === 'object' &&
        message.content.raw_message &&
        'key' in message.content.raw_message &&
        typeof message.content.raw_message.key === 'object' &&
        message.content.raw_message.key &&
        'fromMe' in message.content.raw_message.key) {
      return Boolean(message.content.raw_message.key.fromMe);
    }

    // Fallback a la lógica existente si no se encuentra la estructura esperada
    return message.remitente_id !== null;
  };

  // Función para manejar selección de embudo
  const handleEmbudoSelect = useCallback((embudo: EmbudoResponse | null) => {
    setSelectedEmbudo(embudo);
    
    if (embudo === null) {
      // Mostrar todos los chats de todas las sesiones del espacio
      setSesionesDelEmbudo(sesiones.map(s => s.id));
    } else {
      // Filtrar sesiones por embudo seleccionado
      const sesionesDelEmbudoSeleccionado = sesiones
        .filter(sesion => sesion.embudo_id === embudo.id)
        .map(s => s.id);
      setSesionesDelEmbudo(sesionesDelEmbudoSeleccionado);
    }
  }, [sesiones]);

  // Función para cargar chats reales de la API por sesiones
  const loadChatsFromSesiones = useCallback(async () => {
    console.log('🔍 DEBUG - loadChatsFromSesiones called');
    console.log('🔍 sesionesDelEmbudo:', sesionesDelEmbudo);
    console.log('🔍 contactos.length:', contactos.length);
    console.log('🔍 sesiones.length:', sesiones.length);

    if (sesionesDelEmbudo.length === 0 || !contactos.length) {
      console.log('❌ No hay sesiones del embudo o contactos, limpiando chats');
      setChats([]);
      return;
    }

    setIsLoadingChats(true);
    try {
      console.log('⚡ Cargando chats para sesiones:', sesionesDelEmbudo);
      
      // Obtener chats y mensajes en paralelo para optimizar
      const [chatsResult, mensajesResult] = await Promise.all([
        chatServices.getAllChats(),
        mensajesServices.getAllMensajes()
      ]);
      
      console.log('🔍 chatsResult:', chatsResult);
      console.log('🔍 mensajesResult success:', mensajesResult.success);
      
      if (chatsResult.success && chatsResult.data) {
        console.log('📊 Total chats obtenidos de la API:', chatsResult.data.length);
        
        // Filtrar chats que pertenecen a las sesiones del embudo seleccionado
        const chatsDelEmbudo = chatsResult.data.filter(chat => 
          sesionesDelEmbudo.includes(chat.sesion_id)
        );
        
        console.log('📊 Chats del embudo después del filtrado:', chatsDelEmbudo.length);
        console.log('📊 Chats del embudo:', chatsDelEmbudo);

        // Crear un mapa de mensajes por chat_id para optimizar búsqueda
        const mensajesPorChat = new Map<number, MensajeResponse>();
        
        if (mensajesResult.success && mensajesResult.data) {
          console.log('📊 Total mensajes obtenidos:', mensajesResult.data.length);
          
          // TEMPORAL: Procesar todos los tipos de mensajes para debugging
          const todosMensajes = mensajesResult.data;
          console.log('📊 Tipos de mensajes encontrados:', [...new Set(todosMensajes.map(m => m.type))]);
          
          // Agrupar por chat_id y obtener el más reciente
          todosMensajes.forEach(mensaje => {
            const mensajeExistente = mensajesPorChat.get(mensaje.chat_id);
            if (!mensajeExistente || new Date(mensaje.creado_en) > new Date(mensajeExistente.creado_en)) {
              mensajesPorChat.set(mensaje.chat_id, mensaje);
            }
          });
          
          console.log('📊 Mensajes por chat mapeados:', mensajesPorChat.size);
        }

        // Crear objetos Chat completos
        const chatsCompletos: Chat[] = [];

        for (const chatData of chatsDelEmbudo) {
          const contacto = contactos.find(c => c.id === chatData.contact_id);
          const sesion = sesiones.find(s => s.id === chatData.sesion_id);

          console.log('🔍 Procesando chat:', chatData.id);
          console.log('🔍 Contacto encontrado:', !!contacto, contacto?.nombre);
          console.log('🔍 Sesión encontrada:', !!sesion, sesion?.type);

          if (contacto && sesion) {
            console.log('🔍 Tipo de sesión:', sesion.type);
            
            // TEMPORAL: Mostrar todos los tipos para debugging
            const ultimoMensaje = mensajesPorChat.get(chatData.id);
            console.log('🔍 Último mensaje encontrado:', !!ultimoMensaje);

            chatsCompletos.push({
              id: chatData.id,
              contacto,
              ultimoMensaje,
              sesion,
              chat_data: chatData,
              noLeidos: 0, // TODO: Implementar lógica de no leídos
              estado: 'activo'
            });
            
            if (sesion.type !== 'whatsapp_api') {
              console.log('⚠️ Sesión no es whatsapp_api pero incluida para debugging:', sesion.type);
            }
          } else {
            console.log('❌ Faltan datos - contacto:', !!contacto, 'sesión:', !!sesion);
          }
        }

        // Ordenar por último mensaje o fecha de creación
        chatsCompletos.sort((a, b) => {
          const dateA = a.ultimoMensaje ? new Date(a.ultimoMensaje.creado_en) : new Date(a.chat_data.created_at || 0);
          const dateB = b.ultimoMensaje ? new Date(b.ultimoMensaje.creado_en) : new Date(b.chat_data.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        console.log('✅ Chats completos finales:', chatsCompletos.length);
        console.log('✅ Chats finales:', chatsCompletos);
        setChats(chatsCompletos);
      } else {
        console.log('❌ Error en chatsResult:', chatsResult);
        setChats([]);
      }
    } catch (error) {
      console.error('❌ Error cargando chats:', error);
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  }, [sesionesDelEmbudo, contactos, sesiones]);

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  // Efecto separado para seleccionar el primer espacio cuando se cargan los datos
  useEffect(() => {
    if (espaciosTrabajo.length > 0 && !selectedEspacio) {
      setSelectedEspacio(espaciosTrabajo[0]);
    }
  }, [espaciosTrabajo, selectedEspacio]);

  // Efecto para cargar datos del espacio cuando cambia
  useEffect(() => {
    if (selectedEspacio) {
      loadDataForEspacio(selectedEspacio.id);
    }
  }, [selectedEspacio, loadDataForEspacio]);

  // Efecto para seleccionar "Todos" automáticamente cuando se cargan embudos
  useEffect(() => {
    console.log('🔍 DEBUG - Auto-selección de "Todos"');
    console.log('🔍 embudos.length:', embudos.length);
    console.log('🔍 sesiones.length:', sesiones.length);
    console.log('🔍 selectedEmbudo:', selectedEmbudo);
    
    if (embudos.length > 0 && sesiones.length > 0 && selectedEmbudo === null) {
      console.log('✅ Auto-seleccionando "Todos"');
      const allSesionIds = sesiones.map(s => s.id);
      console.log('🔍 IDs de sesiones para "Todos":', allSesionIds);
      setSesionesDelEmbudo(allSesionIds);
    }
  }, [embudos, sesiones, selectedEmbudo]);

  // Efecto para cargar chats cuando cambian las sesiones del embudo
  useEffect(() => {
    loadChatsFromSesiones();
  }, [loadChatsFromSesiones]);

  // Filtrar chats por búsqueda
  const filteredChats = chats.filter(chat =>
    chat.contacto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.contacto.telefono.includes(searchQuery) ||
    (chat.ultimoMensaje && getMessageContent(chat.ultimoMensaje).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Log para debugging
  console.log('🔍 DEBUG - Render:');
  console.log('🔍 chats.length:', chats.length);
  console.log('🔍 filteredChats.length:', filteredChats.length);
  console.log('🔍 isLoading:', isLoading);
  console.log('🔍 isLoadingChats:', isLoadingChats);
  console.log('🔍 selectedEspacio:', selectedEspacio?.nombre);

  // Seleccionar chat y cargar mensajes por chat_id
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    try {
      // Cargar mensajes del chat específico
      const mensajesResult = await mensajesServices.getAllMensajes();
      
      if (mensajesResult.success && mensajesResult.data) {
        // Filtrar mensajes del chat según el tipo de sesión
        let chatMessages = mensajesResult.data
          .filter(mensaje => mensaje.chat_id === chat.id);

        // Para WhatsApp QR, incluir todos los mensajes del chat
        // Para WhatsApp API, solo filtrar por 'whatsapp_api'
        if (chat.sesion.type === 'whatsapp_qr') {
          // Incluir mensajes de tipo whatsapp_qr
          chatMessages = chatMessages.filter(mensaje => 
            mensaje.type === 'whatsapp_qr' || mensaje.type === 'whatsapp_api'
          );
        } else {
          // Para otros tipos de sesión, mantener el filtro original
          chatMessages = chatMessages.filter(mensaje => mensaje.type === 'whatsapp_api');
        }

        // Ordenar por fecha de creación
        chatMessages.sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
        
        setMessages(chatMessages);
        
        console.log(`🔍 Mensajes cargados para chat ${chat.id} (${chat.sesion.type}):`, chatMessages.length);
        if (chat.sesion.type === 'whatsapp_qr') {
          console.log('📱 Procesando mensajes de WhatsApp QR con lógica fromMe');
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error cargando mensajes del chat:', error);
      setMessages([]);
    }
    
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
      remitente_id: 1, // TODO: Obtener ID del usuario actual
      contacto_id: selectedChat.contacto.id,
      chat_id: selectedChat.id,
      type: 'whatsapp_api',
      content: {
        message_content: newMessage.trim(),
        message_type: 'text'
      },
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

  // Función para manejar click derecho en un chat
  const handleContextMenu = (event: React.MouseEvent, chat: Chat) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      chatId: chat.id,
      chatName: chat.contacto.nombre
    });
  };

  // Función para cerrar el menú contextual
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // Función para eliminar un chat
  const handleDeleteChat = async () => {
    if (!contextMenu.chatId) return;

    try {
      const result = await chatServices.deleteChatById(contextMenu.chatId);
      
      if (result.success) {
        // Remover el chat de la lista local
        setChats(prevChats => prevChats.filter(chat => chat.id !== contextMenu.chatId));
        
        // Si el chat eliminado estaba seleccionado, limpiar la selección
        if (selectedChat?.id === contextMenu.chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        
        console.log('✅ Chat eliminado exitosamente');
      } else {
        console.error('❌ Error eliminando chat:', result.error);
        setError('Error al eliminar el chat');
      }
    } catch (error) {
      console.error('❌ Error eliminando chat:', error);
      setError('Error al eliminar el chat');
    } finally {
      closeContextMenu();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header de Chats */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded cursor-pointer">
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
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de embudos */}
      {selectedEspacio && embudos.length > 0 && (
        <div className="flex-shrink-0">
          <EmbudosFilter
            embudos={embudos}
            selectedEmbudo={selectedEmbudo}
            sesiones={sesiones}
            onEmbudoSelect={handleEmbudoSelect}
          />
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex min-h-0">
        {/* Lista de chats */}
        <div className="w-1/3 bg-[var(--bg-primary)] border-r border-[var(--border-primary)] flex flex-col min-h-0">
           {/* Loading state */}
           {(isLoading || isLoadingChats) && (
             <div className="flex-1 flex items-center justify-center overflow-hidden">
               <div className="text-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
                 <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">
                   {isLoading ? 'Cargando datos...' : 'Cargando chats...'}
                 </h3>
                 <p className="text-[var(--text-muted)] text-sm">
                   {isLoading ? 'Obteniendo datos del espacio de trabajo' : 'Obteniendo conversaciones'}
                 </p>
               </div>
             </div>
           )}
          
          {/* No workspace selected */}
          {!isLoading && !selectedEspacio && (
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <Building2 className="text-[var(--text-muted)] w-16 h-16 mb-4 mx-auto" />
                <h3 className="text-[var(--text-primary)] text-lg font-medium mb-2">Selecciona un espacio</h3>
                <p className="text-[var(--text-muted)] text-sm">Elige un espacio de trabajo para ver sus conversaciones</p>
              </div>
            </div>
          )}
          
           {/* Show chats when workspace is selected and not loading */}
           {!isLoading && !isLoadingChats && selectedEspacio && (
            <>
          {/* Buscador */}
          <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
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

          {/* Lista de chats con scroll */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                onContextMenu={(e) => handleContextMenu(e, chat)}
                className={`p-4 border-b border-[var(--border-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-[var(--bg-secondary)] border-l-4 border-l-[var(--accent-primary)]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center">
                    {chat.sesion.type === 'whatsapp_qr' || chat.sesion.type === 'whatsapp_api' ? (
                      <Image 
                        src="/wpp_logo.svg" 
                        alt="WhatsApp" 
                        width={40} 
                        height={40} 
                      />
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                  </div>

                  {/* Información del chat */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                       <div className="flex items-center space-x-2">
                         <h3 className="text-[var(--text-primary)] font-medium truncate">{chat.contacto.nombre}</h3>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-[var(--text-muted)] text-xs">
                           {chat.ultimoMensaje ? formatTime(chat.ultimoMensaje.creado_en) : formatTime(chat.chat_data.created_at || '')}
                         </span>
                        {chat.noLeidos > 0 && (
                          <span className="bg-[var(--accent-primary)] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                            {chat.noLeidos}
                          </span>
                        )}
                      </div>
                    </div>
                     <div className="flex items-center justify-between">
                       <p className="text-[var(--text-muted)] text-sm truncate flex-1">
                         {chat.ultimoMensaje ? getMessageContent(chat.ultimoMensaje) : 'Sin mensajes'}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <div className="p-8 text-center">
                <MessageCircle className="text-[var(--text-muted)] w-16 h-16 mb-4 mx-auto" />
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
        <div className="flex-1 flex flex-col min-h-0">
          {selectedChat ? (
            <>
              {/* Header del chat */}
              <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      {selectedChat.sesion.type === 'whatsapp_qr' || selectedChat.sesion.type === 'whatsapp_api' ? (
                        <Image 
                          src="/wpp_logo.svg" 
                          alt="WhatsApp" 
                          width={32} 
                          height={32} 
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#F29A1F] rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                     <div>
                       <h3 className="text-[var(--text-primary)] font-medium">{selectedChat.contacto.nombre}</h3>
                       <div className="flex items-center space-x-2">
                         <span className="text-[var(--text-muted)] text-sm">{getSessionIcon(selectedChat.sesion.type).name}</span>
                         <span className="text-[var(--text-muted)]">•</span>
                         <span className="text-[var(--text-muted)] text-sm">{selectedChat.contacto.telefono}</span>
                       </div>
                     </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded cursor-pointer">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes con scroll */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-primary)] min-h-0">
                {messages.map((message) => {
                  const fromMe = isMessageFromMe(message);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          fromMe
                            ? 'bg-gray-500 text-white'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]'
                        }`}
                      >
                         <p className="text-sm">
                           {getMessageContent(message)}
                         </p>
                        <div className={`text-xs mt-1 ${
                          fromMe ? 'text-green-100' : 'text-[var(--text-muted)]'
                        }`}>
                          {formatTime(message.creado_en)}
                          {fromMe && (
                            <span className="ml-1">
                              {message.estado === 'enviado' && <Check className="w-3 h-3" />}
                              {message.estado === 'entregado' && <><Check className="w-3 h-3" /><Check className="w-3 h-3" /></>}
                              {message.leido && <span className="text-blue-300 flex"><Check className="w-3 h-3" /><Check className="w-3 h-3" /></span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input de mensaje */}
              <div className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] p-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded cursor-pointer">
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
                    className="bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors cursor-pointer"
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
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden">
              <div className="text-center">
                <MessageCircle className="text-[var(--text-muted)] w-24 h-24 mb-4 mx-auto" />
                <h3 className="text-[var(--text-primary)] text-xl font-medium mb-2">Selecciona una conversación</h3>
                <p className="text-[var(--text-muted)] text-sm">
                  Elige un chat de la lista para comenzar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menú contextual */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onDelete={handleDeleteChat}
        chatName={contextMenu.chatName}
      />
    </div>
  );
}
