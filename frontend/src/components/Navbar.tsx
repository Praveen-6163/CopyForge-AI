import React from 'react';
import { Sparkles, Terminal, ShieldAlert, CheckCircle2, Moon, Sun } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenSettings }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur sticky top-0 z-20 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-sans">
          CopyForge AI Dashboard
          <span className="text-[11px] font-normal text-slate-400 font-mono hidden sm:inline">
            — Turn product ideas into platform-ready content.
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Badge */}
        {health?.demo_mode ? (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-mono border border-amber-400/30 hover:bg-amber-400/20 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Demo Mode</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-mono border border-emerald-400/30 hover:bg-emerald-400/20 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live AI</span>
          </button>
        )}
      </div>
    </header>
  );
};
