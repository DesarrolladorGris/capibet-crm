import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { ChatData, ChatResponse } from './domain/chat';
import { getHeaders, handleResponse } from './utils';

// GET /api/chats - Obtener todos los chats
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/chats`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener los chats'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener chats',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// POST /api/chats - Crear nuevo chat
export async function POST(request: NextRequest) {
  try {
    const chatData: ChatData = await request.json();
    
    const response = await fetch(`${supabaseConfig.restUrl}/chats`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(chatData)
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
      data: data as unknown as ChatResponse
    });

  } catch (error) {
    console.error('Error creating chat:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PATCH /api/chats - Actualizar chat existente
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...chatData } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID del chat es requerido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/chats?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(chatData),
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
      data: data as unknown as ChatResponse
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar chat'
    }, { status: 500 });
  }
}

// DELETE /api/chats - Eliminar chat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID del chat es requerido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/chats?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({
        success: false,
        error: `Error del servidor: ${response.status} ${response.statusText}`,
        details: errorData
      }, { status: response.status });
    }

    await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: undefined
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar chat'
    }, { status: 500 });
  }
}
