'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function ClientLayout({ initialCollapsed = false, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('sidebar_collapsed', String(nextState));
      document.cookie = `sidebar_collapsed=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
      return nextState;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar 
        isCollapsed={isCollapsed}
        onToggleSidebar={handleToggleSidebar}
        mobileOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300">
        <Header 
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
