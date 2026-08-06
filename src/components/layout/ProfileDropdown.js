'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { adminLogoutAction } from '@/actions/authActions';
import ConfirmModal from '@/components/ui/ConfirmModal';


export default function ProfileDropdown({ adminUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await adminLogoutAction();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  // Get initials for avatar (e.g., "Super Admin" -> "SA")
  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 pl-3 border-l border-slate-800 hover:bg-slate-800/30 p-1.5 rounded-xl transition duration-200 cursor-pointer select-none text-left focus:outline-none"
      >
        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shadow-amber-500/10 shrink-0">
          {getInitials(adminUser?.name)}
        </div>
        <div className="hidden lg:block">
          <p className="text-xs font-bold text-slate-100 leading-tight">
            {adminUser?.name || 'Super Admin'}
          </p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
            {adminUser?.email || 'admin@school.com'}
          </p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 shrink-0 hidden sm:block ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                {getInitials(adminUser?.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100 truncate max-w-[160px]">
                  {adminUser?.name || 'Super Admin'}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[160px] mt-0.5">
                  {adminUser?.email || 'admin@school.com'}
                </p>
              </div>
            </div>
            {/* Role Badge */}
            <div className="mt-2.5 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg w-fit text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <Shield size={10} />
              <span>{adminUser?.role === 'super_admin' ? 'Super Admin' : 'Administrator'}</span>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-1.5 space-y-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition duration-150"
            >
              <User size={16} className="text-slate-400" />
              <span>My Profile</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/10 border border-transparent transition duration-150 cursor-pointer text-left"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to log out of your session? You will need to enter your credentials to log in again."
        type="warning"
        confirmText="Sign Out"
        cancelText="Cancel"
        loading={isLoggingOut}
      />
    </div>
  );
}
