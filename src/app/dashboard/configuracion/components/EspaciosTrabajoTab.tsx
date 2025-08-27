'use client';

import { useState } from 'react';

interface Workspace {
  id: string;
  name: string;
  icon: string;
  columns: WorkspaceColumn[];
}

interface WorkspaceColumn {
  id: string;
  name: string;
  count: number;
}

export default function EspaciosTrabajoTab() {
  const [workspaces] = useState<Workspace[]>([
    {
      id: 'ventas',
      name: 'Ventas',
      icon: '⚙️',
      columns: [
        { id: 'prospectos', name: 'Prospectos', count: 0 }
      ]
    }
  ]);

  const [selectedWorkspace, setSelectedWorkspace] = useState('ventas');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-medium">Espacios de trabajo</h3>
          <p className="text-gray-400 text-sm">Crear, editar y eliminar tus espacios de trabajo</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <span>🏗️</span>
            <span>Plantillas</span>
          </button>
          <button className="flex items-center space-x-2 bg-[#00b894] hover:bg-[#00a085] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <span>➕</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>
      
      {/* Lista de Espacios de Trabajo */}
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="mb-6">
          {/* Header del Workspace */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-white text-sm font-medium">{workspace.icon} {workspace.name}</span>
              <span className="text-gray-500">🏷️</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm transition-colors">
                <span>✏️</span>
                <span>Editar</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm transition-colors">
                <span>📄</span>
                <span>Eliminar</span>
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                🗑️
              </button>
            </div>
          </div>
          
          {/* Columnas del Workspace */}
          <div className="space-y-3">
            {workspace.columns.map((column) => (
              <div key={column.id} className="bg-[#2a2d35] border border-[#3a3d45] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-sm font-medium">{column.count}</span>
                    <span className="text-white text-sm font-medium">{column.name}</span>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-white text-xs transition-colors p-1">
                        ✏️
                      </button>
                      <button className="text-gray-400 hover:text-white text-xs transition-colors p-1">
                        📄
                      </button>
                      <button className="text-gray-400 hover:text-white text-xs transition-colors p-1">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <button className="text-[#00b894] hover:text-[#00a085] text-lg transition-colors">
                    ➕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Estado vacío si no hay workspaces */}
      {workspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">📂</div>
          <h4 className="text-white text-lg font-medium mb-2">No hay espacios de trabajo</h4>
          <p className="text-gray-400 text-sm mb-6">Crea tu primer espacio de trabajo para comenzar a organizar tus proyectos.</p>
          <button className="bg-[#00b894] hover:bg-[#00a085] text-white px-6 py-3 rounded-lg font-medium transition-colors">
            ➕ Crear espacio de trabajo
          </button>
        </div>
      )}
    </div>
  );
}
