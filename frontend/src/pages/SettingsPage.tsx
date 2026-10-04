import React, { useState } from 'react';
import { Cpu, Database, Linkedin, Save, Settings, Shield, User, Zap } from 'lucide-react';
import {
  Button,
  PageWrapper,
  SectionHeader,
  Tabs,
  ToastContainer,
  useToast,
} from '../components/ui';
import { AudienceType, HealthStatus, ObjectiveType, PlatformType, ToneType } from '../types/generation';
import { getWorkspacePreferences, saveWorkspacePreferences } from '../services/workspacePreferences';

interface SettingsPageProps {
  health: HealthStatus | null;
}

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'ai', label: 'AI Provider', icon: Cpu },
  { id: 'content', label: 'Content Defaults', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Linkedin },
  { id: 'security', label: 'Security', icon: Shield },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ health }) => {
  const [tab, setTab] = useState('general');
  const [preferences, setPreferences] = useState(getWorkspacePreferences);
  const { toasts, show, dismiss } = useToast();

  const handleSavePreferences = () => {
    try {
      saveWorkspacePreferences(preferences);
      show('success', 'Content defaults saved on this device.');
    } catch (error) {
      console.error('Could not save content defaults.', error);
      show('error', 'Could not save content defaults. Check browser storage permissions.');
    }
  };

  return (
    <PageWrapper>
      <div className="pb-6 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          ACCOUNT PREFERENCES
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">Settings</h1>
        <p className="text-sm text-slate-400 mt-2">Manage provider status, integrations, and content defaults.</p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <Tabs tabs={SETTINGS_TABS} activeTab={tab} onChange={setTab} />
      </div>

      {tab === 'general' && (
        <div className="max-w-2xl editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
          <SectionHeader title="Workspace" icon={Settings} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/60 border border-white/[0.06] p-4">
              <p className="text-slate-500">Product</p><p className="text-white font-semibold mt-1">CopyForge AI</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 border border-white/[0.06] p-4">
              <p className="text-slate-500">Backend</p><p className="text-white font-semibold mt-1">{health?.status === 'healthy' ? 'Connected' : 'Unavailable'}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Account content, generated images, schedules, and publishing results are stored by the backend.
          </p>
        </div>
      )}

      {tab === 'ai' && (
        <div className="max-w-2xl editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
          <SectionHeader title="AI Provider" icon={Cpu} />
          <div className={`rounded-xl border p-4 ${
            health?.ai_configured
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-amber-500/30 bg-amber-950/20'
          }`}>
            <p className="text-sm font-semibold text-white">
              {health?.ai_configured ? 'Configured' : 'Not configured'}
            </p>
            <p className="text-xs text-slate-300 mt-2">
              {health?.ai_configured
                ? `${health.ai_provider || 'Gemini'} (${health.ai_model || health.openai_model || 'gemini-3.8-flash'}) is configured on the backend.`
                : 'Configure GEMINI_API_KEY in the Render backend environment. Never add provider secrets to frontend settings.'}
            </p>
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div className="max-w-2xl editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
          <SectionHeader title="Content Defaults" icon={User} subtitle="Defaults are stored in this browser; generated content remains in your backend account." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs text-slate-300">
              Default platform
              <select value={preferences.defaultPlatform} onChange={(event) => setPreferences({ ...preferences, defaultPlatform: event.target.value as PlatformType })} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
                {['LinkedIn', 'Instagram', 'Email', 'X/Twitter', 'Facebook', 'Website'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Default tone
              <select value={preferences.defaultTone} onChange={(event) => setPreferences({ ...preferences, defaultTone: event.target.value as ToneType })} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
                {['Professional', 'Friendly', 'Witty', 'Persuasive', 'Premium', 'Casual', 'Inspirational', 'Technical'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Default audience
              <select value={preferences.defaultAudience} onChange={(event) => setPreferences({ ...preferences, defaultAudience: event.target.value as AudienceType })} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
                {['General', 'Students', 'Developers', 'Professionals', 'Business Owners', 'Custom'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Default objective
              <select value={preferences.defaultObjective} onChange={(event) => setPreferences({ ...preferences, defaultObjective: event.target.value as ObjectiveType })} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
                {['Product launch', 'Product promotion', 'Awareness', 'Engagement', 'Announcement', 'Educational'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <Button variant="primary" icon={Save} onClick={handleSavePreferences}>Save Content Defaults</Button>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="max-w-2xl grid gap-4">
          <a href="/social/linkedin" className="editorial-card rounded-2xl p-5 border border-white/10 flex items-center gap-3 text-white hover:border-indigo-500/40">
            <Linkedin className="w-5 h-5 text-sky-300" /> Manage LinkedIn and Instagram connections
          </a>
          <a href="/automation" className="editorial-card rounded-2xl p-5 border border-white/10 flex items-center gap-3 text-white hover:border-indigo-500/40">
            <Zap className="w-5 h-5 text-indigo-300" /> Configure backend automation
          </a>
        </div>
      )}

      {tab === 'security' && (
        <div className="max-w-2xl editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
          <SectionHeader title="Security" icon={Shield} />
          <p className="text-sm text-slate-300">
            Social access tokens and AI provider credentials are handled by the backend. The browser stores only the opaque sign-in session in session storage.
          </p>
          <div className="rounded-xl bg-slate-900/60 border border-white/[0.06] p-4 text-xs text-slate-400 flex items-start gap-2">
            <Database className="w-4 h-4 text-indigo-400 mt-0.5" />
            Account records are scoped to the LinkedIn identity used to sign in.
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </PageWrapper>
  );
};
