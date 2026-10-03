import React from 'react';
import { Radio, Settings } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenSettings }) => (
  <header className="h-16 border-b border-white/[0.07] bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img
        src="/icon.png"
        alt="CopyForge"
        className="w-7 h-7 rounded-lg object-cover border border-white/10 md:hidden"
      />
      <span className={`h-2 w-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
      <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
        CopyForge Workspace
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs ${
          health?.ai_configured ? 'text-emerald-400' : 'text-amber-300'
        }`}
        role="status"
      >
        <Radio className="w-3.5 h-3.5" />
        <span className="font-medium">
          {!health
            ? 'Backend unavailable'
            : health.ai_configured
              ? 'AI provider connected'
              : 'AI provider not configured'}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  </header>
);
