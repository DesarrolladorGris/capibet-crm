import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { UsuarioData } from './domain/usuario';
import { getHeaders, handleResponse } from './utils';

// POST /api/usuarios - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const userData: UsuarioData = await request.json();
    
    // Preparar los datos con valores por defecto
    const dataToSend = {
      nombre_agencia: userData.nombre_agencia,
      tipo_empresa: userData.tipo_empresa,
      nombre_usuario: userData.nombre_usuario,
      correo_electronico: userData.correo_electronico,
      telefono: userData.telefono,
      codigo_pais: userData.codigo_pais,
      contrasena: userData.contrasena,
      rol: userData.rol || 'Operador',
      activo: userData.activo !== undefined ? userData.activo : true
    };

    const response = await fetch(`${supabaseConfig.restUrl}/usuarios`, {
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
    console.error('Error creating user:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al crear usuario',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/usuarios - Obtener todos los usuarios
export async function GET() {
  try {
    const response = await fetch(`${supabaseConfig.restUrl}/usuarios`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al obtener los usuarios'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : []
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener usuarios',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
