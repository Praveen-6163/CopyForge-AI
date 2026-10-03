import React, { useState } from 'react';
import { Bell, Settings, Radio } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface NavbarProps {
  health: HealthStatus | null;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onOpenSettings }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const modelName = health?.openai_model || 'gpt-4o-mini';
  const backendConnected = health?.engine_mode === 'backend';

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* ── Left Indicator ── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
            CopyForge Workspace
          </span>
        </div>
      </div>

      {/* ── Right Actions: Status, Notifications, Profile ── */}
      <div className="flex items-center gap-3">
        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-slate-300">
          <Radio className={`w-3.5 h-3.5 ${backendConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className={`font-medium ${backendConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
            {!health ? 'Checking Engine' : health.engine_mode === 'openai_direct'
              ? 'OpenAI Key Saved'
              : health.engine_mode === 'backend'
                ? 'Backend Connected'
                : 'Demo Mode'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] font-mono text-slate-400">{modelName}</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-white/10 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Sample Notifications</p>
                <span className="text-[10px] text-amber-400 font-mono">Demo</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="font-semibold text-slate-200">Sample trend alert</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Autonomous AI Agents appears in the bundled sample feed.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="font-semibold text-slate-200">Sample approval</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">The approval queue contains sample content only.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Engine Settings */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
            P
          </div>
        </div>
      </div>
    </header>
  );
};
