// Supabase Configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkrdphnnsgndrqmgdvxp.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg',
  restUrl: 'https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1'
};

// API Endpoints
export const apiEndpoints = {
  usuarios: `${supabaseConfig.restUrl}/usuarios`,
  etiquetas: `${supabaseConfig.restUrl}/etiquetas`
};
