import React, { useState } from 'react';
import { Zap, Clock, Globe, CheckCircle, Circle, Info } from 'lucide-react';
import {
  SectionHeader, GlassCard, Button, Badge, Toggle,
  useToast, ToastContainer, PageWrapper
} from '../components/ui';
import { AutomationConfig, AutomationMode } from '../types/platform';
import { DEMO_AUTOMATION_CONFIG, AUTOMATION_TIMELINE } from '../services/platformData';

const WORKFLOW_STEPS = [
  'Discover AI trends',
  'Research & validate sources',
  'Select best topic',
  'Generate content (LinkedIn + Instagram)',
  'Generate post image',
  'Run quality checks',
  'Send for approval / Auto publish',
  'Publish to connected accounts',
  'Track analytics',
];

const MODES: { id: AutomationMode; label: string; description: string }[] = [
  { id: 'draft_only', label: 'Draft Only', description: 'Save all generated content as drafts. No publishing or approval workflows.' },
  { id: 'approval_required', label: 'Approval Required', description: 'Send generated content to Approval Queue. You must approve before publishing.' },
  { id: 'auto_publish', label: 'Auto Publish', description: 'Automatically publish approved content. Use with caution.' },
];

const TIMEZONES = ['Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Singapore'];

export const AutomationPage: React.FC = () => {
  const [config, setConfig] = useState<AutomationConfig>(DEMO_AUTOMATION_CONFIG);
  const [saved, setSaved] = useState(false);
  const { toasts, show, dismiss } = useToast();

  const handleSave = () => {
    setSaved(true);
    show('success', 'Automation settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Automation</h1>
          </div>
          <p className="text-sm text-slate-400">Configure your daily AI content automation workflow</p>
        </div>
        <Button variant="primary" icon={Zap} size="sm" onClick={handleSave}>
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Main Toggle */}
          <GlassCard className="p-5">
            <SectionHeader title="Daily AI Content Automation" subtitle="Automate your entire content pipeline" icon={Zap} />

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-5">
              <Toggle
                enabled={config.enabled}
                onChange={v => setConfig({ ...config, enabled: v })}
                label="Enable Automation"
                description="Run the full content pipeline daily at the scheduled time"
              />
            </div>

            {config.enabled && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-300">Automation is enabled. Next run scheduled for today at {config.scheduleTime}.</p>
              </div>
            )}
          </GlassCard>

          {/* Schedule Config */}
          <GlassCard className="p-5">
            <SectionHeader title="Schedule" subtitle="When to run the automation" icon={Clock} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Run Time</label>
                <input
                  type="time"
                  value={config.scheduleTime}
                  onChange={e => setConfig({ ...config, scheduleTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Timezone</label>
                <select
                  value={config.timezone}
                  onChange={e => setConfig({ ...config, timezone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Topics per Run</label>
                <input
                  type="number"
                  min={1} max={10}
                  value={config.topicsPerRun}
                  onChange={e => setConfig({ ...config, topicsPerRun: +e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Max Posts per Day</label>
                <input
                  type="number"
                  min={1} max={10}
                  value={config.maxPostsPerDay}
                  onChange={e => setConfig({ ...config, maxPostsPerDay: +e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </GlassCard>

          {/* Publishing Mode */}
          <GlassCard className="p-5">
            <SectionHeader title="Publishing Mode" subtitle="How content gets published" />
            <div className="space-y-3">
              {MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setConfig({ ...config, mode: mode.id })}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    config.mode === mode.id
                      ? 'bg-brand-500/10 border-brand-500/50 text-brand-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      config.mode === mode.id ? 'border-brand-400' : 'border-slate-600'
                    }`}>
                      {config.mode === mode.id && <div className="w-2 h-2 rounded-full bg-brand-400" />}
                    </div>
                    <span className="text-sm font-semibold">{mode.label}</span>
                    {mode.id === 'approval_required' && <Badge variant="info" size="sm">Recommended</Badge>}
                    {mode.id === 'auto_publish' && <Badge variant="warning" size="sm">Caution</Badge>}
                  </div>
                  <p className="text-xs ml-6 opacity-80">{mode.description}</p>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Workflow Sidebar */}
        <div className="space-y-4">
          <GlassCard className="p-4">
            <SectionHeader title="Automation Workflow" subtitle="9-step pipeline" icon={Circle} />
            <div className="space-y-2">
              {WORKFLOW_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5 py-2 border-b border-slate-800/60 last:border-0">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-300">{step}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200 mb-1.5">Backend Requirements</p>
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>• Trend scanner API connection</li>
                  <li>• OpenAI API key configured</li>
                  <li>• At least one social account connected</li>
                  <li>• Scheduler service running</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageWrapper>
  );
};
