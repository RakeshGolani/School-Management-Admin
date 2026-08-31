'use client';

export default function Card({ 
  title,
  subtitle,
  icon: Icon,
  action,
  header, 
  footer, 
  children, 
  className = '', 
  ...props 
}) {
  return (
    <div
      className={`p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-5 transition-all duration-300 ${className}`}
      {...props}
    >
      {header ? (
        <div className="border-b border-slate-800/80 pb-4 bg-transparent">
          {header}
        </div>
      ) : (title || Icon || action) ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
          <div className="flex items-center space-x-3.5 min-w-0">
            {Icon && (
              <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0 shadow-xs">
                <Icon size={20} />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-base font-extrabold text-slate-100 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0 flex items-center">{action}</div>}
        </div>
      ) : null}

      <div>{children}</div>

      {footer && (
        <div className="border-t border-slate-800/80 pt-4 bg-transparent">
          {footer}
        </div>
      )}
    </div>
  );
}

