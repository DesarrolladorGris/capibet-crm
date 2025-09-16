import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { ContactResponse } from '../domain/contacto';
import { getHeaders, handleResponse } from '../utils';

// GET /api/contactos/[id] - Obtener un contacto específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del contacto inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/contactos?id=eq.${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener el contacto'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    // Verificar si se encontró el contacto
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contacto no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: data[0] as ContactResponse
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener contacto',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PATCH /api/contactos/[id] - Actualizar un contacto específico por ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contactData = await request.json();
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del contacto inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/contactos?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(contactData),
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
      data: data as unknown as ContactResponse
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar contacto'
    }, { status: 500 });
  }
}

// DELETE /api/contactos/[id] - Eliminar un contacto específico por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID del contacto inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/contactos?id=eq.${id}`, {
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
      error: error instanceof Error ? error.message : 'Error al eliminar contacto'
    }, { status: 500 });
  }
}
