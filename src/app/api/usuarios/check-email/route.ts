import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { getHeaders, handleResponse } from '../utils';

// GET /api/usuarios/check-email - Verificar si un email ya existe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'El parámetro email es requerido'
      }, { status: 400 });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/usuarios?correo_electronico=eq.${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al verificar el email'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    const exists = Array.isArray(data) && data.length > 0;
    
    return NextResponse.json({
      success: true,
      data: exists,
      message: exists ? 'El email ya está registrado' : 'El email está disponible'
    });

  } catch (error) {
    console.error('Error checking email:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al verificar email',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
