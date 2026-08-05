'use client';
import { useState, useEffect } from 'react';
import { Menu, Shield, Bell, CheckCircle } from 'lucide-react';
import { getAdminSessionAction } from '@/actions/authActions';

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
    <header className="h-20 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMobileMenuToggle} 
          className="md:hidden p-2 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield size={18} className="text-amber-500" /> Super Admin Portal
          </h2>
          <p className="text-xs text-slate-400">Master Control & School Management System</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
          <CheckCircle size={14} />
          <span>System Backend Active</span>
        </div>

        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
            SA
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-100">{adminUser?.name || 'Super Admin'}</p>
            <p className="text-[10px] text-slate-400">{adminUser?.email || 'admin@school.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
