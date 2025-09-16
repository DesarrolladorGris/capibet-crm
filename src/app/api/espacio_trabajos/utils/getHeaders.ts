import { supabaseConfig } from '@/config/supabase';

// Headers para las peticiones a Supabase
export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'apikey': supabaseConfig.anonKey,
    'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
  };
};