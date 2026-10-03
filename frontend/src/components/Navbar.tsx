import React from 'react';
import { Sparkles, CheckCircle2, Key, Settings, Zap } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenSettings }) => {
  const modelName = health?.openai_model || 'gpt-4o-mini';
  const hasDirectKey = modelName.includes('Direct Key');

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-sans">
              CopyForge AI Dashboard
              <span className="text-[11px] font-normal text-slate-400 font-mono hidden md:inline">
                — Enterprise Content Transformer
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-brand-400" />
          <span>{modelName}</span>
        </div>

        {/* Engine Status Badge */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10"
        >
          {hasDirectKey ? (
            <Key className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          )}
          <span>{hasDirectKey ? 'OpenAI API Connected' : 'Live AI Engine Active'}</span>
        </button>

        {/* Settings Launcher */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
          title="Engine & API Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
