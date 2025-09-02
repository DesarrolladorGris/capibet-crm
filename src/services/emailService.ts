import { supabaseConfig } from '../config/supabase';

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  isConnected: boolean;
  unreadCount: number;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  imapSettings?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
  };
  smtpSettings?: {
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
  };
}

export interface Email {
  id: string;
  accountId: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  htmlContent?: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: EmailAttachment[];
  threadId?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export interface EmailDraft {
  id: string;
  accountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  attachments: EmailAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para las filas de la base de datos
interface EmailRow {
  id: string;
  account_id: string;
  message_id: string;
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  subject: string;
  content: string;
  html_content?: string;
  date: string;
  is_read: boolean;
  is_starred: boolean;
  labels: string[];
  attachments: EmailAttachment[];
  thread_id?: string;
}

class EmailService {
  private accounts: EmailAccount[] = [];
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Obtener todas las cuentas de email
  async getAccounts(): Promise<EmailAccount[]> {
    try {
      const response = await fetch(`${supabaseConfig.restUrl}/email_accounts?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.accounts = data || [];
      return this.accounts;
    } catch (error) {
      console.error('Error al obtener cuentas de email:', error);
      return [];
    }
  }

  // Agregar nueva cuenta de email
  async addAccount(account: Omit<EmailAccount, 'id'>): Promise<EmailAccount | null> {
    try {
      const response = await fetch(`${supabaseConfig.restUrl}/email_accounts`, {
        method: 'POST',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: account.name,
          email: account.email,
          provider: account.provider,
          is_connected: account.isConnected,
          unread_count: account.unreadCount,
          access_token: account.accessToken,
          refresh_token: account.refreshToken,
          expires_at: account.expiresAt,
          imap_settings: account.imapSettings,
          smtp_settings: account.smtpSettings
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newAccount: EmailAccount = {
        id: data.id,
        name: data.name,
        email: data.email,
        provider: data.provider,
        isConnected: data.is_connected,
        unreadCount: data.unread_count,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        imapSettings: data.imap_settings,
        smtpSettings: data.smtp_settings
      };

      this.accounts.push(newAccount);
      return newAccount;
    } catch (error) {
      console.error('Error al agregar cuenta de email:', error);
      return null;
    }
  }

  // Actualizar cuenta de email
  async updateAccount(accountId: string, updates: Partial<EmailAccount>): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.isConnected !== undefined) updateData.is_connected = updates.isConnected;
      if (updates.unreadCount !== undefined) updateData.unread_count = updates.unreadCount;
      if (updates.accessToken !== undefined) updateData.access_token = updates.accessToken;
      if (updates.refreshToken !== undefined) updateData.refresh_token = updates.refreshToken;
      if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
      if (updates.imapSettings !== undefined) updateData.imap_settings = updates.imapSettings;
      if (updates.smtpSettings !== undefined) updateData.smtp_settings = updates.smtpSettings;

      const response = await fetch(`${supabaseConfig.restUrl}/email_accounts?id=eq.${accountId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Actualizar en memoria
      const index = this.accounts.findIndex(acc => acc.id === accountId);
      if (index !== -1) {
        this.accounts[index] = { ...this.accounts[index], ...updates };
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar cuenta de email:', error);
      return false;
    }
  }

  // Eliminar cuenta de email
  async deleteAccount(accountId: string): Promise<boolean> {
    try {
      const response = await fetch(`${supabaseConfig.restUrl}/email_accounts?id=eq.${accountId}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Detener sincronización si está activa
      this.stopSync(accountId);

      // Remover de memoria
      this.accounts = this.accounts.filter(acc => acc.id !== accountId);

      return true;
    } catch (error) {
      console.error('Error al eliminar cuenta de email:', error);
      return false;
    }
  }

  // Conectar cuenta (OAuth)
  async connectAccount(accountId: string, provider: string): Promise<boolean> {
    try {
      let authUrl = '';
      
      switch (provider) {
        case 'gmail':
          authUrl = this.getGmailAuthUrl();
          break;
        case 'outlook':
          authUrl = this.getOutlookAuthUrl();
          break;
        case 'yahoo':
          authUrl = this.getYahooAuthUrl();
          break;
        default:
          throw new Error('Proveedor no soportado');
      }

      // Abrir ventana de autorización
      window.open(authUrl, 'oauth', 'width=500,height=600');
      
      // Aquí se implementaría la lógica para manejar el callback de OAuth
      // Por ahora solo simulamos la conexión exitosa
      
      await this.updateAccount(accountId, { isConnected: true });
      
      // Iniciar sincronización
      this.startSync(accountId);
      
      return true;
    } catch (error) {
      console.error('Error al conectar cuenta:', error);
      return false;
    }
  }

  // Desconectar cuenta
  async disconnectAccount(accountId: string): Promise<boolean> {
    try {
      // Detener sincronización
      this.stopSync(accountId);

      // Limpiar tokens
      await this.updateAccount(accountId, {
        isConnected: false,
        accessToken: undefined,
        refreshToken: undefined,
        expiresAt: undefined,
        unreadCount: 0
      });

      return true;
    } catch (error) {
      console.error('Error al desconectar cuenta:', error);
      return false;
    }
  }

  // Iniciar sincronización automática
  startSync(accountId: string): void {
    if (this.syncIntervals.has(accountId)) {
      return; // Ya está sincronizando
    }

    const interval = setInterval(async () => {
      await this.syncEmails(accountId);
    }, 5 * 60 * 1000); // Sincronizar cada 5 minutos

    this.syncIntervals.set(accountId, interval);
  }

  // Detener sincronización
  stopSync(accountId: string): void {
    const interval = this.syncIntervals.get(accountId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(accountId);
    }
  }

  // Sincronizar emails de una cuenta
  async syncEmails(accountId: string): Promise<void> {
    try {
      const account = this.accounts.find(acc => acc.id === accountId);
      if (!account || !account.isConnected) return;

      // Aquí se implementaría la lógica real de sincronización
      // usando las APIs de Gmail, Outlook, Yahoo o IMAP/SMTP
      
      console.log(`Sincronizando emails de ${account.email}...`);
      
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar contador de no leídos
      const newUnreadCount = Math.floor(Math.random() * 20);
      await this.updateAccount(accountId, { unreadCount: newUnreadCount });
      
    } catch (error) {
      console.error(`Error al sincronizar emails de cuenta ${accountId}:`, error);
    }
  }

  // Obtener emails de una cuenta
  async getEmails(accountId: string, options?: {
    limit?: number;
    offset?: number;
    folder?: string;
    search?: string;
  }): Promise<Email[]> {
    try {
      let url = `${supabaseConfig.restUrl}/emails?account_id=eq.${accountId}&order=date.desc`;
      
      if (options?.limit) {
        url += `&limit=${options.limit}`;
      }

      if (options?.offset) {
        url += `&offset=${options.offset}`;
      }

      if (options?.folder) {
        url += `&folder=eq.${options.folder}`;
      }

      if (options?.search) {
        url += `&or=(subject.ilike.*${options.search}*,content.ilike.*${options.search}*)`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data?.map((row: EmailRow) => ({
        id: row.id,
        accountId: row.account_id,
        messageId: row.message_id,
        from: row.from_email,
        to: row.to_emails,
        cc: row.cc_emails,
        bcc: row.bcc_emails,
        subject: row.subject,
        content: row.content,
        htmlContent: row.html_content,
        date: new Date(row.date),
        isRead: row.is_read,
        isStarred: row.is_starred,
        labels: row.labels || [],
        attachments: row.attachments || [],
        threadId: row.thread_id
      })) || [];

    } catch (error) {
      console.error('Error al obtener emails:', error);
      return [];
    }
  }

  // Enviar email
  async sendEmail(accountId: string, emailData: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    content: string;
    htmlContent?: string;
    attachments?: EmailAttachment[];
  }): Promise<boolean> {
    try {
      const account = this.accounts.find(acc => acc.id === accountId);
      if (!account || !account.isConnected) {
        throw new Error('Cuenta no conectada');
      }

      // Aquí se implementaría la lógica real de envío
      // usando SMTP o las APIs de los proveedores
      
      console.log('Enviando email:', emailData);

      // Simular envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error('Error al enviar email:', error);
      return false;
    }
  }

  // URLs de autorización OAuth
  private getGmailAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/gmail/callback`;
    const scope = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
  }

  private getOutlookAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/outlook/callback`;
    const scope = 'Mail.Read Mail.Send';
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&response_mode=query`;
  }

  private getYahooAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/yahoo/callback`;
    const scope = 'mail-r mail-w';
    
    return `https://api.login.yahoo.com/oauth2/request_auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  }
}

export const emailService = new EmailService();
