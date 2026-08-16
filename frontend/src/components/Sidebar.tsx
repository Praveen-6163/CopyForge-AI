import React from 'react';
import { 
  Sparkles, PlusCircle, History, Bookmark, LayoutTemplate, 
  Settings, Zap, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface SidebarProps {
  onNewGeneration: () => void;
  onOpenHistory: () => void;
  onOpenSaved: () => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  health: HealthStatus | null;
  activeView: 'editor' | 'history' | 'saved';
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewGeneration,
  onOpenHistory,
  onOpenSaved,
  onOpenTemplates,
  onOpenSettings,
  health,
  activeView,
}) => {
  return (
    <aside className="w-64 bg-[#0d121f] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-purple flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5 font-sans">
              CopyForge <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono border border-brand-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Tone Transformer</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={onNewGeneration}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Generation</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          <button
            onClick={onNewGeneration}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'editor' 
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 text-brand-400" />
            <span>Workspace</span>
          </button>

          <button
            onClick={onOpenHistory}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'history'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Generation History</span>
          </button>

          <button
            onClick={onOpenSaved}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'saved'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Saved Copies</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4 text-cyan-400" />
            <span>Prompt Templates</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Footer API Status Badge */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">API Engine</span>
          {health?.demo_mode ? (
            <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono text-[11px]">
              <ShieldAlert className="w-3 h-3" /> Demo Mode
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 font-mono text-[11px]">
              <CheckCircle2 className="w-3 h-3" /> Live OpenAI
            </span>
          )}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 font-mono flex justify-between">
          <span>Model:</span>
          <span className="text-slate-300">{health?.openai_model || 'gpt-4o-mini'}</span>
        </div>
      </div>
    </aside>
  );
};
