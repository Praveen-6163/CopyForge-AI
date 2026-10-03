import React, { useState } from 'react';
import { Settings, User, Cpu, Linkedin, Instagram, Zap, Bell, Shield, Key, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          </div>
          <p className="text-sm text-slate-400">Configure CopyForge AI platform settings</p>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={SETTINGS_TABS} active={tab} onChange={setTab} />
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="max-w-2xl space-y-5">
          <GlassCard className="p-5">
            <SectionHeader title="General Settings" icon={Settings} />
            <div className="space-y-4">
              {[
                { label: 'Platform Name', value: 'CopyForge AI', readOnly: true },
                { label: 'Version', value: '2.0.0', readOnly: true },
                { label: 'Default Language', value: 'English', readOnly: false },
              ].map(({ label, value, readOnly }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">{label}</label>
                  <input
                    type="text"
                    defaultValue={value}
                    readOnly={readOnly}
                    className={`w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none ${readOnly ? 'opacity-50 cursor-not-allowed' : 'focus:border-brand-500'}`}
                  />
                </div>
              ))}
              <div className="pt-2">
                <Toggle
                  enabled={true}
                  onChange={() => {}}
                  label="Dark Mode"
                  description="Platform uses dark mode by default"
                />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* AI Provider */}
      {tab === 'ai' && (
        <div className="max-w-2xl space-y-5">
          <GlassCard className="p-5">
            <SectionHeader title="AI Provider Configuration" icon={Cpu} />
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-brand-400" /> OpenAI API Key (Client Direct)</span>
                  {apiKey && <Badge variant="success" size="sm">Configured</Badge>}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full pl-3.5 pr-20 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-brand-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button onClick={() => setShowKey(!showKey)} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg">
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {apiKey && (
                      <button onClick={handleClearKey} className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Stored in browser localStorage only. Never sent to CopyForge servers.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">OpenAI Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Efficient)</option>
                  <option value="gpt-4o">gpt-4o (High-Precision Flagship)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo (Creative Longform)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Image Generation Provider</label>
                <select className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200">
                  <option value="">None (Not Configured)</option>
                  <option value="dalle3">DALL-E 3 (OpenAI)</option>
                  <option value="ideogram">Ideogram</option>
                  <option value="stability">Stable Diffusion</option>
                </select>
              </div>

              <Button variant="primary" icon={Save} size="sm" onClick={handleSaveApiKey}>
                Save AI Settings
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Content Preferences */}
      {tab === 'content' && (
        <div className="max-w-2xl space-y-5">
          <GlassCard className="p-5">
            <SectionHeader title="Content Preferences" icon={User} />
            <div className="space-y-4">
              {[
                { label: 'Default Platform', options: ['LinkedIn', 'Instagram', 'Both'] },
                { label: 'Default Tone', options: ['Professional', 'Friendly', 'Technical', 'Educational'] },
                { label: 'Default Content Type', options: ['AI News', 'Educational', 'Tutorial', 'Industry Insight'] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">{label}</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500">
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <Toggle enabled={true} onChange={() => {}} label="Auto-add hashtags" description="Append suggested hashtags to generated content" />
              </div>
              <div>
                <Toggle enabled={true} onChange={() => {}} label="Include source links" description="Add source citations to AI news content" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Social Accounts */}
      {tab === 'social' && (
        <div className="max-w-2xl space-y-5">
          {[
            { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', border: 'border-blue-500/20' },
            { name: 'Instagram', icon: Instagram, color: 'text-pink-400', border: 'border-pink-500/20' },
          ].map(({ name, icon: Icon, color, border }) => (
            <GlassCard key={name} className={`p-5 border ${border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{name}</p>
                    <p className="text-xs text-slate-500">Not Connected</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Connect</Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Automation */}
      {tab === 'automation' && (
        <div className="max-w-2xl space-y-5">
          <GlassCard className="p-5">
            <SectionHeader title="Automation Preferences" icon={Zap} />
            <div className="space-y-4">
              <Toggle enabled={false} onChange={() => {}} label="Daily Automation" description="Run content pipeline at 06:00 AM daily" />
              <Toggle enabled={true} onChange={() => {}} label="Approval Required" description="Require approval before publishing" />
              <Toggle enabled={true} onChange={() => {}} label="Quality Check" description="Run AI quality validation before approval" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="max-w-2xl space-y-5">
          <GlassCard className="p-5">
            <SectionHeader title="Security Settings" icon={Shield} />
            <div className="space-y-4">
              {[
                { label: 'API Key Storage', value: 'Browser localStorage (client-side only)', status: 'info' as const },
                { label: 'OAuth Tokens', value: 'Server-side encrypted (backend)', status: 'success' as const },
                { label: 'Transport Security', value: 'TLS 1.2+ (HTTPS enforced)', status: 'success' as const },
                { label: 'Token Encryption', value: 'AES-256 at rest', status: 'success' as const },
              ].map(({ label, value, status }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-slate-800/60 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{value}</p>
                  </div>
                  <Badge variant={status} size="sm">{status === 'success' ? 'Secure' : 'Client'}</Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageWrapper>
  );
};
