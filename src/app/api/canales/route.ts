import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { CanalData } from './domain/canal';
import { getHeaders, handleResponse } from './utils';

// POST /api/canales - Crear canal
export async function POST(request: NextRequest) {
  try {
    const canalData: CanalData = await request.json();
    
    // Preparar los datos con valores por defecto
    const dataToSend = {
      usuario_id: canalData.usuario_id,
      espacio_id: canalData.espacio_id,
      tipo: canalData.tipo,
      descripcion: canalData.descripcion,
      creado_por: canalData.creado_por
    };

    const response = await fetch(`${supabaseConfig.restUrl}/canales`, {
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
    console.error('Error creating canal:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al crear canal',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/canales - Obtener todos los canales
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/canales`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener los canales'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching canales:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener canales',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
