'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isUserAuthenticated } from '@/utils/auth';
import { supabaseService, ProductoResponse } from '@/services/supabaseService';

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
  const [sales, setSales] = useState<Sale[]>(salesData);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabaseService.getProductos();
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

  useEffect(() => {
    if (!isUserAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Cargar productos cuando el componente se monta
    loadProducts();
  }, [router]);

  // Filtrar productos
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        response = await supabaseService.updateProducto(editingProduct.id, productData);
      } else {
        response = await supabaseService.createProducto(productData);
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
      const response = await supabaseService.deleteProducto(productToDelete.id);
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
                  onClick={() => setShowSaleModal(true)}
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
              {sales.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-[var(--text-muted)] text-lg mb-2">No hay ventas registradas</div>
                  <div className="text-[var(--text-muted)] text-sm">Comienza creando tu primera venta</div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-primary)]">
                  {/* Header de tabla */}
                  <div className="grid grid-cols-6 gap-4 p-4 text-[var(--text-muted)] text-sm font-medium">
                    <div>Cliente</div>
                    <div>Productos</div>
                    <div>Total</div>
                    <div>Estado</div>
                    <div>Fecha</div>
                    <div>Acciones</div>
                  </div>
                  
                  {/* Aquí irían las ventas */}
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
                ¿Estás seguro de que quieres eliminar el producto <strong>"{productToDelete.nombre}"</strong>?
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
    </div>
  );
}
