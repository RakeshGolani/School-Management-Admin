'use client';

import { useState } from 'react';
import { Check, Pipette, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Cobalt Blue', hex: '#0047AB' },
  { name: 'Royal Indigo', hex: '#4F46E5' },
  { name: 'Sapphire Blue', hex: '#0284C7' },
  { name: 'Ocean Cyan', hex: '#0891B2' },
  { name: 'Teal Emerald', hex: '#0D9488' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Sunset Orange', hex: '#EA580C' },
  { name: 'Rose Crimson', hex: '#E11D48' },
  { name: 'Vivid Violet', hex: '#7C3AED' },
  { name: 'Purple Plum', hex: '#9333EA' },
  { name: 'Dark Slate', hex: '#334155' }
];

export default function ColorInput({
  label,
  value = '#0047AB',
  onChange,
  id,
  required = false
}) {
  const currentColor = (value || '#0047AB').toUpperCase();

  const handleSelectPreset = (hex) => {
    if (onChange) {
      onChange({ target: { value: hex, id } });
    }
  };

  const handleHexInput = (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) {
      val = `#${val}`;
    }
    if (val.length <= 7) {
      if (onChange) {
        onChange({ target: { value: val.toUpperCase(), id } });
      }
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Label and Selected Preview Pill */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label} {required && <span className="text-amber-500">*</span>}
          </label>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-inner border border-white/20"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-xs font-mono font-bold text-slate-200">
            {currentColor}
          </span>
        </div>
      </div>

      {/* Preset Swatches Grid */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-400" /> Curated Theme Palettes
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
          {PRESET_COLORS.map((preset) => {
            const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => handleSelectPreset(preset.hex)}
                title={`${preset.name} (${preset.hex})`}
                className={`group relative w-full aspect-square rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-white scale-110 shadow-lg z-10'
                    : 'hover:scale-105 hover:shadow-md opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: preset.hex }}
              >
                {isSelected && (
                  <Check size={14} className="text-white drop-shadow-md stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Picker & Hex Code Field */}
      <div className="flex items-center gap-2.5">
        {/* Color Swatch Picker Button */}
        <div
          className="relative w-11 h-11 rounded-xl border border-slate-700 hover:border-slate-500 overflow-hidden shrink-0 shadow-inner transition cursor-pointer flex items-center justify-center group"
          style={{ backgroundColor: currentColor }}
        >
          <input
            id={id}
            type="color"
            value={currentColor.startsWith('#') && currentColor.length === 7 ? currentColor : '#0047AB'}
            onChange={(e) => {
              if (onChange) {
                onChange({ target: { value: e.target.value.toUpperCase(), id } });
              }
            }}
            className="absolute inset-0 w-[200%] h-[200%] -translate-x-[25%] -translate-y-[25%] opacity-0 cursor-pointer"
          />
          <Pipette size={16} className="text-white drop-shadow-md opacity-70 group-hover:opacity-100 transition pointer-events-none" />
        </div>

        {/* Hex Text Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={currentColor}
            onChange={handleHexInput}
            placeholder="#0047AB"
            maxLength={7}
            className="w-full bg-slate-800/90 border border-slate-700 hover:border-slate-600 focus:border-primary-500 text-slate-100 placeholder-slate-500 rounded-xl text-sm font-mono font-semibold py-2.5 px-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 uppercase"
          />
        </div>
      </div>
    </div>
  );
}
