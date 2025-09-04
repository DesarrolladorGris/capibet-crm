'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, StarIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import EmailAccountManager from './components/EmailAccountManager';
import EmailComposer from './components/EmailComposer';
import { useAuth } from '../../../hooks/useAuth';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  account: string;
  labels: string[];
}

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  isConnected: boolean;
  unreadCount: number;
}

export default function EmailsPage() {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<Email | null>(null);

  // Datos de ejemplo
  useEffect(() => {
    setAccounts([
      {
        id: '1',
        name: 'Cuenta Principal',
        email: 'admin@capibet.com',
        provider: 'gmail',
        isConnected: true,
        unreadCount: 12
      },
      {
        id: '2',
        name: 'Soporte',
        email: 'soporte@capibet.com',
        provider: 'outlook',
        isConnected: true,
        unreadCount: 5
      },
      {
        id: '3',
        name: 'Ventas',
        email: 'ventas@capibet.com',
        provider: 'gmail',
        isConnected: false,
        unreadCount: 0
      }
    ]);

    setEmails([
      {
        id: '1',
        from: 'cliente@ejemplo.com',
        subject: 'Consulta sobre servicios',
        preview: 'Hola, me gustaría obtener más información sobre...',
        date: 'Hace 2 horas',
        isRead: false,
        isStarred: true,
        account: 'Cuenta Principal',
        labels: ['importante', 'cliente']
      },
      {
        id: '2',
        from: 'proveedor@ejemplo.com',
        subject: 'Cotización actualizada',
        preview: 'Adjunto encontrarás la cotización actualizada...',
        date: 'Hace 1 día',
        isRead: true,
        isStarred: false,
        account: 'Soporte',
        labels: ['cotización']
      }
    ]);
  }, []);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      setEmails(prev => prev.map(e => 
        e.id === email.id ? { ...e, isRead: true } : e
      ));
    }
  };

  const handleStarToggle = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const handleReply = (email: Email) => {
    setReplyToEmail(email);
    setIsComposing(true);
  };

  const handleSendEmail = async (emailData: {
    fromAccountId: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    attachments: File[];
  }) => {
    // Aquí se implementaría la lógica real de envío
    console.log('Enviando email desde cuenta:', emailData.fromAccountId);
    console.log('Datos del email:', emailData);
    
    // Obtener la cuenta seleccionada
    const selectedAccount = accounts.find(acc => acc.id === emailData.fromAccountId);
    if (!selectedAccount) {
      throw new Error('Cuenta no encontrada');
    }
    
    // Simular envío exitoso
    const newEmail: Email = {
      id: Date.now().toString(),
      from: selectedAccount.email,
      subject: emailData.subject,
      preview: emailData.content.substring(0, 100) + '...',
      date: 'Ahora',
      isRead: true,
      isStarred: false,
      account: selectedAccount.name,
      labels: ['enviado']
    };
    
    setEmails(prev => [newEmail, ...prev]);
    return Promise.resolve();
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'inbox') return matchesSearch;
    if (selectedTab === 'starred') return matchesSearch && email.isStarred;
    if (selectedTab === 'sent') return matchesSearch && email.account === 'Cuenta Principal';
    if (selectedTab === 'drafts') return matchesSearch && email.subject.includes('[BORRADOR]');
    if (selectedTab === 'trash') return matchesSearch && email.subject.includes('[ELIMINADO]');
    
    return matchesSearch;
  });

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#3a3d45] bg-[#2a2d35]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-white text-xl font-semibold mb-2">Emails</h1>
              <p className="text-gray-400 text-sm">Gestiona todas tus cuentas de email en un solo lugar</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAccountSelector(true)}
                className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Gestionar Cuentas</span>
              </button>
              <button
                onClick={() => setIsComposing(true)}
                className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nuevo Email</span>
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200"
              />
            </div>
            
            {/* Filtro por cuenta */}
            <select 
              className="bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00b894]"
              onChange={(e) => {
                // Aquí se filtraría por cuenta seleccionada
                console.log('Filtrando por cuenta:', e.target.value);
              }}
            >
              <option value="">Todas las cuentas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email})
                </option>
              ))}
            </select>
            
            <button className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-3 py-2 rounded-lg transition-colors duration-200">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            <button className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-3 py-2 rounded-lg transition-colors duration-200">
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex space-x-1 px-4 py-2 bg-[#1a1d23] border-b border-[#3a3d45]">
          {[
            { id: 'inbox', label: 'Bandeja de entrada', icon: '📥' },
            { id: 'starred', label: 'Destacados', icon: '⭐' },
            { id: 'sent', label: 'Enviados', icon: '📤' },
            { id: 'drafts', label: 'Borradores', icon: '📝' },
            { id: 'trash', label: 'Papelera', icon: '🗑️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.id
                  ? 'bg-[#00b894] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#3a3d45]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido principal - Lista de emails y preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de emails */}
          <div className="w-1/3 border-r border-[#3a3d45] overflow-y-auto">
            <div className="p-2">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                    selectedEmail?.id === email.id
                      ? 'bg-[#00b894] text-white'
                      : 'bg-[#2a2d35] hover:bg-[#3a3d45] text-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(email.id);
                        }}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                      >
                        {email.isStarred ? (
                          <StarIconSolid className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium text-sm truncate ${
                          selectedEmail?.id === email.id ? 'text-white' : 'text-white'
                        }`}>
                          {email.from}
                        </p>
                        <span className={`text-xs ${
                          selectedEmail?.id === email.id ? 'text-white' : 'text-gray-400'
                        }`}>
                          {email.date}
                        </span>
                      </div>
                      <p className={`font-medium text-sm mb-1 truncate ${
                        selectedEmail?.id === email.id ? 'text-white' : 'text-white'
                      }`}>
                        {email.subject}
                      </p>
                      <p className={`text-sm truncate ${
                        selectedEmail?.id === email.id ? 'text-white' : 'text-gray-400'
                      }`}>
                        {email.preview}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedEmail?.id === email.id ? 'bg-white text-[#00b894]' : 'bg-[#3a3d45] text-gray-400'
                        }`}>
                          {email.account}
                        </span>
                        {email.labels.slice(0, 2).map((label, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedEmail?.id === email.id ? 'bg-white text-[#00b894]' : 'bg-[#1a1d23] text-gray-400'
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                        {email.labels.length > 2 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            selectedEmail?.id === email.id ? 'bg-white text-[#00b894]' : 'bg-[#1a1d23] text-gray-400'
                          }`}>
                            +{email.labels.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho - Preview del email o estado vacío */}
          <div className="flex-1 bg-[#1a1d23] overflow-hidden">
            {selectedEmail ? (
              /* Preview del email seleccionado */
              <div className="h-full flex flex-col">
                {/* Header del email */}
                <div className="p-4 border-b border-[#3a3d45] bg-[#2a2d35]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-white text-lg font-semibold">{selectedEmail.subject}</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReply(selectedEmail)}
                        className="bg-[#00b894] hover:bg-[#00a085] text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                      >
                        Responder
                      </button>
                      <button className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200">
                        Reenviar
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span><strong>De:</strong> {selectedEmail.from}</span>
                    <span><strong>Fecha:</strong> {selectedEmail.date}</span>
                    <span><strong>Cuenta:</strong> {selectedEmail.account}</span>
                  </div>
                </div>
                
                {/* Contenido del email */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="bg-[#2a2d35] rounded-lg p-4">
                    <p className="text-white leading-relaxed">{selectedEmail.preview}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Estado vacío cuando no hay email seleccionado - Mostrar Cards de Cuentas */
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <h2 className="text-white text-lg font-semibold mb-4">Cuentas de Email</h2>
                  <p className="text-gray-400 text-sm mb-4">Gestiona y visualiza el estado de todas tus cuentas conectadas</p>
                </div>
                
                {/* Grid de Cards de Cuentas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4 hover:border-[#00b894] transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        // Aquí se filtraría para mostrar solo emails de esta cuenta
                        console.log('Filtrando por cuenta:', account.name);
                      }}
                    >
                      {/* Header de la cuenta */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${account.isConnected ? 'bg-[#00b894]' : 'bg-gray-500'}`}></div>
                          <h3 className="text-white font-medium">{account.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          account.isConnected ? 'bg-[#00b894] text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {account.isConnected ? 'Conectada' : 'Desconectada'}
                        </span>
                      </div>
                      
                      {/* Detalles de la cuenta */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Email:</span>
                          <span className="text-white text-sm font-mono">{account.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Proveedor:</span>
                          <span className="text-white text-sm capitalize">{account.provider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">No leídos:</span>
                          <span className={`text-sm font-medium ${
                            account.unreadCount > 0 ? 'text-[#00b894]' : 'text-gray-400'
                          }`}>
                            {account.unreadCount}
                          </span>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#3a3d45]">
                        <button className="text-[#00b894] hover:text-[#00a085] text-sm font-medium transition-colors duration-200">
                          Ver emails
                        </button>
                        <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                          Configurar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Card de nueva cuenta */}
                <div className="mt-6">
                  <div 
                    className="bg-[#1a1d23] border-2 border-dashed border-[#3a3d45] rounded-lg p-6 text-center hover:border-[#00b894] transition-all duration-200 cursor-pointer"
                    onClick={() => setShowAccountSelector(true)}
                  >
                    <div className="w-12 h-12 bg-[#2a2d35] rounded-full flex items-center justify-center mx-auto mb-3">
                      <PlusIcon className="w-6 h-6 text-[#00b894]" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Agregar Nueva Cuenta</h3>
                    <p className="text-gray-400 text-sm">Conecta Gmail, Outlook, Yahoo o una cuenta personalizada</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAccountSelector && (
        <EmailAccountManager
          accounts={accounts}
          onAccountsChange={setAccounts}
          onClose={() => setShowAccountSelector(false)}
        />
      )}

      {isComposing && (
        <EmailComposer
          isOpen={isComposing}
          onClose={() => {
            setIsComposing(false);
            setReplyToEmail(null);
          }}
          accounts={accounts}
          replyTo={replyToEmail ? {
            to: replyToEmail.from,
            subject: replyToEmail.subject,
            content: replyToEmail.preview
          } : undefined}
          onSend={handleSendEmail}
        />
      )}
    </>
  );
}

