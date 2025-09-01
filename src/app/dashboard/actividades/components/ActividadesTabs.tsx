'use client';

import { useState } from 'react';
import LlamadasTab from './LlamadasTab';
import ReunionesTab from './ReunionesTab';
import TareasTab from './TareasTab';
import CalendarioTab from './CalendarioTab';

export default function ActividadesTabs() {
  const [activeTab, setActiveTab] = useState('llamadas');

  const tabs = [
    { id: 'llamadas', label: '📞 Llamadas', icon: '📞' },
    { id: 'reuniones', label: '🤝 Reuniones', icon: '🤝' },
    { id: 'tareas', label: '✅ Tareas', icon: '✅' },
    { id: 'calendario', label: '📅 Calendario', icon: '📅' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'llamadas':
        return <LlamadasTab />;
      case 'reuniones':
        return <ReunionesTab />;
      case 'tareas':
        return <TareasTab />;
      case 'calendario':
        return <CalendarioTab />;
      default:
        return <LlamadasTab />;
    }
  };

  return (
    <div className="bg-[#2a2d35] rounded-lg p-6">
      {/* Tabs Navigation */}
      <div className="flex space-x-1 mb-6 bg-[#1a1d23] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#00b894] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-[#3a3d45]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}
