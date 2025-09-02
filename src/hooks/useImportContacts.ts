'use client';

import { useState } from 'react';

interface UseImportContactsReturn {
  isImporting: boolean;
  error: string | null;
  successMessage: string | null;
  importErrors: string[];
  importContacts: () => Promise<void>;
}

export function useImportContacts(onSuccess?: () => void): UseImportContactsReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const importContacts = async (): Promise<void> => {
    try {
      setIsImporting(true);
      setError(null);
      setSuccessMessage(null);
      setImportErrors([]);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      input.style.display = 'none';
      
      const filePromise = new Promise<File>((resolve, reject) => {
        input.onchange = (event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          
          if (!file) {
            reject(new Error('No se seleccionó ningún archivo'));
            return;
          }
          
          if (!file.name.endsWith('.csv')) {
            reject(new Error('El archivo debe ser un CSV'));
            return;
          }
          
          resolve(file);
        };
        
        input.oncancel = () => {
          reject(new Error('Selección de archivo cancelada'));
        };
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);

      const file = await filePromise;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/contactos/importar', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al importar contactos');
      }

      const result = await response.json();
      console.log('Importación completada:', result);
      
      if (result.errores && result.errores.length > 0) {
        setError(result.message || 'Error en la importación');
        setImportErrors(result.errores);
      } else {
        setSuccessMessage(result.message);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error al importar contactos:', err);
      setError(err instanceof Error ? err.message : 'Error al importar contactos');
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    error,
    successMessage,
    importErrors,
    importContacts
  };
}
