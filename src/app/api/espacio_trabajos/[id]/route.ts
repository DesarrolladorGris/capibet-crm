import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { EspacioTrabajoData } from '../domain/espacio_trabajo';
import { getHeaders, handleResponse } from '../utils';

// GET /api/espacio_trabajos/[id] - Obtener espacio de trabajo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de espacio de trabajo inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/espacios_de_trabajo?id=eq.${id}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener el espacio de trabajo'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    // Si es un array, tomar el primer elemento o null si está vacío
    const espacio = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
    
    return NextResponse.json({
      success: true,
      data: espacio
    });

  } catch (error) {
    console.error('Error fetching espacio de trabajo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener espacio de trabajo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// PATCH /api/espacio_trabajos/[id] - Actualizar espacio de trabajo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de espacio de trabajo inválido'
      }, { status: 400 });
    }

    const espacioData: Partial<EspacioTrabajoData> = await request.json();

    const response = await fetch(`${supabaseConfig.restUrl}/espacios_de_trabajo?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(espacioData)
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
    console.error('Error updating espacio de trabajo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al actualizar espacio de trabajo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// DELETE /api/espacio_trabajos/[id] - Eliminar espacio de trabajo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de espacio de trabajo inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/espacios_de_trabajo?id=eq.${id}`, {
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
    console.error('Error deleting espacio de trabajo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al eliminar espacio de trabajo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}