'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-800/40 border border-slate-800/50 flex items-center justify-center shrink-0">
        <span className="w-4 h-4 rounded-full bg-slate-700 animate-pulse"></span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-500 hover:shadow-md hover:shadow-amber-500/5 flex items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="animate-in spin-in-45 duration-300" />
      ) : (
        <Moon size={18} className="animate-in spin-in-45 duration-300" />
      )}
    </button>
  );
}
