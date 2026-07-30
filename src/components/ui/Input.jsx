import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export function Input({ className, label, error, type, value, onChange, placeholder, ...props }) {
  const hiddenDateRef = useRef(null);

  if (type === 'date') {
    let displayValue = '';
    if (value) {
      if (typeof value === 'string' && value.includes('-')) {
        const parts = value.split('T')[0].split('-');
        if (parts.length === 3) {
          displayValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      } else {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          displayValue = `${day}/${month}/${year}`;
        }
      }
    }

    const openPicker = () => {
      if (hiddenDateRef.current) {
        if (typeof hiddenDateRef.current.showPicker === 'function') {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.focus();
          hiddenDateRef.current.click();
        }
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            onClick={openPicker}
            value={displayValue}
            placeholder={placeholder || "DD/MM/YYYY"}
            className={cn(
              "w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all shadow-xs cursor-pointer",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
          />
          <button
            type="button"
            onClick={openPicker}
            className="absolute right-3 text-slate-400 hover:text-orange-500 focus:outline-none transition-colors"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <input
            ref={hiddenDateRef}
            type="date"
            className="sr-only opacity-0 w-0 h-0 absolute"
            tabIndex={-1}
            value={value ? String(value).split('T')[0] : ''}
            onChange={(e) => {
              if (onChange) onChange(e);
            }}
          />
        </div>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all shadow-xs",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
