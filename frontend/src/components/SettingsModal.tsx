import React from 'react';
import { X, Settings, ShieldAlert, CheckCircle2, Cpu, Key, HelpCircle } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthStatus | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  health,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-slate-300" />
            <h2 className="text-base font-bold text-white">Application Settings & Status</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-brand-400" /> API Engine Mode
              </span>
              {health?.demo_mode ? (
                <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-400 font-mono font-semibold border border-amber-400/30 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Demo Mode
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-emerald-400/10 text-emerald-400 font-mono font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Live OpenAI API
                </span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed">
              {health?.demo_mode ? (
                <>
                  <strong className="text-amber-300">OPENAI_API_KEY</strong> is currently unconfigured. The app is generating sample responses via the local Demo Engine. Add your key in <code className="text-brand-300 font-mono bg-slate-800 px-1 py-0.5 rounded">.env</code> to activate live OpenAI generations.
                </>
              ) : (
                <>
                  Connected to OpenAI API. Requests are securely handled on the backend without exposing keys.
                </>
              )}
            </p>
          </div>

          {/* Model info */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold text-slate-200 block">OpenAI Model Configured</span>
                <span className="text-[11px] text-slate-400">Configured via OPENAI_MODEL variable</span>
              </div>
            </div>
            <span className="font-mono text-xs text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded border border-purple-500/30 font-bold">
              {health?.openai_model || 'gpt-4o-mini'}
            </span>
          </div>

          {/* System version info */}
          <div className="pt-2 text-center text-slate-500 text-[11px] font-mono">
            {health?.project_name || 'CopyForge AI'} — v{health?.version || '1.0.0'} (DecodeLabs GenAI Internship Project 2)
          </div>
        </div>
      </div>
    </div>
  );
};
