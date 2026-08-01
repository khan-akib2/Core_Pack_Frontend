import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Select({ className, containerClassName, label, error, children, value, onChange, required, disabled, name, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse children to extract options
  const options = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled
      };
    }
    return null;
  }).filter(Boolean);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (option.disabled) return;
    if (onChange) {
      // Simulate native event object
      onChange({ target: { value: option.value, name } });
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full relative", containerClassName)} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 whitespace-nowrap truncate">
          {label}
        </label>
      )}
      
      {/* Native select for form validation and accessibility (visually hidden) */}
      <select 
        className="opacity-0 absolute pointer-events-none w-full h-full bottom-0 left-0" 
        value={value} 
        onChange={onChange} 
        required={required}
        disabled={disabled}
        name={name}
        {...props}
      >
        {children}
      </select>

      <div className="relative">
        <div
          className={cn(
            "w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-xs cursor-pointer flex items-center justify-between",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : '-- Select --'}</span>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "transform rotate-180")} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto custom-scrollbar"
            >
              {options
                .filter(opt => String(opt.value) !== String(value) && String(opt.value) !== "")
                .map((opt, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-3.5 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between",
                    opt.disabled ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "hover:bg-orange-50 hover:text-orange-700"
                  )}
                  onClick={() => handleSelect(opt)}
                >
                  <span className="truncate">{opt.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
    </div>
  );
}
