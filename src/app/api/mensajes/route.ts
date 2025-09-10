import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { MensajeData } from './domain/mensaje';
import { getHeaders, handleResponse } from './utils';

// POST /api/mensajes - Crear mensaje
export async function POST(request: NextRequest) {
  try {
    const mensajeData: MensajeData = await request.json();
    
    // Validar campos requeridos
    if (!mensajeData.canal_id || !mensajeData.remitente_id || !mensajeData.contenido || 
        !mensajeData.contacto_id || !mensajeData.sesion_id || !mensajeData.destinatario_id || 
        !mensajeData.embudo_id) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos: canal_id, remitente_id, contenido, contacto_id, sesion_id, destinatario_id, embudo_id'
      }, { status: 400 });
    }

    // Preparar los datos
    const dataToSend = {
      canal_id: mensajeData.canal_id,
      remitente_id: mensajeData.remitente_id,
      contenido: mensajeData.contenido,
      contacto_id: mensajeData.contacto_id,
      sesion_id: mensajeData.sesion_id,
      destinatario_id: mensajeData.destinatario_id,
      embudo_id: mensajeData.embudo_id,
      creado_en: mensajeData.creado_en || new Date().toISOString()
    };

    const response = await fetch(`${supabaseConfig.restUrl}/mensajes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dataToSend)
    });

    if (!response.ok) {
      const errorData = await response.text();
      
      return NextResponse.json({
        success: false,
        error: `Error del servidor: ${response.status} ${response.statusText}`,
        details: errorData
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error creating message:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al crear mensaje',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/mensajes - Obtener todos los mensajes
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/mensajes`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener los mensajes'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener mensajes',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
