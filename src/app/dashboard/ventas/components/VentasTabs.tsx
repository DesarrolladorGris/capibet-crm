'use client';

import VentasTab from './VentasTab';
import ProductosTab from './ProductosTab';
import ConfiguracionTab from './ConfiguracionTab';

interface VentasTabsProps {
  activeTab: string;
}

export default function VentasTabs({ activeTab }: VentasTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'ventas':
        return <VentasTab />;
      case 'productos':
        return <ProductosTab />;
      case 'configuracion':
        return <ConfiguracionTab />;
      default:
        return <VentasTab />;
    }
  };

  return (
    <div className="h-full">
      {renderTabContent()}
    </div>
  );
}
