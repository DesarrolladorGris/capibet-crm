'use client';

import { useState } from 'react';

interface UseExportContactsReturn {
  isExporting: boolean;
  error: string | null;
  exportContacts: () => Promise<void>;
}

export function useExportContacts(): UseExportContactsReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportContacts = async (): Promise<void> => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await fetch('/api/contactos/exportar');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al exportar contactos');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `contactos_${new Date().toISOString().split('T')[0]}.csv`; // Nombre del archivo por defecto
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        // Si el nombre del archivo viene en el header, se usa ese nombre
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error al exportar contactos:', err);
      setError(err instanceof Error ? err.message : 'Error al exportar contactos');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    error,
    exportContacts
  };
}
