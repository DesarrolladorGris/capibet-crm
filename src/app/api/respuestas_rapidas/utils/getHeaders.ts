import { supabaseConfig } from '@/config/supabase';

export function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'apikey': supabaseConfig.serviceRoleKey,
    'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
  };
}
