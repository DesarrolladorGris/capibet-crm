'use client';

import { useState } from 'react';

interface ConfiguracionVentas {
  moneda: string;
  impuestos: number;
  descuentos: boolean;
  notificaciones: boolean;
  autoBackup: boolean;
  tema: string;
}

export default function ConfiguracionTab() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionVentas>({
    moneda: 'USD',
    impuestos: 21,
    descuentos: true,
    notificaciones: true,
    autoBackup: true,
    tema: 'oscuro'
  });

  const [categorias, setCategorias] = useState<string[]>([
    'Software',
    'Servicios',
    'Desarrollo',
    'Marketing',
    'Consultoría'
  ]);

  const [nuevaCategoria, setNuevaCategoria] = useState('');

  const handleConfiguracionChange = (key: keyof ConfiguracionVentas, value: any) => {
    setConfiguracion(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const agregarCategoria = () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria.trim())) {
      setCategorias(prev => [...prev, nuevaCategoria.trim()]);
      setNuevaCategoria('');
    }
  };

  const eliminarCategoria = (categoria: string) => {
    setCategorias(prev => prev.filter(c => c !== categoria));
  };

  const guardarConfiguracion = () => {
    // Aquí se guardaría la configuración en el backend
    console.log('Configuración guardada:', configuracion);
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Configuración General */}
        <div className="bg-[#2a2d35] rounded-lg p-6 border border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold mb-4">Configuración General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moneda */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Moneda</label>
              <select 
                value={configuracion.moneda}
                onChange={(e) => handleConfiguracionChange('moneda', e.target.value)}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
              >
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="MXN">MXN - Peso Mexicano</option>
              </select>
            </div>

            {/* Impuestos */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Impuestos (%)</label>
              <input
                type="number"
                value={configuracion.impuestos}
                onChange={(e) => handleConfiguracionChange('impuestos', parseFloat(e.target.value))}
                className="w-full bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Funcionalidades */}
        <div className="bg-[#2a2d35] rounded-lg p-6 border border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold mb-4">Funcionalidades</h2>
          
          <div className="space-y-4">
            {/* Descuentos */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Habilitar Descuentos</h3>
                <p className="text-gray-400 text-sm">Permitir aplicar descuentos a las ventas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.descuentos}
                  onChange={(e) => handleConfiguracionChange('descuentos', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00b894] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b894]"></div>
              </label>
            </div>

            {/* Notificaciones */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Notificaciones</h3>
                <p className="text-gray-400 text-sm">Recibir notificaciones de nuevas ventas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.notificaciones}
                  onChange={(e) => handleConfiguracionChange('notificaciones', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00b894] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b894]"></div>
              </label>
            </div>

            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Respaldo Automático</h3>
                <p className="text-gray-400 text-sm">Crear respaldos automáticos de los datos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configuracion.autoBackup}
                  onChange={(e) => handleConfiguracionChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00b894] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00b894]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Gestión de Categorías */}
        <div className="bg-[#2a2d35] rounded-lg p-6 border border-[#3a3d45]">
          <h2 className="text-white text-lg font-semibold mb-4">Categorías de Productos</h2>
          
          {/* Agregar Nueva Categoría */}
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 bg-[#1a1d23] border border-[#3a3d45] rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b894] focus:border-[#00b894]"
            />
            <button
              onClick={agregarCategoria}
              className="bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Agregar
            </button>
          </div>

          {/* Lista de Categorías */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categorias.map((categoria, index) => (
              <div key={index} className="flex items-center justify-between bg-[#1a1d23] rounded-lg p-3 border border-[#3a3d45]">
                <span className="text-white text-sm">{categoria}</span>
                <button
                  onClick={() => eliminarCategoria(categoria)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Eliminar categoría"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            onClick={guardarConfiguracion}
            className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
