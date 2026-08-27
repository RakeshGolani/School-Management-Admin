'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

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
  searchable = false,
  placeholder = 'Select option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalise options format to objects: { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return opt;
    }
    return { value: opt, label: String(opt) };
  });

  // Find active option label
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  const handleSelect = (val) => {
    if (disabled) return;
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`space-y-1.5 ${isOpen ? 'relative z-50' : 'relative z-10'} ${className}`} ref={selectRef}>
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
          className={`flex items-center justify-between w-full h-[42px] min-h-[42px] bg-slate-800/80 border text-slate-100 rounded-xl text-sm px-3.5 transition-all duration-150 focus:outline-none cursor-pointer ${
            error 
              ? 'border-rose-500 focus:border-rose-500' 
              : isOpen
                ? 'border-primary-500 ring-2 ring-primary-500/20'
                : 'border-slate-700 hover:border-slate-600 focus:border-primary-500'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''} ${triggerClassName}`}
        >
          <span className={`truncate ${selectedOption ? 'text-slate-100' : 'text-slate-500'}`}>
            {displayLabel}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
              isOpen ? 'transform rotate-180 text-primary-400' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu Anchored Right Underneath */}
        {isOpen && (
          <div
            className={`absolute left-0 top-full mt-1.5 w-full bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 space-y-1 z-[100] animate-fadeIn ${dropdownClassName}`}
          >
            {/* Search Input if searchable is true */}
            {searchable && (
              <div className="relative p-1 border-b border-slate-800">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-semibold transition duration-100 cursor-pointer ${
                        isSelected
                          ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-600/25'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check size={14} className="shrink-0 ml-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-slate-500 text-center font-medium">
                  No matching options
                </div>
              )}
            </div>
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
