'use client';

import { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, PaperAirplaneIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  isConnected: boolean;
}

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: EmailAccount[];
  replyTo?: {
    to: string;
    subject: string;
    content: string;
  };
  onSend: (email: EmailData) => void;
}

interface EmailData {
  fromAccountId: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  attachments: File[];
}

export default function EmailComposer({ isOpen, onClose, accounts, replyTo, onSend }: EmailComposerProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    fromAccountId: accounts.length > 0 ? accounts[0].id : '',
    to: replyTo?.to || '',
    cc: '',
    bcc: '',
    subject: replyTo?.subject ? `Re: ${replyTo.subject}` : '',
    content: replyTo?.content ? `\n\n--- Mensaje original ---\n${replyTo.content}` : '',
    attachments: []
  });
  
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrar solo cuentas conectadas
  const connectedAccounts = accounts.filter(account => account.isConnected);

  const handleInputChange = (field: keyof EmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSend = async () => {
    if (!emailData.fromAccountId) {
      alert('Debes seleccionar una cuenta para enviar el email');
      return;
    }
    
    if (!emailData.to || !emailData.subject || !emailData.content.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSending(true);
    try {
      await onSend(emailData);
      onClose();
      // Reset form
      setEmailData({
        fromAccountId: accounts.length > 0 ? accounts[0].id : '',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: '',
        attachments: []
      });
    } catch (error) {
      console.error('Error al enviar email:', error);
      alert('Error al enviar el email. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = () => {
    // Aquí se implementaría la lógica para guardar borrador
    console.log('Guardando borrador:', emailData);
    alert('Borrador guardado');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] border border-[#3a3d45] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3d45] bg-[#2a2d35]">
          <h2 className="text-white text-lg font-semibold">
            {replyTo ? 'Responder Email' : 'Nuevo Email'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Selector de cuenta remitente */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enviar desde: <span className="text-red-400">*</span>
            </label>
            <select 
              value={emailData.fromAccountId}
              onChange={(e) => handleInputChange('fromAccountId', e.target.value)}
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00b894] transition-colors duration-200"
              required
            >
              <option value="">Selecciona una cuenta</option>
              {connectedAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email}) - {account.provider}
                </option>
              ))}
            </select>
            {connectedAccounts.length === 0 && (
              <p className="text-red-400 text-sm mt-1">
                No hay cuentas conectadas. Primero debes conectar una cuenta de email.
              </p>
            )}
          </div>

          {/* Campo Para */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Para: <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="destinatario@ejemplo.com"
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200"
              required
            />
          </div>

          {/* Campo CC */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CC:
            </label>
            <input
              type="email"
              value={emailData.cc}
              onChange={(e) => handleInputChange('cc', e.target.value)}
              placeholder="copia@ejemplo.com"
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200"
            />
          </div>

          {/* Campo BCC */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              BCC:
            </label>
            <input
              type="email"
              value={emailData.bcc}
              onChange={(e) => handleInputChange('bcc', e.target.value)}
              placeholder="copiaoculta@ejemplo.com"
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200"
            />
          </div>

          {/* Campo Asunto */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Asunto: <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Asunto del email"
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200"
              required
            />
          </div>

          {/* Campo Contenido */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensaje: <span className="text-red-400">*</span>
            </label>
            <textarea
              value={emailData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={8}
              className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00b894] transition-colors duration-200 resize-vertical"
              required
            />
          </div>

          {/* Adjuntos */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Adjuntos:
            </label>
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#2a2d35] hover:bg-[#3a3d45] text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <PaperClipIcon className="w-4 h-4" />
                <span>Agregar archivos</span>
              </button>
            </div>
            
            {/* Lista de archivos adjuntos */}
            {emailData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {emailData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-[#2a2d35] rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-white text-sm">{file.name}</span>
                      <span className="text-gray-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="flex items-center justify-between p-4 border-t border-[#3a3d45] bg-[#2a2d35]">
          <button
            onClick={handleSaveDraft}
            className="bg-[#1a1d23] hover:bg-[#3a3d45] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Guardar borrador</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="bg-[#1a1d23] hover:bg-[#3a3d45] text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !emailData.fromAccountId || !emailData.to || !emailData.subject || !emailData.content.trim()}
              className="bg-[#00b894] hover:bg-[#00a085] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{isSending ? 'Enviando...' : 'Enviar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
