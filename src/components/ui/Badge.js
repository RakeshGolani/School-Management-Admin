'use client';

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
    secondary: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20',
    accent: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    success: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    warning: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-primary-500/10 text-primary-400 border-primary-500/20'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
