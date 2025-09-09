import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { LoginCredentials, UsuarioData } from '../domain/usuario';
import { getHeaders, handleResponse } from '../utils';

// POST /api/usuarios/login - Autenticación de usuario
export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json();

    // Validar que se proporcionen las credenciales
    if (!credentials.correo_electronico || !credentials.contrasena) {
      return NextResponse.json({
        success: false,
        error: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.correo_electronico)) {
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/usuarios?correo_electronico=eq.${encodeURIComponent(credentials.correo_electronico)}&contrasena=eq.${encodeURIComponent(credentials.contrasena)}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error en las credenciales'
      }, { status: response.status });
    }

    const data = await handleResponse(response);
    
    if (Array.isArray(data) && data.length > 0) {
      const usuario = data[0] as UsuarioData;
      
      // Verificar que el usuario esté activo
      if (usuario.activo === false) {
        return NextResponse.json({
          success: false,
          error: 'Usuario desactivado. Contacta al administrador.'
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Login exitoso'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Credenciales incorrectas'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Error in login:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error de conexión al iniciar sesión',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
