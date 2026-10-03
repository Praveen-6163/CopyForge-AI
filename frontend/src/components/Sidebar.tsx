import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, PlusCircle, History, Bookmark, LayoutTemplate, 
  Zap, CheckCircle2, Sliders, ShieldCheck, Shield
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
  savedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewGeneration,
  onOpenHistory,
  onOpenSaved,
  onOpenTemplates,
  onOpenSettings,
  health,
  activeView,
  savedCount = 0,
}) => {
  return (
    <aside className="w-64 bg-[#0d121f] border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5 font-sans">
              CopyForge <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono border border-brand-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">Tone Transformer AI</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={onNewGeneration}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Generation</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1.5">
          <button
            onClick={onNewGeneration}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === 'editor' 
                ? 'bg-gradient-to-r from-brand-600/20 to-indigo-600/20 text-brand-300 border border-brand-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Workspace</span>
            </div>
            {activeView === 'editor' && <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400" />}
          </button>

          <button
            onClick={onOpenHistory}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === 'history'
                ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-purple-400" />
              <span>Generation History</span>
            </div>
          </button>

          <button
            onClick={onOpenSaved}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeView === 'saved'
                ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Saved Copies</span>
            </div>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenTemplates}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <LayoutTemplate className="w-4 h-4 text-cyan-400" />
            <span>Prompt Templates</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Settings & API Key</span>
          </button>
        </nav>
      </div>

      {/* Footer API Status Badge */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> API Engine
          </span>
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 font-mono text-[10px] font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Fully Functional
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono flex justify-between items-center mb-3">
          <span>Active Model:</span>
          <span className="text-slate-300 font-semibold">{health?.openai_model || 'gpt-4o-mini'}</span>
        </div>
        {/* Privacy Policy Link */}
        <Link
          to="/privacy"
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors group"
        >
          <Shield className="w-3 h-3 text-slate-500 group-hover:text-brand-400 transition-colors" />
          <span>Privacy Policy</span>
        </Link>
      </div>
    </aside>
  );
};
