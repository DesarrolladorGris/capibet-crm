'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
  agencyName: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, userName, userRole, agencyName, onLogout }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a1d23] flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header 
          userName={userName}
          userRole={userRole}
          agencyName={agencyName}
          onLogout={onLogout}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="flex-1 flex overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
