import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { SesionData } from './domain/sesion';
import { getHeaders, handleResponse } from './utils';

// POST /api/sesiones - Crear sesión
export async function POST(request: NextRequest) {
  try {
    const sesionData: SesionData = await request.json();
    
    // Preparar los datos con valores por defecto
    const dataToSend = {
      canal_id: sesionData.canal_id,
      usuario_id: sesionData.usuario_id,
      nombre: sesionData.nombre,
      api_key: sesionData.api_key,
      access_token: sesionData.access_token,
      phone_number: sesionData.phone_number,
      email_user: sesionData.email_user,
      email_password: sesionData.email_password,
      smtp_host: sesionData.smtp_host,
      smtp_port: sesionData.smtp_port,
      imap_host: sesionData.imap_host,
      imap_port: sesionData.imap_port,
      estado: sesionData.estado || 'Activo',
      creado_por: sesionData.creado_por
    };

    const response = await fetch(`${supabaseConfig.restUrl}/sesiones`, {
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
    console.error('Error creating sesion:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al crear sesión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/sesiones - Obtener todas las sesiones
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/sesiones`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener las sesiones'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching sesiones:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener sesiones',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
