'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
  value,
  onChange,
  options = [],
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  label,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Normalise options format to objects: { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: String(opt) };
  });

  // Find active option label
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const [openUpwards, setOpenUpwards] = useState(false);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically position dropdown upwards if space below is limited
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 220 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    if (disabled) return;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${isOpen ? 'relative z-[100]' : 'relative z-10'} ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-amber-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center justify-between w-full bg-slate-800/80 border text-slate-100 rounded-xl text-sm py-1.5 px-3 transition-all duration-200 focus:outline-none cursor-pointer ${
            error 
              ? 'border-rose-500 focus:border-rose-500' 
              : 'border-slate-700 hover:border-slate-600 focus:border-amber-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''} ${triggerClassName}`}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown 
            size={14} 
            className={`text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
              isOpen ? 'transform rotate-180 text-slate-200' : ''
            }`} 
          />
        </button>

        {/* Floating Options Dropdown */}
        {isOpen && (
          <div
            className={`absolute left-0 min-w-full w-max max-w-xs bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100 ${
              openUpwards 
                ? 'bottom-full mb-1 origin-bottom' 
                : 'top-full mt-1 origin-top'
            } ${dropdownClassName}`}
          >
            {normalizedOptions.length > 0 ? (
              normalizedOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between w-full px-3 py-1.5 text-left text-xs font-semibold transition duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={12} className="shrink-0 ml-1.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-1.5 text-xs text-slate-500 text-center font-medium">
                No options available
              </div>
            )}
          </div>
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
