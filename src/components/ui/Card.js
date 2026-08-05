'use client';

export default function Card({ children, className = '', header, footer, ...props }) {
  return (
    <div
      className={`glass-panel rounded-2xl border border-slate-800 shadow-xl overflow-hidden ${className}`}
      {...props}
    >
      {header && (
        <div className="border-b border-slate-800 p-4 sm:p-5 bg-slate-900/50">
          {header}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-slate-800 p-4 sm:p-5 bg-slate-900/50">
          {footer}
        </div>
      )}
    </div>
  );
}
