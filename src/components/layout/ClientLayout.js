'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { encryptCookieKey } from '@/lib/cryptoHelper';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

import { BackendStatusProvider } from '@/context/BackendStatusContext';
import BackendOfflineScreen from '@/components/ui/BackendOfflineScreen';

export default function ClientLayout({ initialCollapsed = false, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('sidebar_collapsed', String(nextState));
      const encKey = encryptCookieKey('sidebar_collapsed');
      document.cookie = `${encKey}=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
      return nextState;
    });
  };

  const isPrintPage = pathname?.endsWith('/print');

  if (isPrintPage) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        {children}
      </div>
    );
  }

  return (
    <BackendStatusProvider>
      <BackendOfflineScreen />
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans print:block print:h-auto print:overflow-visible print:bg-white print:text-slate-900">
        <Sidebar 
          isCollapsed={isCollapsed}
          onToggleSidebar={handleToggleSidebar}
          mobileOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 print:h-auto print:overflow-visible print:block">
          <Header 
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0">
            <div className="max-w-7xl mx-auto print:max-w-none">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BackendStatusProvider>
  );
}

