import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { SesionData, SesionResponse } from '../domain/sesion';
import { getHeaders, handleResponse } from '../utils';

// GET /api/sesiones/[id] - Obtener sesión por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de sesión inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/sesiones?id=eq.${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener la sesión'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data[0] : null
    });

  } catch (error) {
    console.error('Error fetching sesion:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener sesión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PATCH /api/sesiones/[id] - Actualizar sesión
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de sesión inválido'
      }, { status: 400 });
    }

    const sesionData: Partial<SesionData> = await request.json();

    const response = await fetch(`${supabaseConfig.restUrl}/sesiones?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(sesionData),
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
      data: data as unknown as SesionResponse
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar sesión'
    }, { status: 500 });
  }
}

// DELETE /api/sesiones/[id] - Eliminar sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de sesión inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/sesiones?id=eq.${id}`, {
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
      error: error instanceof Error ? error.message : 'Error al eliminar sesión'
    }, { status: 500 });
  }
}
