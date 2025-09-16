'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/utils/auth';
import { supabaseService, VentaFichasDigitales, VentaFichasDigitalesData } from '@/services/supabaseService';
import { productosServices } from '@/services/productosServices';
import { ProductResponse } from '@/app/api/productos/domain/producto';
import { userServices } from '@/services/userServices';
import { UsuarioResponse } from '@/app/api/usuarios/domain/usuario';

// Tipos para productos (adaptado para la UI)
interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  cantidadIzquierda: number;
  moneda: 'USD' | 'ARS';
  imagen?: string;
  creador: string;
  fechaCreacion: string;
}

// Tipos para ventas
interface Sale {
  id: number;
  cliente: string;
  productos: Array<{
    producto: Product;
    cantidad: number;
    precioUnitario: number;
  }>;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  metodoPago?: string;
}

// Datos de ejemplo para ventas
const salesData: Sale[] = [];

// Función para convertir ProductoResponse a Product
const convertProductoToProduct = (producto: ProductoResponse): Product => {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio,
    cantidad: producto.cantidad,
    cantidadIzquierda: producto.cantidad, // Asumiendo que cantidadIzquierda es igual a cantidad inicialmente
    moneda: producto.moneda === 'PESO' ? 'ARS' : 'USD',
    imagen: undefined, // No hay imagen en la respuesta de Supabase
    creador: `Usuario ${producto.creado_por}`, // Convertir ID a nombre de usuario
    fechaCreacion: producto.created_at
  };
};

// Función para convertir Product a ProductoData
const convertProductToProductoData = (product: Partial<Product>, userId: number) => {
  return {
    nombre: product.nombre || '',
    descripcion: product.descripcion || '',
    precio: product.precio || 0,
    cantidad: product.cantidad || 0,
    moneda: product.moneda === 'ARS' ? 'PESO' : 'DOLAR',
    creado_por: userId
  };
};

export default function VentasPage() {
  const [activeTab, setActiveTab] = useState<'ventas' | 'productos'>('ventas');
  const [products, setProducts] = useState<Product[]>([]);
  const [ventas, setVentas] = useState<VentaFichasDigitales[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResponse[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteVentaModal, setShowDeleteVentaModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState<VentaFichasDigitales | null>(null);
  const [ventaToDelete, setVentaToDelete] = useState<VentaFichasDigitales | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state para producto
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
    cantidadIzquierda: '',
    moneda: 'USD'
  });

  // Form state para venta
  const [ventaForm, setVentaForm] = useState({
    cliente_id: '',
    vendedor_id: '',
    monto_compra: '',
    fichas_otorgadas: '',
    valor_ficha: '',
    metodo_pago: 'EFECTIVO' as 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA' | 'CRIPTO',
    codigo_venta: ''
  });

  // Cargar productos desde la API del proyecto
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productosServices.getAllProductos();
      if (response.success && response.data) {
        const convertedProducts = response.data.map(convertProductoToProduct);
        setProducts(convertedProducts);
      } else {
        setError(response.error || 'Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión al cargar productos');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar ventas de fichas digitales desde Supabase
  const loadVentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabaseService.getAllVentasFichasDigitales();
      if (response.success && response.data) {
        setVentas(response.data);
      } else {
        setError(response.error || 'Error al cargar ventas');
      }
    } catch (err) {
      setError('Error de conexión al cargar ventas');
      console.error('Error loading ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios desde Supabase
  const loadUsuarios = async () => {
    try {
      const response = await userServices.getAllUsuarios();
      if (response.success && response.data) {
        setUsuarios(response.data);
      }
    } catch (err) {
      console.error('Error loading usuarios:', err);
    }
  };

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar productos cuando el componente se monta
    loadProducts();
    // Cargar ventas cuando el componente se monta
    loadVentas();
    // Cargar usuarios cuando el componente se monta
    loadUsuarios();
  }, [router]);

  // Calcular monto automáticamente cuando cambien las fichas o el valor por ficha
  useEffect(() => {
    if (ventaForm.fichas_otorgadas && ventaForm.valor_ficha) {
      const montoCalculado = calculateMontoCompra(ventaForm.fichas_otorgadas, ventaForm.valor_ficha);
      setVentaForm(prev => ({ ...prev, monto_compra: montoCalculado }));
    }
  }, [ventaForm.fichas_otorgadas, ventaForm.valor_ficha]);

  // Filtrar productos
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar ventas
  const filteredVentas = ventas.filter(venta =>
    venta.codigo_venta.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venta.metodo_pago.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClienteEmail(venta.cliente_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrar usuarios por rol
  const clientes = usuarios.filter(usuario => usuario.rol === 'Cliente');
  const vendedores = usuarios.filter(usuario => usuario.rol !== 'Cliente');

  // Abrir modal para nueva venta
  const openNewVentaModal = () => {
    setEditingVenta(null);
    setVentaForm({
      cliente_id: '',
      vendedor_id: '',
      monto_compra: '',
      fichas_otorgadas: '',
      valor_ficha: '',
      metodo_pago: 'EFECTIVO',
      codigo_venta: ''
    });
    setShowSaleModal(true);
  };

  // Abrir modal para nuevo producto
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      nombre: '',
      descripcion: '',
      precio: '',
      cantidad: '',
      cantidadIzquierda: '',
      moneda: 'USD'
    });
    setShowProductModal(true);
  };

  // Abrir modal para editar producto
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      cantidad: product.cantidad.toString(),
      cantidadIzquierda: product.cantidadIzquierda.toString(),
      moneda: product.moneda
    });
    setShowProductModal(true);
  };

  // Editar venta
  const handleEditVenta = (venta: VentaFichasDigitales) => {
    setEditingVenta(venta);
    setVentaForm({
      cliente_id: venta.cliente_id.toString(),
      vendedor_id: venta.vendedor_id.toString(),
      monto_compra: venta.monto_compra.toString(),
      fichas_otorgadas: venta.fichas_otorgadas.toString(),
      valor_ficha: venta.valor_ficha.toString(),
      metodo_pago: venta.metodo_pago,
      codigo_venta: venta.codigo_venta
    });
    setShowSaleModal(true);
  };

  // Eliminar venta
  const handleDeleteVenta = (venta: VentaFichasDigitales) => {
    setVentaToDelete(venta);
    setShowDeleteVentaModal(true);
  };

  // Confirmar eliminación de venta
  const confirmDeleteVenta = async () => {
    if (!ventaToDelete) return;

    setLoading(true);
    setError(null);

    try {
      const response = await supabaseService.deleteVentaFichasDigitales(ventaToDelete.id);
      if (response.success) {
        // Recargar la lista de ventas
        await loadVentas();
        setShowDeleteVentaModal(false);
        setVentaToDelete(null);
      } else {
        setError(response.error || 'Error al eliminar venta');
      }
    } catch (err) {
      setError('Error de conexión al eliminar venta');
      console.error('Error deleting venta:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar venta
  const handleSaveVenta = async () => {
    if (!ventaForm.cliente_id || !ventaForm.vendedor_id || !ventaForm.fichas_otorgadas || !ventaForm.valor_ficha) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Asegurar que el monto esté calculado
    if (!ventaForm.monto_compra) {
      const montoCalculado = calculateMontoCompra(ventaForm.fichas_otorgadas, ventaForm.valor_ficha);
      setVentaForm(prev => ({ ...prev, monto_compra: montoCalculado }));
    }

    setLoading(true);
    setError(null);

    try {
      // Generar código automático si no se proporciona uno
      let codigoVenta = ventaForm.codigo_venta;
      if (!codigoVenta || codigoVenta.trim() === '') {
        const fecha = new Date();
        const timestamp = fecha.getTime().toString().slice(-6); // Últimos 6 dígitos del timestamp
        codigoVenta = `V-${timestamp}`;
      }

      const ventaData: VentaFichasDigitalesData = {
        cliente_id: parseInt(ventaForm.cliente_id),
        vendedor_id: parseInt(ventaForm.vendedor_id),
        monto_compra: parseFloat(ventaForm.monto_compra),
        fichas_otorgadas: parseInt(ventaForm.fichas_otorgadas),
        valor_ficha: parseFloat(ventaForm.valor_ficha),
        metodo_pago: ventaForm.metodo_pago,
        codigo_venta: codigoVenta,
        estado: 'COMPLETADA'
      };

      let response;
      if (editingVenta) {
        // Actualizar venta existente
        response = await supabaseService.updateVentaFichasDigitales(editingVenta.id, ventaData);
      } else {
        // Crear nueva venta
        response = await supabaseService.createVentaFichasDigitales(ventaData);
      }

      if (response.success) {
        // Recargar ventas después de crear/actualizar
        await loadVentas();
        setShowSaleModal(false);
        setEditingVenta(null);
        setVentaForm({
          cliente_id: '',
          vendedor_id: '',
          monto_compra: '',
          fichas_otorgadas: '',
          valor_ficha: '',
          metodo_pago: 'EFECTIVO',
          codigo_venta: ''
        });
      } else {
        setError(response.error || (editingVenta ? 'Error al actualizar venta' : 'Error al crear venta'));
      }
    } catch (err) {
      setError('Error de conexión al crear venta');
      console.error('Error saving venta:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guardar producto
  const handleSaveProduct = async () => {
    if (!productForm.nombre || !productForm.precio) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productData = {
        nombre: productForm.nombre,
        descripcion: productForm.descripcion,
        precio: parseFloat(productForm.precio),
        cantidad: parseInt(productForm.cantidad) || 0,
        moneda: productForm.moneda === 'USD' ? 'DOLAR' : 'PESO',
        creado_por: 11 // Usando el ID del usuario como en el ejemplo
      };

      let response;
      if (editingProduct) {
        response = await productosServices.updateProductoById(editingProduct.id, productData);
      } else {
        response = await productosServices.createProducto(productData);
      }

      if (response.success) {
        // Recargar productos después de guardar
        await loadProducts();
        setShowProductModal(false);
        setProductForm({
          nombre: '',
          descripcion: '',
          precio: '',
          cantidad: '',
          cantidadIzquierda: '',
          moneda: 'USD'
        });
        setEditingProduct(null);
      } else {
        setError(response.error || 'Error al guardar producto');
      }
    } catch (err) {
      setError('Error de conexión al guardar producto');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de confirmación de eliminación
  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Eliminar producto
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await productosServices.deleteProducto(productToDelete.id);
      if (response.success) {
        // Recargar productos después de eliminar
        await loadProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        setError(response.error || 'Error al eliminar producto');
      }
    } catch (err) {
      setError('Error de conexión al eliminar producto');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };


  const formatPrice = (price: number, currency: 'USD' | 'ARS') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES');
    } catch {
      return '-';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'COMPLETADA':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDIENTE':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'CANCELADA':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return '💵';
      case 'DEBITO':
      case 'CREDITO':
        return '💳';
      case 'TRANSFERENCIA':
        return '🏦';
      case 'CRIPTO':
        return '₿';
      default:
        return '💰';
    }
  };

  const getClienteEmail = (clienteId: number) => {
    const cliente = usuarios.find(user => user.id === clienteId);
    return cliente ? cliente.correo_electronico : `Cliente #${clienteId}`;
  };

  // Función para calcular el monto automáticamente
  const calculateMontoCompra = (fichas: string, valorFicha: string) => {
    const fichasNum = parseFloat(fichas) || 0;
    const valorFichaNum = parseFloat(valorFicha) || 0;
    return (fichasNum * valorFichaNum).toFixed(2);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header de Ventas */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-2 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[var(--text-primary)] font-semibold text-2xl">Ventas</h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Espacio vacío para mantener el layout */}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-primary)] px-6">
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('ventas')}
            className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
              activeTab === 'ventas'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🛒</span>
            <span className="font-medium">Ventas</span>
          </button>

          <button
            onClick={() => setActiveTab('productos')}
            className={`flex items-center space-x-2 py-3 border-b-2 transition-colors ${
              activeTab === 'productos'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>📦</span>
            <span className="font-medium">Productos</span>
            <span className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-2 py-0.5 rounded text-xs">
              {products.length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 bg-[var(--bg-primary)] p-6">
        {/* Sección de Ventas */}
        {activeTab === 'ventas' && (
          <div>
            {/* Header de sección */}
            <div className="mb-6">
              <h2 className="text-[var(--text-primary)] font-semibold text-xl mb-2">Lista de Ventas</h2>
              <p className="text-[var(--text-muted)] text-sm">Gestiona todas tus ventas realizadas</p>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={openNewVentaModal}
                  className="flex items-center space-x-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nueva Venta</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ventas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 pl-9 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] w-64"
                />
                <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Lista de ventas */}
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="text-[var(--text-muted)] mb-4">Cargando ventas...</div>
                </div>
              ) : filteredVentas.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-[var(--text-muted)] text-lg mb-2">No hay ventas registradas</div>
                  <div className="text-[var(--text-muted)] text-sm">Comienza creando tu primera venta</div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-primary)]">
                  {/* Header de tabla */}
                  <div className="grid grid-cols-8 gap-4 p-4 text-[var(--text-muted)] text-sm font-medium">
                    <div>Código</div>
                    <div>Cliente</div>
                    <div>Monto</div>
                    <div>Fichas</div>
                    <div>Valor/Ficha</div>
                    <div>Método Pago</div>
                    <div>Fecha</div>
                    <div>Acciones</div>
                  </div>
                  
                  {/* Ventas */}
                  {filteredVentas.map((venta) => (
                    <div key={venta.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                      <div className="text-[var(--text-primary)] font-medium">{venta.codigo_venta}</div>
                      <div className="text-[var(--text-secondary)]">{getClienteEmail(venta.cliente_id)}</div>
                      <div className="text-[var(--text-primary)] font-medium">${venta.monto_compra}</div>
                      <div className="text-[var(--text-secondary)]">{venta.fichas_otorgadas}</div>
                      <div className="text-[var(--text-secondary)]">${venta.valor_ficha}</div>
                      <div className="flex items-center space-x-2">
                        <span>{getMetodoPagoIcon(venta.metodo_pago)}</span>
                        <span className="text-[var(--text-secondary)] text-sm">{venta.metodo_pago}</span>
                      </div>
                      <div className="text-[var(--text-secondary)] text-sm">
                        {formatDate(venta.fecha_venta)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditVenta(venta)}
                          className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] p-1 rounded transition-colors"
                          title="Editar venta"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVenta(venta)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                          title="Eliminar venta"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección de Productos */}
        {activeTab === 'productos' && (
          <div>
            {/* Header de sección */}
            <div className="mb-6">
              <div>
                <h2 className="text-[var(--text-primary)] font-semibold text-xl mb-2">Productos ({products.length})</h2>
                <p className="text-[var(--text-muted)] text-sm">Crear, editar y eliminar sus productos.</p>
              </div>
            </div>

            {/* Barra de acciones */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={openNewProductModal}
                className="flex items-center space-x-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                <span>+ Nuevo Producto</span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded px-3 py-2 pl-9 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] w-64"
                />
                <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Tabla de productos */}
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
              {/* Header de tabla */}
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-[var(--border-primary)] text-[var(--text-muted)] text-sm font-medium">
                <div>Nombre</div>
                <div>Descripción</div>
                <div>Cantidad</div>
                <div>Precio</div>
                <div>Acciones</div>
              </div>

              {/* Contenido de tabla */}
              {loading ? (
                <div className="p-12 text-center">
                  <div className="text-[var(--text-muted)] mb-4">Cargando productos...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-blue-400 text-center mb-4">No hay productos disponibles</div>
                  <div className="flex items-center justify-between text-[var(--text-muted)] text-sm">
                    <div className="flex items-center space-x-2">
                      <span>Items per page:</span>
                      <select className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-2 py-1">
                        <option>10</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>0-0 of 0</span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-[var(--text-muted)]">⟨⟨</button>
                        <button className="p-1 text-[var(--text-muted)]">⟨</button>
                        <button className="p-1 text-[var(--text-muted)]">⟩</button>
                        <button className="p-1 text-[var(--text-muted)]">⟩⟩</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-primary)]">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                      <div className="text-[var(--text-primary)] font-medium">{product.nombre}</div>
                      <div className="text-[var(--text-secondary)] text-sm truncate">{product.descripcion || '-'}</div>
                      <div className="text-[var(--text-secondary)] text-sm">
                        {product.cantidad}
                      </div>
                      <div className="text-[var(--text-primary)] font-medium">{formatPrice(product.precio, product.moneda)}</div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditProductModal(product)}
                          disabled={loading}
                          className="text-[var(--text-muted)] hover:text-blue-400 text-sm transition-colors disabled:opacity-50"
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          disabled={loading}
                          className="text-[var(--text-muted)] hover:text-red-400 text-sm transition-colors disabled:opacity-50"
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] w-full max-w-2xl mx-4">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h3 className="text-[var(--text-primary)] font-semibold">
                {editingProduct ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              <div className="space-y-6">
                {/* Campos principales en 2 columnas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Nombre</label>
                      <input
                        type="text"
                        value={productForm.nombre}
                        onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                        placeholder="Título"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                      />
                    </div>

                    {/* Precio */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Precio</label>
                      <input
                        type="number"
                        value={productForm.precio}
                        onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                        placeholder="Precio"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4">
                    {/* Moneda */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Moneda</label>
                      <select
                        value={productForm.moneda}
                        onChange={(e) => setProductForm({ ...productForm, moneda: e.target.value })}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                      >
                        <option value="USD">Dólares (USD)</option>
                        <option value="ARS">Pesos (ARS)</option>
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Cantidad</label>
                      <input
                        type="number"
                        value={productForm.cantidad}
                        onChange={(e) => setProductForm({ ...productForm, cantidad: e.target.value })}
                        placeholder="Cantidad disponible"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción - ancho completo */}
                <div>
                  <label className="block text-[var(--text-muted)] text-sm mb-2">Descripción</label>
                  <textarea
                    value={productForm.descripcion}
                    onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] resize-none"
                    rows={3}
                    placeholder="Descripción del producto"
                  />
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setShowProductModal(false)}
                disabled={loading}
                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={loading}
                className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Guardando...' : (editingProduct ? 'ACTUALIZAR PRODUCTO' : '+ CREAR PRODUCTO')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] w-full max-w-md mx-4">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h3 className="text-[var(--text-primary)] font-semibold">
                Confirmar Eliminación
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              <p className="text-[var(--text-primary)] mb-4">
                ¿Estás seguro de que quieres eliminar el producto <strong>&quot;{productToDelete.nombre}&quot;</strong>?
              </p>
              <p className="text-[var(--text-muted)] text-sm">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Eliminando...' : 'Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Venta */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] w-full max-w-2xl mx-4">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
              <h3 className="text-[var(--text-primary)] font-semibold">
                {editingVenta ? 'Editar Venta de Fichas Digitales' : 'Nueva Venta de Fichas Digitales'}
              </h3>
              <button 
                onClick={() => setShowSaleModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              <div className="space-y-6">
                {/* Campos principales en 2 columnas */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    {/* Cliente */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Cliente *</label>
                      <select
                        value={ventaForm.cliente_id}
                        onChange={(e) => setVentaForm({ ...ventaForm, cliente_id: e.target.value })}
                        disabled={editingVenta !== null}
                        className={`w-full border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10 ${editingVenta ? 'bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60' : 'bg-[var(--bg-primary)]'}`}
                        required
                      >
                        <option value="">Seleccionar Cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre_usuario} ({cliente.correo_electronico})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vendedor */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Vendedor *</label>
                      <select
                        value={ventaForm.vendedor_id}
                        onChange={(e) => setVentaForm({ ...ventaForm, vendedor_id: e.target.value })}
                        disabled={editingVenta !== null}
                        className={`w-full border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10 ${editingVenta ? 'bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60' : 'bg-[var(--bg-primary)]'}`}
                        required
                      >
                        <option value="">Seleccionar Vendedor</option>
                        {vendedores.map((vendedor) => (
                          <option key={vendedor.id} value={vendedor.id}>
                            {vendedor.nombre_usuario} ({vendedor.rol})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Código de Venta */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">
                        Código de Venta <span className="text-[var(--text-muted)]">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={ventaForm.codigo_venta}
                        onChange={(e) => setVentaForm({ ...ventaForm, codigo_venta: e.target.value })}
                        placeholder="Dejar vacío para generar automáticamente"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10"
                      />
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4">
                    {/* Monto de Compra */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Monto de Compra ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ventaForm.monto_compra}
                        readOnly
                        placeholder="Se calcula automáticamente"
                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] cursor-not-allowed opacity-75 h-10"
                      />
                    </div>

                    {/* Fichas Otorgadas */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Fichas Otorgadas *</label>
                      <input
                        type="number"
                        value={ventaForm.fichas_otorgadas}
                        onChange={(e) => setVentaForm({ ...ventaForm, fichas_otorgadas: e.target.value })}
                        placeholder="10"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10"
                        required
                      />
                    </div>

                    {/* Valor por Ficha */}
                    <div>
                      <label className="block text-[var(--text-muted)] text-sm mb-2">Valor por Ficha ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ventaForm.valor_ficha}
                        onChange={(e) => setVentaForm({ ...ventaForm, valor_ficha: e.target.value })}
                        placeholder="10.00"
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Pago - ancho completo */}
                <div>
                  <label className="block text-[var(--text-muted)] text-sm mb-2">Método de Pago *</label>
                  <select
                    value={ventaForm.metodo_pago}
                    onChange={(e) => setVentaForm({ ...ventaForm, metodo_pago: e.target.value as 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA' | 'CRIPTO' })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] h-10"
                    required
                  >
                    <option value="EFECTIVO">💵 Efectivo</option>
                    <option value="DEBITO">💳 Débito</option>
                    <option value="CREDITO">💳 Crédito</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="CRIPTO">₿ Criptomoneda</option>
                  </select>
                </div>

                {/* Resumen de la Venta */}
                {ventaForm.fichas_otorgadas && ventaForm.valor_ficha && (
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-primary)]">
                    <h4 className="text-[var(--text-primary)] font-medium mb-3">Resumen de la Venta</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Fichas:</span>
                        <span className="text-[var(--text-primary)] ml-2 font-medium">{ventaForm.fichas_otorgadas}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Valor/Ficha:</span>
                        <span className="text-[var(--text-primary)] ml-2 font-medium">${ventaForm.valor_ficha}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-[var(--border-primary)]">
                        <span className="text-[var(--text-muted)]">Total:</span>
                        <span className="text-[var(--text-primary)] ml-2 font-bold text-lg">${calculateMontoCompra(ventaForm.fichas_otorgadas, ventaForm.valor_ficha)}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-[var(--border-primary)]">
              <button
                onClick={() => setShowSaleModal(false)}
                disabled={loading}
                className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVenta}
                disabled={loading}
                className="px-4 py-2 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? (editingVenta ? 'Actualizando...' : 'Creando...') : (editingVenta ? 'ACTUALIZAR VENTA' : '+ CREAR VENTA')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación de Venta */}
      {showDeleteVentaModal && ventaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[var(--text-primary)] font-semibold">Confirmar Eliminación</h3>
                  <p className="text-[var(--text-muted)] text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-[var(--text-secondary)] mb-2">
                  ¿Estás seguro de que deseas eliminar la venta <span className="font-medium text-[var(--text-primary)]">{ventaToDelete.codigo_venta}</span>?
                </p>
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--text-muted)]">Cliente:</span>
                    <span className="text-[var(--text-secondary)]">{getClienteEmail(ventaToDelete.cliente_id)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[var(--text-muted)]">Monto:</span>
                    <span className="text-[var(--text-secondary)]">${ventaToDelete.monto_compra}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Fichas:</span>
                    <span className="text-[var(--text-secondary)]">{ventaToDelete.fichas_otorgadas}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteVentaModal(false)}
                  className="flex-1 px-4 py-2 text-[var(--text-secondary)] border border-[var(--border-primary)] rounded hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteVenta}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded transition-colors"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
