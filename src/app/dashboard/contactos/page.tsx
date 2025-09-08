'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import DashboardLayout from '../layout';
import AgregarContactoModal from './components/AgregarContactoModal';
import EditarContactoModal from './components/EditarContactoModal';
import ConfirmarEliminarModal from './components/ConfirmarEliminarModal';
import ConfirmarEliminacionMasivaModal from './components/ConfirmarEliminacionMasivaModal';
import { supabaseService, ContactResponse, ContactData } from '@/services/supabaseService';
import { isUserAuthenticated, getCurrentUserId } from '@/utils/auth';
import { useExportContacts } from '@/hooks/useExportContacts';
import { useImportContacts } from '@/hooks/useImportContacts';

export default function ContactosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactResponse | null>(null);
  const [deletingContact, setDeletingContact] = useState<ContactResponse | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const router = useRouter();

  // Función para cargar contactos desde Supabase
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await supabaseService.getAllContactos();
      
      if (result.success && result.data) {
        setContacts(result.data);
      } else {
        setError(result.error || 'Error al cargar contactos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  };

  const { isExporting, error: exportError, exportContacts } = useExportContacts();
  const { isImporting, error: importError, successMessage, importErrors, importContacts } = useImportContacts(fetchContacts);

  const closeError = () => {
    setShowError(false);
    setError(null);
  };

  const closeSuccess = () => {
    setShowSuccess(false);
  };

  // Cierre automatico del modal de errores despues de 30 segundos
  useEffect(() => {
    if (error || exportError || importError) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [error, exportError, importError]);

  // Cierre automatico del modal de éxito despues de 30 segundos
  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Función para agregar nuevo contacto
  const handleAddContact = async (contactData: ContactData) => {
    try {
      const result = await supabaseService.createContacto(contactData);
      
      if (result.success) {
        // Recargar contactos
        await fetchContacts();
        console.log('Contacto agregado exitosamente');
      } else {
        setError(result.error || 'Error al agregar contacto');
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar contacto');
      throw err; // Re-lanzar para que el modal maneje el error
    }
  };

  // Función para abrir modal de confirmación de eliminación
  const handleDeleteContact = (contact: ContactResponse) => {
    setDeletingContact(contact);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación de contacto
  const handleConfirmDelete = async () => {
    if (!deletingContact) return;

    try {
      // Usar el servicio seguro para eliminar
      const result = await supabaseService.deleteContacto(deletingContact.id);
      
      if (result.success) {
        // Recargar contactos
        await fetchContacts();
        console.log('Contacto eliminado exitosamente');
        
        // Cerrar modal
        setShowDeleteModal(false);
        setDeletingContact(null);
      } else {
        setError(result.error || 'Error al eliminar el contacto');
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error al eliminar contacto:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar contacto');
      throw err; // Re-lanzar para que el modal maneje el error
    }
  };

  // Función para cerrar modal de eliminación
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingContact(null);
  };



  // Función para abrir modal de confirmación de eliminación masiva
  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  // Función para confirmar eliminación masiva de contactos
  const handleConfirmBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    console.log('Iniciando eliminación masiva de contactos:', selectedContacts);
    
    try {
      const failedDeletions: number[] = [];
      const successfulDeletions: number[] = [];
      
      // Eliminar cada contacto seleccionado usando el servicio seguro
      for (const contactId of selectedContacts) {
        console.log(`Procesando eliminación del contacto ID: ${contactId}`);
        try {
          const result = await supabaseService.deleteContacto(contactId);
          
          if (result.success) {
            successfulDeletions.push(contactId);
          } else {
            console.error(`Error al eliminar contacto ${contactId}:`, result.error);
            failedDeletions.push(contactId);
          }
        } catch (error) {
          console.error(`Error de red al eliminar contacto ${contactId}:`, error);
          failedDeletions.push(contactId);
        }
      }
      
      // Mostrar resultados
      if (successfulDeletions.length > 0) {
        console.log(`${successfulDeletions.length} contacto(s) eliminado(s) exitosamente`);
        
        if (failedDeletions.length > 0) {
          console.warn(`${failedDeletions.length} contacto(s) no se pudieron eliminar:`, failedDeletions);
          setError(`Se eliminaron ${successfulDeletions.length} contacto(s), pero ${failedDeletions.length} fallaron. Solo puedes eliminar tus propios contactos.`);
        } else {
          // Todos exitosos
          setError(null);
        }
        
        // Recargar contactos
        await fetchContacts();
      }
      
      if (failedDeletions.length === 0) {
        // Solo cerrar modal si todos fueron exitosos
        setSelectedContacts([]);
        setShowBulkDeleteModal(false);
      } else {
        // Si hay fallos, mantener el modal abierto y mostrar error
        setError(`Error al eliminar algunos contactos. ${successfulDeletions.length} eliminado(s), ${failedDeletions.length} fallido(s). Solo puedes eliminar tus propios contactos.`);
      }
    } catch (err) {
      console.error('Error general al eliminar contactos:', err);
      setError('Error inesperado al eliminar contactos. Revisa la consola para más detalles.');
    }
  };

  // Función para cerrar modal de eliminación masiva
  const handleCloseBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
    // Limpiar selección al cerrar el modal
    setSelectedContacts([]);
  };

  // Función para enviar mensaje a contactos seleccionados
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sendMessageToSelected = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      // TODO: Implementar envío de mensajes
      // Lógica para enviar mensajes a los contactos seleccionados
      console.log('Enviando mensaje a:', selectedContacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensajes');
    }
  };

  // Función para editar contacto
  const handleEditContact = (contact: ContactResponse) => {
    setEditingContact(contact);
    setShowEditModal(true);
  };

  // Función para cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingContact(null);
  };

  // Función para manejar contacto actualizado
  const handleContactUpdated = async () => {
    await fetchContacts(); // Recargar contactos
  };



  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleSelectContact = (contactId: number) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.apellido && contact.apellido.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.nombre_completo && contact.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    contact.telefono.includes(searchQuery) ||
    (contact.empresa && contact.empresa.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (contact.etiqueta && contact.etiqueta.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cargar datos del usuario y contactos al montar el componente
  useEffect(() => {
    // Verificar autenticación usando la utilidad centralizada
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar datos del usuario usando la utilidad centralizada
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId || 0);
    
    // Cargar contactos
    fetchContacts();
  }, [router]);

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  // Función para obtener el nombre completo
  const getFullName = (contact: ContactResponse) => {
    if (contact.nombre_completo) return contact.nombre_completo;
    if (contact.apellido) return `${contact.nombre} ${contact.apellido}`;
    return contact.nombre;
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#1a1d23] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header de Contactos */}
      <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Page Title */}
            <h1 className="text-white font-semibold text-2xl">Contactos</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <button 
              onClick={importContacts}
              disabled={isImporting}
              className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{isImporting ? 'Importando...' : 'Importar'}</span>
            </button>

            <button 
              onClick={exportContacts}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
            </button>

            {/* Botón Agregar Contacto */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Contacto</span>
            </button>

            {/* Filter */}
            <button className="text-gray-400 hover:text-white p-2 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 pl-9 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894] w-48"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
       <div className={`flex-1 bg-[#1a1d23] p-6 ${selectedContacts.length > 0 ? 'mb-24' : ''}`}>
        {/* Error Message */}
        {showError && (error || exportError || importError) && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg relative">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="font-medium mb-2">{error || exportError || importError}</div>
                {importErrors.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">Errores encontrados:</div>
                    <ul className="text-sm space-y-1">
                      {importErrors.map((error, index) => (
                        <li key={index} className="bg-red-700 p-2 rounded text-xs">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={closeError}
                className="text-white hover:text-gray-200 transition-colors duration-200 flex-shrink-0"
                aria-label="Cerrar mensaje de error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && successMessage && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg relative">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                {successMessage}
              </div>
              <button
                onClick={closeSuccess}
                className="text-white hover:text-gray-200 transition-colors duration-200 flex-shrink-0"
                aria-label="Cerrar mensaje de éxito"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#2a2d35] rounded-lg border border-[#3a3d45]">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 p-4 border-b border-[#3a3d45] text-gray-400 text-sm font-medium">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#00b894] bg-[#1a1d23] border-[#3a3d45] rounded focus:ring-[#00b894] focus:ring-2"
              />
            </div>
            <div>Nombre</div>
            <div>Empresa</div>
            <div>Teléfono</div>
            <div>Email</div>
            <div>Etiqueta</div>
            <div>Fecha Creación</div>
            <div>Acciones</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">Cargando...</div>
            </div>
          ) : filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="grid grid-cols-8 gap-4 p-4 border-b border-[#3a3d45] hover:bg-[#3a3d45] transition-colors"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    className="w-4 h-4 text-[#00b894] bg-[#1a1d23] border-[#3a3d45] rounded focus:ring-[#00b894] focus:ring-2"
                  />
                </div>
                <div className="text-white font-medium">{getFullName(contact)}</div>
                <div className="text-gray-300">{contact.empresa || '-'}</div>
                <div className="text-gray-300">{contact.telefono}</div>
                <div className="text-gray-300">{contact.correo}</div>
                <div>
                  {contact.etiqueta && (
                    <span className="px-2 py-1 bg-[#00b894] text-white text-xs rounded-full">
                      {contact.etiqueta}
                    </span>
                  )}
                </div>
                <div className="text-gray-300 text-sm">
                  {formatDate(contact.creado_en)}
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleEditContact(contact)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                    title="Editar contacto"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeleteContact(contact)}
                    className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                    title="Eliminar contacto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="text-gray-400 text-lg mb-2">Sin datos</div>
              <div className="text-gray-500 text-sm">Página 1 de 0</div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
          <button className="px-4 py-2 text-gray-500 bg-[#2a2d35] border border-[#3a3d45] rounded cursor-not-allowed">
            ANTERIOR
          </button>
          <button className="px-4 py-2 text-gray-500 bg-[#2a2d35] border border-[#3a3d45] rounded cursor-not-allowed">
            SIGUIENTE
          </button>
        </div>

                 {/* Selected Contacts Info */}
         {selectedContacts.length > 0 && (
           <div className="fixed bottom-0 left-0 right-0 bg-[#2a2d35] border-t border-[#3a3d45] p-4 z-40">
             <div className="flex items-center justify-between max-w-7xl mx-auto">
               <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-2 bg-[#00b894] text-white px-3 py-2 rounded-full">
                   <span className="text-sm font-medium">{selectedContacts.length}</span>
                   <span className="text-xs">Seleccionado{selectedContacts.length !== 1 ? 's' : ''}</span>
                 </div>
                 <span className="text-gray-300 text-sm">
                   {selectedContacts.length} contacto{selectedContacts.length !== 1 ? 's' : ''} seleccionado{selectedContacts.length !== 1 ? 's' : ''}
                 </span>
               </div>
               <div className="flex items-center space-x-3">
                                   <button 
                    onClick={() => setSelectedContacts([])}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Limpiar</span>
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Eliminar</span>
                  </button>
               </div>
             </div>
           </div>
         )}
      </div>

      {/* Modal Agregar Contacto */}
      <AgregarContactoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddContact}
        userId={userId}
      />

      {/* Modal Editar Contacto */}
      <EditarContactoModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onContactUpdated={handleContactUpdated}
        contact={editingContact}
      />

      {/* Modal Confirmar Eliminación */}
      <ConfirmarEliminarModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        contactName={deletingContact ? getFullName(deletingContact) : ''}
      />

      {/* Modal Confirmar Eliminación Masiva */}
      <ConfirmarEliminacionMasivaModal
        isOpen={showBulkDeleteModal}
        onClose={handleCloseBulkDeleteModal}
        onConfirm={handleConfirmBulkDelete}
        contactCount={selectedContacts.length}
      />
    </div>
  );
}
