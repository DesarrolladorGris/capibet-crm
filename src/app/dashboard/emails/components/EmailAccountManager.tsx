'use client';

import { useState } from 'react';
import { PlusIcon, TrashIcon, KeyIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  isConnected: boolean;
  unreadCount: number;
}

interface EmailAccountManagerProps {
  accounts: EmailAccount[];
  onAccountsChange: (accounts: EmailAccount[]) => void;
  onClose: () => void;
}

export default function EmailAccountManager({ accounts, onAccountsChange, onClose }: EmailAccountManagerProps) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    provider: 'gmail' as 'gmail' | 'outlook' | 'yahoo' | 'custom'
  });

  const handleAddAccount = () => {
    if (newAccount.name && newAccount.email) {
      const account: EmailAccount = {
        id: Date.now().toString(),
        name: newAccount.name,
        email: newAccount.email,
        provider: newAccount.provider,
        isConnected: false,
        unreadCount: 0
      };
      
      onAccountsChange([...accounts, account]);
      setNewAccount({ name: '', email: '', provider: 'gmail' });
      setIsAddingAccount(false);
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    onAccountsChange(accounts.filter(acc => acc.id !== accountId));
  };

  const handleConnectAccount = (accountId: string) => {
    // Aquí se implementaría la lógica de conexión real con OAuth
    onAccountsChange(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isConnected: true } : acc
    ));
  };

  const handleDisconnectAccount = (accountId: string) => {
    onAccountsChange(accounts.map(acc => 
      acc.id === accountId ? { ...acc, isConnected: false, unreadCount: 0 } : acc
    ));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return '📧';
      case 'outlook':
        return '📨';
      case 'yahoo':
        return '📬';
      case 'custom':
        return '⚙️';
      default:
        return '📧';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'bg-red-500';
      case 'outlook':
        return 'bg-blue-500';
      case 'yahoo':
        return 'bg-purple-500';
      case 'custom':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-white">Gestionar Cuentas de Email</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de cuentas existentes */}
        <div className="space-y-3 mb-6">
          {accounts.map(account => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-[#2a2d35] rounded-lg border border-[#3a3d45]"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${getProviderColor(account.provider)} rounded-full flex items-center justify-center text-white text-lg`}>
                  {getProviderIcon(account.provider)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{account.name}</h4>
                  <p className="text-gray-400 text-sm">{account.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      account.isConnected 
                        ? 'bg-[#00b894] text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {account.isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                    {account.isConnected && account.unreadCount > 0 && (
                      <span className="bg-[#00b894] text-white text-xs px-2 py-1 rounded-full">
                        {account.unreadCount} no leídos
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {account.isConnected ? (
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-2"
                    title="Desconectar cuenta"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectAccount(account.id)}
                    className="text-gray-400 hover:text-[#00b894] transition-colors duration-200 p-2"
                    title="Conectar cuenta"
                  >
                    <KeyIcon className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => handleRemoveAccount(account.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-2"
                  title="Eliminar cuenta"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Agregar nueva cuenta */}
        {!isAddingAccount ? (
          <button
            onClick={() => setIsAddingAccount(true)}
            className="w-full bg-[#00b894] hover:bg-[#00a085] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Agregar Nueva Cuenta</span>
          </button>
        ) : (
          <div className="bg-[#2a2d35] rounded-lg p-4 border border-[#3a3d45]">
            <h4 className="text-white font-medium mb-4">Nueva Cuenta de Email</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la cuenta
                </label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Ej: Cuenta Principal"
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dirección de email
                </label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Proveedor
                </label>
                <select
                  value={newAccount.provider}
                  onChange={(e) => setNewAccount({ ...newAccount, provider: e.target.value as 'gmail' | 'outlook' | 'yahoo' | 'custom' })}
                  className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="custom">Personalizado (IMAP/SMTP)</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddAccount}
                  disabled={!newAccount.name || !newAccount.email}
                  className="flex-1 bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <CheckIcon className="w-5 h-5 mr-2" />
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setIsAddingAccount(false);
                    setNewAccount({ name: '', email: '', provider: 'gmail' });
                  }}
                  className="flex-1 bg-[#3a3d45] hover:bg-[#4a4d55] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Información sobre conexión */}
        <div className="mt-6 p-4 bg-[#2a2d35] rounded-lg border border-[#3a3d45]">
          <h4 className="text-white font-medium mb-2">Información de Conexión</h4>
          <p className="text-gray-400 text-sm">
            Para conectar cuentas de Gmail, Outlook o Yahoo, se utilizará OAuth 2.0 para un acceso seguro. 
            Las cuentas personalizadas requerirán configuración manual de servidores IMAP/SMTP.
          </p>
        </div>
      </div>
    </div>
  );
}
