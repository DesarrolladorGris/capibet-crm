import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { EtiquetaData } from './domain/etiqueta';
import { getHeaders, handleResponse } from './utils';

// POST /api/etiquetas - Crear etiqueta
export async function POST(request: NextRequest) {
  try {
    const etiquetaData: EtiquetaData = await request.json();
    
    // Validar campos requeridos
    if (!etiquetaData.nombre || !etiquetaData.color || !etiquetaData.descripcion || !etiquetaData.creado_por) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos requeridos: nombre, color, descripcion, creado_por'
      }, { status: 400 });
    }

    // Preparar los datos
    const dataToSend = {
      nombre: etiquetaData.nombre,
      color: etiquetaData.color,
      descripcion: etiquetaData.descripcion,
      creado_por: etiquetaData.creado_por,
      creado_en: etiquetaData.creado_en || new Date().toISOString()
    };

    const response = await fetch(`${supabaseConfig.restUrl}/etiquetas`, {
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
    console.error('Error creating etiqueta:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al crear etiqueta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/etiquetas - Obtener todas las etiquetas
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/etiquetas`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener las etiquetas'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching etiquetas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener etiquetas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
