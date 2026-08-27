'use client';
import React from 'react';

/**
 * Enterprise-Grade Professional Dynamic Theme Checkbox Component
 * Fully compatible with Vidyadmin Dark & Light inverted theme tokens
 */
export default function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  id,
  name,
  disabled = false,
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) {
  const checkboxId = id || name || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizeClasses = {
    sm: 'w-4 h-4 rounded-[5px]',
    md: 'w-5 h-5 rounded-md',
    lg: 'w-6 h-6 rounded-lg',
  }[size] || 'w-5 h-5 rounded-md';

  const iconSizes = {
    sm: 10,
    md: 13,
    lg: 16,
  }[size] || 13;

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || !onChange) return;
    onChange({
      target: {
        checked: !checked,
        name: name || id,
        type: 'checkbox'
      }
    });
  };

  return (
    <div 
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group transition-all duration-150 p-1 -ml-1 rounded-xl hover:bg-slate-800/50 ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="relative flex items-center shrink-0">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
          className="sr-only"
        />
        <div 
          className={`${sizeClasses} border-2 transition-all duration-200 flex items-center justify-center relative ${
            checked 
              ? 'bg-primary-600 border-primary-600 text-white scale-100 shadow-sm shadow-primary-500/25' 
              : 'bg-slate-950 border-slate-700 group-hover:border-primary-500 group-hover:scale-105'
          }`}
        >
          {checked && (
            <svg 
              className="text-white animate-scaleIn transition-transform" 
              style={{ width: iconSizes, height: iconSizes }}
              viewBox="0 0 14 14" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2.5 7.5L5.5 10.5L11.5 3.5" 
                stroke="currentColor" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
        </div>
      </div>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-primary-400 leading-tight transition-colors duration-150">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-400 mt-0.5 leading-normal transition-colors duration-150">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
