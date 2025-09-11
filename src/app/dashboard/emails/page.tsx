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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header compacto estilo Beast CRM */}
        <div className="bg-[#1a1d23] border-b border-[#3a3d45] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-white font-semibold text-xl">Emails</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>•</span>
                <span>Gestión de correos</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAccountSelector(true)}
                className="bg-[#00b894] hover:bg-[#00a085] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Gestionar Cuentas</span>
              </button>
              <button
                onClick={() => setIsComposing(true)}
                className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Nuevo Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de navegación compactas */}
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
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
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

        {/* Layout de 3 columnas estilo Beast CRM */}
        <div className="flex-1 flex overflow-hidden">
          {/* Columna izquierda - Lista de emails */}
          <div className="w-1/3 border-r border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
            <div className="p-3">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200 text-sm"
                />
              </div>
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
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
                          {email.labels.slice(0, 1).map((label, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedEmail?.id === email.id ? 'bg-white text-[#00b894]' : 'bg-[#1a1d23] text-gray-400'
                              }`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna central - Preview del email */}
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
              /* Estado vacío cuando no hay email seleccionado */
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-center text-gray-400 py-12">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Selecciona un email</p>
                  <p className="text-sm">Elige un email de la lista para ver su contenido</p>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Panel lateral */}
          <div className="w-80 border-l border-[#3a3d45] bg-[#1a1d23] overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-medium mb-4">Filtros</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Cuenta</label>
                  <select 
                    className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]"
                    onChange={(e) => {
                      console.log('Filtrando por cuenta:', e.target.value);
                    }}
                  >
                    <option value="">Todas las cuentas</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Estado</label>
                  <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                    <option>Todos los estados</option>
                    <option>No leídos</option>
                    <option>Leídos</option>
                    <option>Destacados</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Fecha</label>
                  <select className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00b894]">
                    <option>Todas las fechas</option>
                    <option>Hoy</option>
                    <option>Esta semana</option>
                    <option>Este mes</option>
                    <option>Este año</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-white font-medium mb-4">Cuentas</h3>
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div key={account.id} className="bg-[#2a2d35] rounded-lg p-3 border border-[#3a3d45]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-[#00b894]' : 'bg-gray-500'}`}></div>
                          <h4 className="text-white font-medium text-sm">{account.name}</h4>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          account.isConnected ? 'bg-[#00b894] text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {account.isConnected ? 'Conectada' : 'Desconectada'}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs mb-2">{account.email}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">No leídos:</span>
                        <span className={`text-sm font-medium ${
                          account.unreadCount > 0 ? 'text-[#00b894]' : 'text-gray-400'
                        }`}>
                          {account.unreadCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

