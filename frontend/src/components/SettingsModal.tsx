import React from 'react';
import { AlertCircle, CheckCircle2, Settings, X } from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthStatus | null;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  health,
}) => {
  if (!isOpen) return null;

  const configured = Boolean(health?.ai_configured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="w-full max-w-lg bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <header className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base font-bold text-white">AI Provider Status</h2>
              <p className="text-xs text-slate-400">Provider credentials stay on the backend.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-4 text-sm">
          <div className={`p-4 rounded-xl border ${
            configured
              ? 'bg-emerald-950/30 border-emerald-500/30'
              : 'bg-amber-950/30 border-amber-500/30'
          }`}>
            <p className="font-semibold text-slate-100 flex items-center gap-2">
              {configured
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <AlertCircle className="w-4 h-4 text-amber-400" />}
              {configured ? 'Configured' : 'Not configured'}
            </p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {configured
                ? `Text generation uses ${health?.ai_provider || 'Gemini'} (${health?.ai_model || health?.openai_model || 'gemini-2.5-flash'}) through the backend.`
                : 'Add GEMINI_API_KEY to the Render backend environment. Do not add provider credentials to the frontend.'}
            </p>
          </div>
          <div className="pt-2 flex justify-end border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
