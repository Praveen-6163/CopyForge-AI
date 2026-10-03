import React, { useState } from 'react';
import { Settings, User, Cpu, Linkedin, Instagram, Zap, Bell, Shield, Key, Eye, EyeOff, Save, Trash2, CheckCircle2 } from 'lucide-react';
import {
  SectionHeader, GlassCard, Button, Badge, Toggle, Tabs,
  useToast, ToastContainer, PageWrapper
} from '../components/ui';
import { getStoredApiKey, getStoredModel } from '../services/api';

const SETTINGS_TABS = [
  { id: 'general',    label: 'General',         icon: Settings },
  { id: 'ai',         label: 'AI Provider',     icon: Cpu },
  { id: 'content',    label: 'Content Prefs',   icon: User },
  { id: 'social',     label: 'Social Accounts', icon: Linkedin },
  { id: 'automation', label: 'Automation',      icon: Zap },
  { id: 'security',   label: 'Security',        icon: Shield },
];

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState('general');
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [model, setModel] = useState(getStoredModel());
  const [showKey, setShowKey] = useState(false);
  const { toasts, show, dismiss } = useToast();

  const handleSaveApiKey = () => {
    localStorage.setItem('copyforge_openai_api_key', apiKey.trim());
    localStorage.setItem('copyforge_openai_model', model);
    show('success', 'API settings saved successfully.');
  };

  const handleClearKey = () => {
    localStorage.removeItem('copyforge_openai_api_key');
    setApiKey('');
    show('info', 'API key removed.');
  };

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            SYSTEM PREFERENCES
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Settings & Model Config
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Configure AI inference engines, model parameters, API keys, and workspace preferences.
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={SETTINGS_TABS} activeTab={tab} onChange={setTab} />
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="max-w-2xl space-y-5">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <SectionHeader title="General Settings" icon={Settings} />
            <div className="space-y-4">
              {[
                { label: 'Platform Name', value: 'CopyForge AI', readOnly: true },
                { label: 'Version', value: '2.4.0 Editorial Edition', readOnly: true },
                { label: 'Default Language', value: 'English (US)', readOnly: false },
              ].map(({ label, value, readOnly }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">{label}</label>
                  <input
                    type="text"
                    defaultValue={value}
                    readOnly={readOnly}
                    className={`w-full px-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-100 focus:outline-none ${readOnly ? 'opacity-50 cursor-not-allowed' : 'focus:border-indigo-500'}`}
                  />
                </div>
              ))}
              <div className="pt-2">
                <Toggle
                  enabled={true}
                  onChange={() => {}}
                  label="Editorial Dark Mode"
                  description="High-contrast charcoal & deep midnight palette enabled"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Provider */}
      {tab === 'ai' && (
        <div className="max-w-2xl space-y-5">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <SectionHeader title="AI Provider Configuration" icon={Cpu} />
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-indigo-400" /> OpenAI API Key (Client Direct)</span>
                  {apiKey && <Badge variant="success" size="sm">Configured</Badge>}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 pr-10 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Optional. Stored strictly in your browser's <code>localStorage</code> and never sent to third-party tracking servers.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Model Selection</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Effective - Default)</option>
                  <option value="gpt-4o">gpt-4o (Frontier Multimodal)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="primary" size="md" icon={Save} onClick={handleSaveApiKey}>
                  Save Settings
                </Button>
                {apiKey && (
                  <Button variant="ghost" size="md" icon={Trash2} onClick={handleClearKey}>
                    Clear Key
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="max-w-2xl space-y-5">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
            <SectionHeader title="Privacy & Security" icon={Shield} />
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                CopyForge AI enforces strict zero-client exposure for backend keys and user privacy compliance.
              </p>
              <div className="pt-2">
                <a
                  href="/privacy"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View Full Privacy Policy →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </PageWrapper>
  );
};
