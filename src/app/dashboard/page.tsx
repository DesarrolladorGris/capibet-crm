'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { productosServices } from '@/services/productosServices';
import { contactoServices } from '@/services/contactoServices';
import { supabaseService } from '@/services/supabaseService';
import { DollarSign, Users, MessageCircle, Package, User } from 'lucide-react';
import MetricsCard from './components/MetricsCard';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [productsCount, setProductsCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [internalMessagesCount, setInternalMessagesCount] = useState(0);
  const [loadingInternalMessages, setLoadingInternalMessages] = useState(false);
  const [totalVentas, setTotalVentas] = useState(0);
  const [loadingVentas, setLoadingVentas] = useState(false);

  // Función para cargar la cantidad de productos
  const loadProductsCount = async () => {
    setLoadingProducts(true);
    try {
      const response = await productosServices.getProductosCount();
      if (response.success && response.data !== undefined) {
        setProductsCount(response.data);
      }
    } catch (error) {
      console.error('Error loading products count:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Función para cargar la cantidad de contactos
  const loadContactsCount = async () => {
    setLoadingContacts(true);
    try {
      const response = await contactoServices.getContactosCount();
      if (response.success && response.data !== undefined) {
        setContactsCount(response.data);
      }
    } catch (error) {
      console.error('Error loading contacts count:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  // Función para cargar la cantidad de mensajes internos
  const loadInternalMessagesCount = async () => {
    setLoadingInternalMessages(true);
    try {
      const response = await fetch('https://dkrdphnnsgndrqmgdvxp.supabase.co/rest/v1/mensajes_internos?select=id', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrcmRwaG5uc2duZHJxbWdkdnhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIzMTQ0NSwiZXhwIjoyMDcxODA3NDQ1fQ.w9dE4zcpbfH3LUwx-XS-2GtqEo6mr7p2BJIcf77xMdg',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInternalMessagesCount(data.length);
      }
    } catch (error) {
      console.error('Error loading internal messages count:', error);
    } finally {
      setLoadingInternalMessages(false);
    }
  };

  // Función para cargar el total de ventas
  const loadTotalVentas = async () => {
    setLoadingVentas(true);
    try {
      const response = await supabaseService.getAllVentasFichasDigitales();
      if (response.success && response.data) {
        const total = response.data.reduce((sum, venta) => sum + venta.monto_compra, 0);
        setTotalVentas(total);
      }
    } catch (error) {
      console.error('Error loading total ventas:', error);
    } finally {
      setLoadingVentas(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      // Si es un usuario Cliente, redirigir a su página específica
      if (user.rol === 'Cliente') {
        router.push('/cliente');
        return;
      }
      
      // Cargar cantidad de productos, contactos, mensajes internos y total de ventas para usuarios no cliente
      loadProductsCount();
      loadContactsCount();
      loadInternalMessagesCount();
      loadTotalVentas();
    }
  }, [user, isLoading, router]);

  // Si es un cliente, no mostrar el dashboard normal
  if (user?.rol === 'Cliente') {
    return null;
  }
  return (
    <div className="flex-1 flex flex-col">
      {/* Header del Dashboard */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Page Title */}
            <h1 className="text-[var(--text-primary)] font-semibold text-2xl">Dashboard</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Action Buttons */}
            <button className="flex items-center space-x-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-2 rounded cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Actualizar</span>
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar"
                className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 pl-9 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] w-48"
              />
              <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[var(--bg-primary)] p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Ventas"
            value={loadingVentas ? "..." : `$${totalVentas.toLocaleString()}`}
            change=""
            changeType="positive"
            icon={<DollarSign className="w-6 h-6" />}
          />
          <MetricsCard
            title="Contactos"
            value={loadingContacts ? "..." : contactsCount.toString()}
            change=""
            changeType="positive"
            icon={<Users className="w-6 h-6" />}
          />
          <MetricsCard
            title="Mensajes Internos"
            value={loadingInternalMessages ? "..." : internalMessagesCount.toString()}
            change=""
            changeType="positive"
            icon={<MessageCircle className="w-6 h-6" />}
          />
          <MetricsCard
            title="Productos"
            value={loadingProducts ? "..." : productsCount.toString()}
            change=""
            changeType="positive"
            icon={<Package className="w-6 h-6" />}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6">
          <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[var(--text-primary)] text-sm">Nuevo contacto agregado: <span className="font-medium">Juan Pérez</span></p>
                <p className="text-[var(--text-muted)] text-xs">Hace 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                <MessageCircle className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[var(--text-primary)] text-sm">Nuevo chat iniciado con <span className="font-medium">María García</span></p>
                <p className="text-[var(--text-muted)] text-xs">Hace 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="w-10 h-10 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                <DollarSign className="text-white w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[var(--text-primary)] text-sm">Venta completada: <span className="font-medium">$2,500</span></p>
                <p className="text-[var(--text-muted)] text-xs">Hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
