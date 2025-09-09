import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from '@/config/supabase';
import { ToggleStatusRequest } from '../../domain/usuario';
import { getHeaders } from '../../utils';

// PATCH /api/usuarios/[id]/toggle-status - Cambiar estado del usuario (activo/inactivo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({
        success: false,
        error: 'ID de usuario inválido'
      }, { status: 400 });
    }

    const { activo }: ToggleStatusRequest = await request.json();

    if (typeof activo !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'El campo "activo" debe ser un valor booleano'
      }, { status: 400 });
    }

    const response = await fetch(`${supabaseConfig.restUrl}/usuarios?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ activo }),
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Error ${response.status}: ${response.statusText}`
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true,
      message: activo ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar estado del usuario'
    }, { status: 500 });
  }
}
