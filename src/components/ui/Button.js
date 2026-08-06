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
    primary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100',
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

