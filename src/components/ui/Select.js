'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, X, CheckSquare, Square } from 'lucide-react';

/**
 * Reusable Searchable Select Dropdown with React Portal
 * Fixes overflow clipping, card stacking context, and multi-filter issues.
 */
export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  icon: Icon,
  placeholder = 'Select an option',
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  required = false,
  id,
  name,
  size = 'md',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0, width: 200 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Normalize options format to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined && opt.label !== null ? String(opt.label) : String(opt.value ?? '')
      };
    }
    return { value: opt, label: String(opt ?? '') };
  });

  // Normalize selected values for single vs multiple
  const selectedValues = multiple
    ? (Array.isArray(value) ? value.map(String) : (value && value !== 'all' ? [String(value)] : []))
    : [];

  const selectedOptions = multiple
    ? normalizedOptions.filter(opt => selectedValues.includes(String(opt.value)))
    : [];

  const selectedOption = !multiple
    ? normalizedOptions.find((opt) => String(opt.value) === String(value)) || null
    : null;

  const isDefaultValue = multiple
    ? selectedValues.length === 0
    : (!value || String(value) === 'all' || String(value) === '');
    
  const isCustomSelected = multiple ? selectedValues.length > 0 : (selectedOption && !isDefaultValue);

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      const optionsHeight = Math.min(normalizedOptions.length * 36, 220);
      const searchHeight = searchable ? 44 : 0;
      const padding = 16;
      const estimatedHeight = optionsHeight + searchHeight + padding;
      
      let top = rect.bottom + 6;
      if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
        top = rect.top - estimatedHeight - 6;
      }

      setMenuCoords({
        top: Math.max(8, top),
        left: rect.left,
        width: Math.max(rect.width, 220)
      });
    }
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      calculateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target)
      ) {
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

  // Keep coordinates accurate on scroll/resize
  useEffect(() => {
    if (isOpen) {
      calculateCoords();
      window.addEventListener('scroll', calculateCoords, true);
      window.addEventListener('resize', calculateCoords);
    }

    return () => {
      window.removeEventListener('scroll', calculateCoords, true);
      window.removeEventListener('resize', calculateCoords);
    };
  }, [isOpen, normalizedOptions.length, searchable]);

  const handleSelectOption = (optValue) => {
    if (disabled) return;
    if (multiple) {
      const valStr = String(optValue);
      let newValues;
      if (selectedValues.includes(valStr)) {
        newValues = selectedValues.filter(v => v !== valStr);
      } else {
        newValues = [...selectedValues, valStr];
      }
      if (onChange) {
        onChange(newValues);
      }
    } else {
      if (onChange) {
        onChange(optValue);
      }
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange(multiple ? [] : '');
    }
  };

  return (
    <div className={`space-y-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={`w-full bg-slate-950/80 border ${
          error 
            ? 'border-rose-500 ring-1 ring-rose-500/20' 
            : isOpen 
              ? 'border-primary-500 ring-2 ring-primary-500/20' 
              : 'border-slate-800 hover:border-slate-700'
        } rounded-xl ${size === 'sm' ? 'py-1.5 min-h-[36px]' : 'py-2 min-h-[40px]'} ${
          Icon ? 'pl-9' : 'pl-3.5'
        } pr-8 text-xs sm:text-sm text-left transition-all duration-150 ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : 'cursor-pointer'
        } flex items-center justify-between shadow-xs relative ${triggerClassName}`}
      >
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Icon size={14} />
          </span>
        )}

        {/* Display Single Selected Label or Placeholder */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-[calc(100%-24px)] py-0.5">
          <span className={`block truncate ${selectedOption ? 'text-slate-100 font-medium' : 'text-slate-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1 pointer-events-none">
          {clearable && isCustomSelected && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer pointer-events-auto flex items-center justify-center"
              title="Clear selection"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-400' : ''}`} />
        </span>
      </button>

      {/* Floating Searchable Dropdown Menu with React Portal */}
      {isOpen && mounted && menuCoords.top > 0 && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownMenuRef}
          style={{
            position: 'fixed',
            top: `${menuCoords.top}px`,
            left: `${menuCoords.left}px`,
            width: `${menuCoords.width}px`,
            zIndex: 99999
          }}
          className={`bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-in fade-in duration-100 ${dropdownClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Box inside dropdown */}
          {searchable && (
            <div className="relative p-1 border-b border-slate-800">
              <Search size={13} className="absolute left-3 top-3 text-slate-400" />
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

          {/* Scrollable Option List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 p-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-2 text-center text-xs text-slate-500 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-600/25'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={14} className="shrink-0 ml-2 text-white" />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
}
