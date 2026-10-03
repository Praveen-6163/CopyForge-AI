import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { CalendarClock, Clock, Save, Zap } from 'lucide-react';
import { Button } from '../components/ui';
import { AutomationSettings, fetchAutomation, saveAutomation } from '../services/platformApi';

const DEFAULTS: AutomationSettings = {
  enabled: false,
  platform: 'linkedin',
  topic: '',
  description: '',
  tone: 'Professional',
  audience: 'Professionals',
  content_type: 'Social post',
  frequency: 'daily',
  posting_time: '06:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  mode: 'approval_required',
};

export const AutomationPage: React.FC = () => {
  const [settings, setSettings] = useState<AutomationSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await fetchAutomation());
      setError('');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not load automation settings from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = <K extends keyof AutomationSettings>(key: K, value: AutomationSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const saved = await saveAutomation(settings);
      setSettings(saved);
      setNotice(saved.enabled
        ? `Daily automation is active. Next run: ${saved.next_run_at ? new Date(saved.next_run_at).toLocaleString(undefined, { timeZone: saved.timezone }) : 'pending'}.`
        : 'Automation settings saved and paused.');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not save automation settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          SERVER-SIDE SCHEDULER
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
          <Zap className="w-7 h-7 text-indigo-400" />
          Automation
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Configure daily content generation and publishing. The backend scheduler runs the job and records each result in PostgreSQL.
        </p>
      </div>

      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" className="text-sm text-slate-400">Loading saved automation settings…</p>
      ) : (
        <form onSubmit={submit} className="editorial-card rounded-2xl p-6 md:p-8 border border-white/10 space-y-6">
          <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-900/60 p-4 border border-white/[0.06]">
            <span>
              <span className="block text-sm font-semibold text-white">Enable daily automation</span>
              <span className="block text-xs text-slate-400 mt-1">Jobs are executed by the backend, not by this browser.</span>
            </span>
            <input
              aria-label="Enable daily automation"
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) => update('enabled', event.target.checked)}
              className="h-5 w-5 accent-indigo-500"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs text-slate-300">
              Platform
              <select value={settings.platform} onChange={(event) => update('platform', event.target.value as AutomationSettings['platform'])} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Content type
              <input value={settings.content_type} onChange={(event) => update('content_type', event.target.value)} required className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="md:col-span-2 space-y-1.5 text-xs text-slate-300">
              Topic
              <input value={settings.topic} onChange={(event) => update('topic', event.target.value)} required={settings.enabled} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="md:col-span-2 space-y-1.5 text-xs text-slate-300">
              Description / brief
              <textarea rows={4} value={settings.description} onChange={(event) => update('description', event.target.value)} required={settings.enabled} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Tone
              <input value={settings.tone} onChange={(event) => update('tone', event.target.value)} required className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Audience
              <input value={settings.audience} onChange={(event) => update('audience', event.target.value)} required className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" />Run time</span>
              <input type="time" value={settings.posting_time} onChange={(event) => update('posting_time', event.target.value)} required className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Timezone (IANA)
              <input value={settings.timezone} onChange={(event) => update('timezone', event.target.value)} required placeholder="Asia/Kolkata" className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
            <label className="space-y-1.5 text-xs text-slate-300">
              Frequency
              <input value="Every day" readOnly className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-slate-400" />
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-white">Publishing mode</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                ['auto_publish', 'Auto Publish', 'Publish through the connected platform API.'],
                ['approval_required', 'Approval Required', 'Create a post in the approval queue.'],
                ['draft_only', 'Draft Only', 'Save generated content as a draft.'],
              ] as const).map(([value, label, description]) => (
                <label key={value} className={`p-4 rounded-xl border cursor-pointer ${
                  settings.mode === value ? 'border-indigo-500 bg-indigo-950/30' : 'border-white/10 bg-slate-900/50'
                }`}>
                  <input type="radio" name="mode" value={value} checked={settings.mode === value} onChange={() => update('mode', value)} className="sr-only" />
                  <span className="block text-xs font-bold text-white">{label}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">{description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-400">
            {settings.next_run_at
              ? <span className="flex items-center gap-2"><CalendarClock className="w-4 h-4 text-indigo-400" /> Next run: {new Date(settings.next_run_at).toLocaleString(undefined, { timeZone: settings.timezone })} ({settings.timezone})</span>
              : 'Automation is paused until you save it as enabled.'}
            {settings.last_run_at && (
              <p className="mt-2">Last run: {new Date(settings.last_run_at).toLocaleString()}</p>
            )}
            {settings.last_run_error && (
              <p role="alert" className="mt-2 text-rose-300">Last run failed: {settings.last_run_error}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={Save} loading={saving}>Save Automation</Button>
          </div>
        </form>
      )}
    </div>
  );
};
