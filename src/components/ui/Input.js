'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  className = '',
  disabled = false,
  id,
  name,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-amber-500">*</span>}
        </label>
      )}
      
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-slate-800/80 border text-slate-100 placeholder-slate-500 rounded-xl text-sm py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${
            isPassword ? 'pr-10' : 'pr-3.5'
          } ${
            error 
              ? 'border-rose-500 focus:border-rose-500' 
              : 'border-slate-700 hover:border-slate-600 focus:border-amber-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition focus:outline-none cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400 font-medium pl-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
}
