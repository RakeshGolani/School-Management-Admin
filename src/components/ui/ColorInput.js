'use client';

export default function ColorInput({
  label,
  value,
  onChange,
  id,
  required = false
}) {
  const handleHexChange = (e) => {
    const val = e.target.value;
    // Basic hex code validation to allow typing (e.g., starting with # and max 7 chars)
    if (val.startsWith('#') && val.length <= 7) {
      onChange(e);
    } else if (!val.startsWith('#') && val.length <= 6) {
      // Auto prepend hash if missing
      e.target.value = `#${val}`;
      onChange(e);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-amber-500">*</span>}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Color Swatch Picker */}
        <div className="relative w-11 h-11 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden shrink-0 hover:border-slate-600 transition cursor-pointer">
          <input
            id={id}
            type="color"
            value={value || '#14b8a6'}
            onChange={onChange}
            className="absolute inset-0 w-[150%] h-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer border-none p-0 outline-none"
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* Hex Text Field */}
        <input
          type="text"
          value={value || '#14b8a6'}
          onChange={handleHexChange}
          placeholder="#14b8a6"
          className="w-full bg-slate-800/80 border border-slate-700 hover:border-slate-600 focus:border-amber-500 text-slate-100 placeholder-slate-500 rounded-xl text-sm py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>
    </div>
  );
}
