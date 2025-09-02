'use client';

import { useState, useRef } from 'react';
import { PaperClipIcon, XMarkIcon, PaperAirplaneIcon, DocumentArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    to: string;
    subject: string;
    content: string;
  };
  onSend: (email: EmailData) => void;
}

interface EmailData {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  content: string;
  attachments: File[];
}

export default function EmailComposer({ isOpen, onClose, replyTo, onSend }: EmailComposerProps) {
  const [emailData, setEmailData] = useState<EmailData>({
    to: replyTo?.to || '',
    cc: '',
    bcc: '',
    subject: replyTo?.subject ? `Re: ${replyTo.subject}` : '',
    content: replyTo?.content ? `\n\n--- Mensaje original ---\n${replyTo.content}` : '',
    attachments: []
  });
  
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d23] rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3d45]">
          <h3 className="text-lg font-medium text-white">
            {replyTo ? 'Responder Email' : 'Nuevo Email'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Campo Para */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Para: <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              placeholder="destinatario@ejemplo.com"
              className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
            />
          </div>

          {/* Campo CC */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                CC:
              </label>
              <button
                type="button"
                onClick={() => setShowCc(!showCc)}
                className="text-[#00b894] hover:text-[#00a085] text-sm"
              >
                {showCc ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showCc && (
              <input
                type="email"
                value={emailData.cc}
                onChange={(e) => handleInputChange('cc', e.target.value)}
                placeholder="cc@ejemplo.com"
                className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
              />
            )}
          </div>

          {/* Campo BCC */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                BCC:
              </label>
              <button
                type="button"
                onClick={() => setShowBcc(!showBcc)}
                className="text-[#00b894] hover:text-[#00a085] text-sm"
              >
                {showBcc ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showBcc && (
              <input
                type="email"
                value={emailData.bcc}
                onChange={(e) => handleInputChange('bcc', e.target.value)}
                placeholder="bcc@ejemplo.com"
                className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
              />
            )}
          </div>

          {/* Campo Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Asunto: <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Asunto del email"
              className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent"
            />
          </div>

          {/* Adjuntos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Adjuntos:
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#00b894] hover:text-[#00a085] text-sm flex items-center space-x-1"
              >
                <PaperClipIcon className="w-4 h-4" />
                <span>Agregar archivo</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {emailData.attachments.length > 0 && (
              <div className="space-y-2">
                {emailData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#2a2d35] rounded-lg border border-[#3a3d45]"
                  >
                    <div className="flex items-center space-x-2">
                      <PaperClipIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
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

          {/* Contenido del email */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensaje: <span className="text-red-400">*</span>
            </label>
            <textarea
              value={emailData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows={12}
              className="w-full bg-[#2a2d35] border border-[#3a3d45] rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="flex items-center justify-between p-4 border-t border-[#3a3d45] bg-[#1a1d23]">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              className="bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Guardar borrador</span>
            </button>
            <button
              onClick={onClose}
              className="bg-[#3a3d45] hover:bg-[#4a4d55] text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSend}
              disabled={isSending || !emailData.to || !emailData.subject || !emailData.content.trim()}
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
