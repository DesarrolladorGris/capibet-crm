'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, BellIcon, ChevronDownIcon, EnvelopeIcon, StarIcon, FolderIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import EmailAccountManager from './components/EmailAccountManager';
import EmailComposer from './components/EmailComposer';

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
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    attachments: File[];
  }) => {
    // Aquí se implementaría la lógica real de envío
    console.log('Enviando email:', emailData);
    
    // Simular envío exitoso
    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'admin@capibet.com',
      subject: emailData.subject,
      preview: emailData.content.substring(0, 100) + '...',
      date: 'Ahora',
      isRead: true,
      isStarred: false,
      account: 'Cuenta Principal',
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

  const totalUnread = accounts.reduce((sum, account) => sum + account.unreadCount, 0);

  return (
    <div className="flex h-screen bg-[#0f1419] text-white">
      {/* Sidebar izquierda - Lista de emails */}
      <div className="w-80 bg-[#1a1d23] border-r border-[#3a3d45] flex flex-col">
        {/* Header con botón de nuevo email */}
        <div className="p-4 border-b border-[#3a3d45]">
          <button
            onClick={() => setIsComposing(true)}
            className="w-full bg-[#00b894] hover:bg-[#00a085] text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Email</span>
          </button>
        </div>

        {/* Selector de cuenta */}
        <div className="p-4 border-b border-[#3a3d45]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Cuentas</span>
            <button
              onClick={() => setShowAccountSelector(!showAccountSelector)}
              className="text-[#00b894] hover:text-[#00a085] text-sm"
            >
              Gestionar
            </button>
          </div>
          <div className="space-y-2">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2a2d35] cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-[#00b894]' : 'bg-gray-500'}`}></div>
                  <span className="text-sm text-gray-300">{account.name}</span>
                </div>
                {account.unreadCount > 0 && (
                  <span className="bg-[#00b894] text-white text-xs px-2 py-1 rounded-full">
                    {account.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex-1 overflow-hidden">
          <div className="flex border-b border-[#3a3d45]">
            {[
              { id: 'inbox', label: 'Bandeja de entrada', icon: EnvelopeIcon, count: totalUnread },
              { id: 'starred', label: 'Destacados', icon: StarIcon, count: emails.filter(e => e.isStarred).length },
              { id: 'sent', label: 'Enviados', icon: FolderIcon, count: 0 },
              { id: 'drafts', label: 'Borradores', icon: FolderIcon, count: 0 },
              { id: 'trash', label: 'Papelera', icon: FolderIcon, count: 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 text-sm font-medium transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'text-[#00b894] border-b-2 border-[#00b894]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Barra de búsqueda */}
          <div className="p-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
              />
            </div>
          </div>

          {/* Lista de emails */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <EnvelopeIcon className="w-12 h-12 mb-4" />
                <p className="text-center">No se encontraron emails</p>
                <p className="text-sm text-gray-500">Intenta con otros filtros o busca algo diferente</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => handleEmailClick(email)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedEmail?.id === email.id
                        ? 'bg-[#00b894] bg-opacity-20 border border-[#00b894]'
                        : email.isRead
                        ? 'hover:bg-[#2a2d35]'
                        : 'bg-[#2a2d35] hover:bg-[#3a3d45]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${email.isRead ? 'bg-gray-500' : 'bg-[#00b894]'}`}></span>
                        <span className={`font-medium text-sm ${email.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {email.from}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
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
                        <span className="text-xs text-gray-500">{email.date}</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h4 className={`font-medium text-sm mb-1 ${email.isRead ? 'text-gray-300' : 'text-white'}`}>
                        {email.subject}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{email.preview}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{email.account}</span>
                      <div className="flex space-x-1">
                        {email.labels.map(label => (
                          <span
                            key={label}
                            className="text-xs bg-[#3a3d45] text-gray-300 px-2 py-1 rounded-full"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho - Vista previa del email */}
      <div className="flex-1 bg-[#0f1419] flex flex-col">
        {selectedEmail ? (
          <>
            {/* Header del email */}
            <div className="p-6 border-b border-[#3a3d45]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{selectedEmail.subject}</h1>
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-white transition-colors duration-200">
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors duration-200">
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors duration-200">
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#00b894] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedEmail.from}</p>
                    <p className="text-gray-400 text-sm">{selectedEmail.date}</p>
                  </div>
                </div>
                                 <div className="flex items-center space-x-2">
                   <button 
                     onClick={() => handleReply(selectedEmail)}
                     className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg transition-colors duration-200"
                   >
                     Responder
                   </button>
                   <button className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-4 py-2 rounded-lg transition-colors duration-200">
                     Reenviar
                   </button>
                 </div>
              </div>
            </div>

            {/* Contenido del email */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-[#1a1d23] rounded-lg p-6 border border-[#3a3d45]">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {selectedEmail.preview}
                  </p>
                  <p className="text-gray-300 leading-relaxed mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p className="text-gray-300 leading-relaxed mt-4">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Estado vacío cuando no hay email seleccionado */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <EnvelopeIcon className="w-24 h-24 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-medium mb-2">Selecciona un email</h3>
              <p className="text-gray-500">Elige un email de la lista para ver su contenido</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gestión de cuentas */}
      {showAccountSelector && (
        <EmailAccountManager
          accounts={accounts}
          onAccountsChange={setAccounts}
          onClose={() => setShowAccountSelector(false)}
        />
      )}

      {/* Modal de composición de email */}
      {isComposing && (
        <EmailComposer
          isOpen={isComposing}
          onClose={() => {
            setIsComposing(false);
            setReplyToEmail(null);
          }}
          replyTo={replyToEmail ? {
            to: replyToEmail.from,
            subject: replyToEmail.subject,
            content: replyToEmail.preview
          } : undefined}
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}
