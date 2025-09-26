import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { WhatsAppMessagePayload } from '../../types';

/**
 * Obtiene los headers para Supabase
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'apikey': supabaseConfig.anonKey,
    'Authorization': `Bearer ${supabaseConfig.anonKey}`,
    'Prefer': 'return=representation'
  };
}

/**
 * Maneja la respuesta de Supabase
 */
async function handleResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Busca o crea un contacto basado en el número de teléfono
 */
async function findOrCreateContact(phoneNumber: string, contactName: string, userId: number): Promise<number | null> {
  try {
    // Limpiar el número de teléfono (remover espacios, guiones, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/[\s-]/g, '');
    
    // Buscar contacto existente por teléfono
    const findContactResponse = await fetch(`${supabaseConfig.restUrl}/contactos?telefono=eq.${cleanPhoneNumber}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (findContactResponse.ok) {
      const contacts = await handleResponse(findContactResponse);
      if (Array.isArray(contacts) && contacts.length > 0) {
        // Si encontramos el contacto, verificamos si necesita actualizar el nombre
        const existingContact = contacts[0];
        
        // Solo actualizar si el nombre actual es genérico y tenemos un nombre mejor
        const isGenericName = !existingContact.nombre || 
                             existingContact.nombre.startsWith('Usuario ') ||
                             existingContact.nombre === 'Destinatario' ||
                             existingContact.nombre === 'Sin nombre';
        
        const hasValidName = contactName && 
                           contactName !== 'Destinatario' && 
                           contactName !== 'Sin nombre' &&
                           contactName.trim() !== '';

        if (isGenericName && hasValidName) {
          // Actualizar el contacto con el nombre real
          const updateContactResponse = await fetch(`${supabaseConfig.restUrl}/contactos?id=eq.${existingContact.id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({
              nombre: contactName,
              nombre_completo: contactName
            })
          });
          
          if (updateContactResponse.ok) {
            console.log(`Contacto actualizado: ${existingContact.id} con nombre ${contactName}`);
          }
        }
        
        return existingContact.id;
      }
    }

    // Determinar el nombre a usar para el nuevo contacto
    let finalName = contactName;
    if (!finalName || finalName === 'Destinatario' || finalName === 'Sin nombre' || finalName.trim() === '') {
      finalName = `Usuario ${cleanPhoneNumber}`;
    }

    // Si no existe, crear un nuevo contacto
    const newContactData = {
      nombre: finalName,
      telefono: cleanPhoneNumber,
      correo: null, // Campo requerido según el schema
      creado_por: userId,
      nombre_completo: finalName
    };

    console.log('Creando nuevo contacto:', newContactData);

    const createContactResponse = await fetch(`${supabaseConfig.restUrl}/contactos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newContactData)
    });

    if (createContactResponse.ok) {
      const newContact = await handleResponse(createContactResponse);
      const contact = Array.isArray(newContact) ? newContact[0] : newContact;
      console.log(`Nuevo contacto creado: ${contact?.id} - ${finalName} (${cleanPhoneNumber})`);
      return contact?.id || null;
    } else {
      const errorText = await createContactResponse.text();
      console.error('Error al crear contacto:', createContactResponse.status, errorText);
    }

    return null;
  } catch (error) {
    console.error('Error al buscar/crear contacto:', error);
    return null;
  }
}

/**
 * Busca o crea un chat entre la sesión y el contacto
 */
async function findOrCreateChat(sessionId: number, contactId: number): Promise<number | null> {
  try {
    // Buscar chat existente
    const findChatResponse = await fetch(`${supabaseConfig.restUrl}/chats?sesion_id=eq.${sessionId}&contact_id=eq.${contactId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (findChatResponse.ok) {
      const chats = await handleResponse(findChatResponse);
      if (Array.isArray(chats) && chats.length > 0) {
        return chats[0].id;
      }
    }

    // Si no existe, crear un nuevo chat
    const newChatData = {
      sesion_id: sessionId,
      contact_id: contactId
    };

    const createChatResponse = await fetch(`${supabaseConfig.restUrl}/chats`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newChatData)
    });

    if (createChatResponse.ok) {
      const newChat = await handleResponse(createChatResponse);
      const chat = Array.isArray(newChat) ? newChat[0] : newChat;
      return chat?.id || null;
    }

    return null;
  } catch (error) {
    console.error('Error al buscar/crear chat:', error);
    return null;
  }
}

/**
 * POST /api/whatsapp/messages/received
 * Endpoint llamado por el orquestador cuando llega un mensaje de WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppMessagePayload = await request.json();

    console.log('Mensaje recibido:', body);

    // Validaciones
    if (!body.session_id) {
      return NextResponse.json({
        success: false,
        error: 'session_id es requerido'
      }, { status: 400 });
    }

    // Buscar la sesión de WhatsApp
    const findSessionResponse = await fetch(`${supabaseConfig.restUrl}/whatsapp_sessions?session_id=eq.${body.session_id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!findSessionResponse.ok) {
      console.error('Error buscando sesión de WhatsApp:', findSessionResponse.status);
      return NextResponse.json({
        success: false,
        error: 'Error al buscar la sesión de WhatsApp'
      }, { status: findSessionResponse.status });
    }

    const whatsappSessions = await handleResponse(findSessionResponse);
    const whatsappSession = Array.isArray(whatsappSessions) ? whatsappSessions[0] : whatsappSessions;

    if (!whatsappSession) {
      console.error('Sesión de WhatsApp no encontrada');
      return NextResponse.json({
        success: false,
        error: 'Sesión de WhatsApp no encontrada'
      }, { status: 404 });
    }

    const sesion = await fetch(`${supabaseConfig.restUrl}/sesiones?whatsapp_session=eq.${whatsappSession.id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    const sesionData = (await handleResponse(sesion))[0];

    // Determinar los datos del contacto según el flag fromMe
    const isFromMe = body.raw_message.key.fromMe;
    let contactPhone: string;
    let contactName: string;

    if (isFromMe) {
      // Si el mensaje es fromMe: true, el contacto está en recipient_*
      contactPhone = body.recipient_phone_number;
      contactName = body.recipient_name;
    } else {
      // Si el mensaje es fromMe: false, el contacto está en sender_*
      contactPhone = body.sender_phone_number;
      contactName = body.sender_name;
    }

    console.log(`Procesando mensaje fromMe: ${isFromMe}`);
    console.log(`Contacto: ${contactName} (${contactPhone})`);
    
    const contactId = await findOrCreateContact(contactPhone, contactName, sesionData.usuario_id);
    if (!contactId) {
      console.error('Error al procesar contacto');
      return NextResponse.json({
        success: false,
        error: 'Error al procesar contacto'
      }, { status: 500 });
    }

    // Buscar o crear chat
    const chatId = await findOrCreateChat(sesionData.id, contactId);
    if (!chatId) {
      console.error('Error al procesar chat');
      return NextResponse.json({
        success: false,
        error: 'Error al procesar chat'
      }, { status: 500 });
    }

    console.log('Hasta aquí todo bien');

    // Preparar el contenido del mensaje usando la nueva estructura
    const messageContent = {
      whatsapp_message_id: body.raw_message.key.id,
      sender_name: body.sender_name,
      sender_phone_number: body.sender_phone_number,
      recipient_name: body.recipient_name,
      recipient_phone_number: body.recipient_phone_number,
      message_content: body.message_content,
      message_type: body.message_type,
      media_info: body.media_info,
      raw_message: body.raw_message,
      received_at: body.received_at,
      phone_number_session: body.phone_number_session,
      ...(body.message_type === 'image' ? {image_compressed: body.image_compressed} : {}),
      ...(body.message_type === 'image' ? {image_mimetype: body.image_mimetype} : {})
    };

    // Crear el mensaje - el remitente_id depende de quién envió el mensaje
    const newMessageData = {
      remitente_id: isFromMe ? sesionData.usuario_id : null, // Si fromMe=true, lo envió el usuario; si false, lo envió el contacto (null)
      contacto_id: contactId,
      chat_id: chatId,
      type: 'whatsapp_api',
      content: messageContent,
      creado_en: new Date().toISOString()
    };

    console.log('Datos a enviar:', newMessageData);

    const createMessageResponse = await fetch(`${supabaseConfig.restUrl}/mensajes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newMessageData)
    });

    if (!createMessageResponse.ok) {
      console.error('Error creando mensaje:', createMessageResponse.status, createMessageResponse.statusText);
      return NextResponse.json({
        success: false,
        error: 'Error al guardar el mensaje',
        details: createMessageResponse.statusText
      }, { status: createMessageResponse.status });
    }

    const savedMessage = await handleResponse(createMessageResponse);
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje procesado correctamente',
      data: {
        message: Array.isArray(savedMessage) ? savedMessage[0] : savedMessage,
        contact_id: contactId,
        chat_id: chatId
      }
    });

  } catch (error) {
    console.error('Error inesperado en messages/received:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Maneja métodos no soportados
 */
export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Método no permitido'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    error: 'Método no permitido'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    error: 'Método no permitido'
  }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({
    success: false,
    error: 'Método no permitido'
  }, { status: 405 });
}
