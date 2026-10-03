import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle2, Cpu, Key, Eye, EyeOff, Save, Trash2, AlertCircle } from 'lucide-react';
import { HealthStatus } from '../types/generation';
import { getStoredApiKey, getStoredModel } from '../services/api';

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
  onSettingsSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setModel(getStoredModel());
      setSavedSuccess(false);
      setSaveError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('copyforge_openai_api_key', apiKey.trim());
      localStorage.setItem('copyforge_openai_model', model);
      setSaveError('');
      setSavedSuccess(true);
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (error) {
      console.error('Could not save AI settings.', error);
      setSaveError('Could not save settings. Check browser storage permissions.');
    }
  };

  const handleClearKey = () => {
    try {
      localStorage.removeItem('copyforge_openai_api_key');
      setApiKey('');
      setSaveError('');
      setSavedSuccess(true);
      if (onSettingsSaved) onSettingsSaved();
    } catch (error) {
      console.error('Could not clear the saved API key.', error);
      setSaveError('Could not clear the API key. Check browser storage permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Engine & API Key Settings</h2>
              <p className="text-xs text-slate-400">Configure client API keys & model behavior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Current Mode
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 font-mono font-semibold border border-amber-400/30 flex items-center gap-1">
                {health?.engine_mode === 'backend'
                  ? 'Backend Connected'
                  : health?.engine_mode === 'openai_direct'
                    ? 'OpenAI Key Saved'
                    : 'Local Demo Mode'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Without a configured backend or OpenAI key, content is generated locally in this browser. Social publishing and scheduled jobs are not available in this demo.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-brand-400" /> OpenAI API Key (Optional Client Direct)
              </span>
              {apiKey && (
                <span className="text-[10px] text-amber-300 font-mono font-normal">Saved in this browser</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3.5 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
                  title={showApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                    title="Remove API Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {saveError && <p role="alert" className="text-rose-300">{saveError}</p>}
            <p className="text-[10px] text-slate-500">
              Stored in this browser's local storage and sent directly to OpenAI when used. It is not encrypted by this demo.
            </p>
          </div>

          {/* Model selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" /> Target AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Efficient)</option>
              <option value="gpt-4o">gpt-4o (High-Precision Flagship Model)</option>
              <option value="gpt-4-turbo">gpt-4-turbo (Creative Longform)</option>
            </select>
          </div>

          {/* Actions & Feedback */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            {savedSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings Saved!
              </span>
            ) : (
              <span className="text-slate-500 text-[11px] font-mono">CopyForge AI v1.0.0</span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
