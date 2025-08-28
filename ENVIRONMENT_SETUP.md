# Configuración de Variables de Entorno

Para que la aplicación funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Crear el archivo .env.local en la raíz del proyecto
# Copiar y pegar el siguiente contenido:

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dkrdphnnsgndrqmgdvxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg
```

## Pasos para configurar:

1. **Crear el archivo**:
   ```bash
   touch .env.local
   ```

2. **Copiar las variables** del contenido de arriba al archivo `.env.local`

3. **Reiniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## Notas de Seguridad:

- El archivo `.env.local` está ignorado por Git para mantener las credenciales seguras
- Nunca subas las credenciales al repositorio
- Para producción, configura estas variables en tu servicio de hosting (Vercel, Netlify, etc.)

## Verificación:

Una vez configurado, la aplicación debería:
- Permitir registros reales en Supabase
- Verificar emails duplicados
- Mostrar mensajes de error/éxito apropiados
- Redireccionar al login después del registro exitoso
