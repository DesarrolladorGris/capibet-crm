'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, userEmail, onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#1a1d23] flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          userEmail={userEmail} 
          onLogout={onLogout}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="flex-1 flex">
          {children}
        </main>
      </div>
    </div>
  );
}
