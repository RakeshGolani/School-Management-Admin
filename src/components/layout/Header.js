'use client';
import { useState, useEffect } from 'react';
import { Menu, Shield, CheckCircle } from 'lucide-react';
import { getAdminSessionAction } from '@/actions/authActions';
import ProfileDropdown from '@/components/layout/ProfileDropdown';
import ThemeToggle from '@/components/layout/ThemeToggle';



export default function Header({ onMobileMenuToggle }) {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    getAdminSessionAction().then((session) => {
      if (session.authenticated && session.user) {
        setAdminUser(session.user);
      }
    });
  }, []);

  return (
    <header className="h-[88px] shrink-0 min-h-[88px] bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 backdrop-blur-lg transition-all duration-300 shadow-[0_4px_12px_0_rgba(0,0,0,0.07)]">
      <div className="flex items-center space-x-3.5">
        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={onMobileMenuToggle} 
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 transition cursor-pointer rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5 transition-all duration-300 hover:scale-105">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-tight leading-none">
              Super Admin Portal
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-1 leading-none">
              Master Control & School Management System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400 shadow-sm shadow-emerald-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Backend Active</span>
        </div>

        <ThemeToggle />
        <ProfileDropdown adminUser={adminUser} />

      </div>
    </header>
  );
}
