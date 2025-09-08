/**
 * Utilidades de autenticación centralizadas
 */

/**
 * Lista completa de todas las claves de localStorage que se usan para la sesión
 */
export const SESSION_STORAGE_KEYS = [
  'isLoggedIn',
  'userEmail',
  'userName', 
  'userRole',
  'userId',
  'agencyName',
  'userData',
  'registeredEmail', // Temporal del registro
  // Agregar aquí cualquier nueva variable de sesión en el futuro
] as const;

/**
 * Limpia completamente todos los datos de sesión del usuario
 * Esta función debe ser la ÚNICA manera de hacer logout en la aplicación
 */
export function clearUserSession(): void {
  // Limpiar localStorage
  SESSION_STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key);
  });

  // Limpiar sessionStorage por seguridad adicional
  SESSION_STORAGE_KEYS.forEach(key => {
    sessionStorage.removeItem(key);
  });

  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Sesión de usuario limpiada completamente');
    console.log('🗑️ Variables eliminadas:', SESSION_STORAGE_KEYS);
  }
}

/**
 * Realiza logout completo y redirige al login
 * Incluye limpieza de sesión y recarga forzada para limpiar memoria
 */
export function performLogout(): void {
  try {
    // Limpiar todos los datos de sesión
    clearUserSession();
    
    // Forzar navegación al login con recarga completa
    // Esto asegura que cualquier estado en memoria se limpia
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error durante logout:', error);
    
    // Fallback: intentar redirigir de todas formas
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

/**
 * Verifica si el usuario está autenticado
 */
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const userData = localStorage.getItem('userData');
  
  return isLoggedIn === 'true' && userData !== null;
}

/**
 * Obtiene el ID del usuario logueado de manera segura
 */
export function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('userId');
  return userId ? parseInt(userId, 10) : null;
}

/**
 * Obtiene los datos del usuario logueado
 */
export function getCurrentUserData(): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

