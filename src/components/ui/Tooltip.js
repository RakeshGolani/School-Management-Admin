'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({
  content,
  children,
  position = 'top', // 'top' | 'bottom' | 'left' | 'right'
  delay = 200
}) {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({});
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const showTip = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(true);
    }, delay);
  };

  const hideTip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActive(false);
  };

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let style = {};
    switch (position) {
      case 'bottom':
        style = {
          position: 'absolute',
          top: `${rect.bottom + scrollTop + 8}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 9999,
        };
        break;
      case 'left':
        style = {
          position: 'absolute',
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.left + scrollLeft - 8}px`,
          transform: 'translate(-100%, -50%)',
          zIndex: 9999,
        };
        break;
      case 'right':
        style = {
          position: 'absolute',
          top: `${rect.top + scrollTop + rect.height / 2}px`,
          left: `${rect.right + scrollLeft + 8}px`,
          transform: 'translate(0, -50%)',
          zIndex: 9999,
        };
        break;
      case 'top':
      default:
        style = {
          position: 'absolute',
          top: `${rect.top + scrollTop - 8}px`,
          left: `${rect.left + scrollLeft + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
        };
    }
    setCoords(style);
  };

  useEffect(() => {
    if (active) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, { passive: true });
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [active, position]);

  // Caret position mapper
  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-slate-900 border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-slate-900 border-y-transparent border-l-transparent';
      case 'top':
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-slate-900 border-x-transparent border-b-transparent';
    }
  };

  if (!content) return children;

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      {active && mounted && createPortal(
        <div 
          style={coords}
          className="absolute z-50 whitespace-nowrap bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-100 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          {content}
          {/* Caret / Arrow */}
          <div className={`absolute border-4 ${getArrowClasses()}`} />
        </div>,
        document.body
      )}
    </div>
  );
}
