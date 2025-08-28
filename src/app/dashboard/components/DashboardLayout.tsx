'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  userRole: string;
  agencyName: string;
  onLogout: () => void;
}

export default function DashboardLayout({ children, userEmail, userName, userRole, agencyName, onLogout }: DashboardLayoutProps) {
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
          userName={userName}
          userRole={userRole}
          agencyName={agencyName}
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
