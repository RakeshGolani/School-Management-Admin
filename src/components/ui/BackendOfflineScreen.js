'use client';

import React, { useState } from 'react';
import { useBackendStatus } from '@/context/BackendStatusContext';
import { RefreshCw, ServerOff, Terminal, ShieldAlert } from 'lucide-react';

export default function BackendOfflineScreen() {
  const { isOffline, isChecking, lastChecked, checkHealth } = useBackendStatus();
  const [manualSpin, setManualSpin] = useState(false);

  if (!isOffline) return null;

  const handleRefreshClick = async () => {
    setManualSpin(true);
    await checkHealth();
    setTimeout(() => setManualSpin(false), 500);
  };

  const isSpinning = isChecking || manualSpin;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn text-slate-100">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Container Card */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6 backdrop-blur-2xl">
        
        {/* Top Status Header Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold tracking-wide shadow-inner">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Server Connection Offline
        </div>

        {/* Icon & Pulse Rings */}
        <div className="relative flex justify-center items-center py-2">
          <div className="absolute w-24 h-24 rounded-full bg-rose-500/10 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-500/20 text-white">
            <ServerOff size={38} className="animate-bounce" />
          </div>
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unable to Connect to Server
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The Vidyadmin SuperAdmin console is unable to reach the master backend server. Please verify network and server status.
          </p>
        </div>

        {/* Diagnostic / Solution Box */}
        <div className="text-left bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-200 text-xs">
            <ShieldAlert size={15} className="text-secondary-400" />
            Recommended Actions:
          </div>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-secondary-400 font-bold">•</span>
              <span>Verify that the main backend service is running.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary-400 font-bold">•</span>
              <span>Ensure your network connection is active.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-secondary-400 font-bold">•</span>
              <span>Click the button below to test connection status.</span>
            </li>
          </ul>
        </div>

        {/* Refresh Action Buttons & Status */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={isSpinning}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/25 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Checking Connection...' : 'Check Connection / Retry'}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Auto-retrying in background...</span>
            {lastChecked && (
              <span>Last checked: {new Date(lastChecked).toLocaleTimeString()}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );

}
