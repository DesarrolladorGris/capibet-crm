import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { ChatResponse } from '../domain/chat';
import { getHeaders, handleResponse } from '../utils';

// GET /api/chats/[id] - Obtener un chat específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del chat inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/chats?id=eq.${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener el chat'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    // Verificar si se encontró el chat
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Chat no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: data[0] as ChatResponse
    });

  } catch (error) {
    console.error('Error fetching chat:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener chat',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PATCH /api/chats/[id] - Actualizar un chat específico por ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatData = await request.json();
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del chat inválido'
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

// DELETE /api/chats/[id] - Eliminar un chat específico por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del chat inválido'
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
