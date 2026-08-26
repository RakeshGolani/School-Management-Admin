'use client';
import { Loader2 } from 'lucide-react';

export default function Button({
  variant = 'primary',
  children,
  loading = false,
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer py-2.5 px-4 sm:px-5 whitespace-nowrap';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-md shadow-primary-600/25',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white font-bold shadow-md shadow-secondary-500/25',
    accent: 'bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold shadow-md shadow-accent-500/25',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 hover:border-primary-500/40',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin shrink-0" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          {Icon && <Icon size={18} className="shrink-0" />}
          {children}
        </span>
      )}
    </button>
  );
}

