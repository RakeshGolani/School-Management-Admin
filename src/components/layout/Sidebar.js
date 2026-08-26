'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { 
  Activity, 
  LogOut, 
  Shield, 
  School,
  GraduationCap,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Receipt,
  Radio,
  Settings,
  Layers
} from 'lucide-react';
import { adminLogoutAction } from '@/actions/authActions';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Styled popover label shown on hover when sidebar is collapsed
function CollapsedPopover({ label, children }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({});
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
    setVisible(true);
  };

  return (
    <div
      ref={triggerRef}
      className="w-full"
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: 'translateY(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1 duration-150"
        >
          {/* Arrow */}
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-slate-800" />
          {/* Label */}
          <div className="bg-slate-800 border border-slate-700/80 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap">
            {label}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


export default function Sidebar({ isCollapsed = false, onToggleSidebar, mobileOpen = false, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: Activity },
    { label: 'Schools Management', href: '/schools', icon: School },
    { label: 'Packages & Modules', href: '/packages', icon: Layers },
    { label: 'Students Management', href: '/students', icon: GraduationCap },
    { label: 'Transactions & Invoices', href: '/transactions', icon: Receipt },
    { label: 'Billing Settings', href: '/billing-settings', icon: CreditCard },
    { label: 'Socket.IO Live Logs', href: '/sockets', icon: Radio },
    { label: 'System Settings', href: '/settings', icon: Settings }
  ];

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isCollapsed;

    return (
      <div className="relative flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all duration-300">
        {/* Floating Toggle Button centered directly on the border line */}
        {!isMobile && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="absolute -right-3.5 top-[30px] z-40 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-primary-400 hover:bg-slate-700 hover:border-primary-500/50 flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 active:scale-90"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronsRight size={14} className="text-primary-400" /> : <ChevronsLeft size={14} />}
          </button>
        )}

        {/* Brand Header */}
        <div className={`h-[88px] shrink-0 min-h-[88px] flex items-center border-b border-slate-800 transition-all duration-300 ${
          collapsed ? 'justify-center px-2' : 'px-6'
        }`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 border border-primary-500/40 flex items-center justify-center shadow-lg shadow-primary-600/25 text-white font-bold shrink-0 relative">
              <Shield size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-slate-900"></span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden transition-all duration-300">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-black tracking-wider text-slate-100 whitespace-nowrap">Vidyadmin</h1>
                </div>
                <span className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider block">SuperAdmin Console</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'}`}>
          {!collapsed ? (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 whitespace-nowrap">
              Management
            </p>
          ) : (
            <div className="w-full flex justify-center mb-2">
              <span className="w-4 h-0.5 bg-slate-800 rounded-full"></span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            const linkEl = (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center rounded-xl transition-all duration-200 group w-full ${
                  collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-3'
                } ${
                  isActive
                    ? 'bg-primary-600/15 text-primary-400 border border-primary-500/30 shadow-md font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent hover:border-primary-500/30'
                }`}
              >
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
                  <Icon size={18} className={`shrink-0 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </div>
              </Link>
            );

            return collapsed ? (
              <CollapsedPopover key={item.label} label={item.label}>
                {linkEl}
              </CollapsedPopover>
            ) : linkEl;
          })}
        </nav>

        {/* Logout Footer */}
        <div className={`border-t border-slate-800 ${collapsed ? 'p-2' : 'p-4'}`}>
          {collapsed ? (
            <CollapsedPopover label="Sign Out">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`w-full flex items-center justify-center rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition duration-200 cursor-pointer p-3`}
              >
                <LogOut size={18} className="shrink-0" />
              </button>
            </CollapsedPopover>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition duration-200 cursor-pointer space-x-3 px-3.5 py-3`}
            >
              <LogOut size={18} className="shrink-0" />
              <span className="whitespace-nowrap">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block shrink-0 h-screen sticky top-0 z-50 transition-all duration-300 ease-in-out shadow-[4px_0_12px_0_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
          <div className="relative w-64 max-w-xs h-full z-10">
            {renderSidebarContent(true)}
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
    </>
  );
}
