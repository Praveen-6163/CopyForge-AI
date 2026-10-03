import React, { useState } from 'react';
import {
  Zap,
  Radio,
  Search,
  PenTool,
  Image as ImageIcon,
  ShieldCheck,
  CheckSquare,
  Send,
  BarChart3,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Button, Badge, WorkflowStep } from '../components/ui';
import { getWorkspacePreferences, saveWorkspacePreferences } from '../services/workspacePreferences';

export const AutomationPage: React.FC = () => {
  const [preferences, setPreferences] = useState(getWorkspacePreferences);
  const [mode, setMode] = useState<'draft_only' | 'approval_required' | 'auto_publish'>('approval_required');
  const [saveError, setSaveError] = useState('');

  const updateAutomationPreference = (updates: Partial<typeof preferences>) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    try {
      saveWorkspacePreferences(next);
      setSaveError('');
    } catch (error) {
      console.error('Could not save automation preferences.', error);
      setSaveError('Could not save this preference. Check browser storage permissions.');
    }
  };

  const workflowSteps = [
    { stepNumber: 1, title: 'DISCOVER', description: 'Semantic clustering of AI trends and tech velocity spikes', status: 'completed' as const, icon: Radio },
    { stepNumber: 2, title: 'RESEARCH', description: 'Fact retrieval from ArXiv, TechCrunch & GitHub', status: 'completed' as const, icon: Search },
    { stepNumber: 3, title: 'WRITE', description: 'Dynamic prompt compilation with platform rules & voice', status: 'completed' as const, icon: PenTool },
    { stepNumber: 4, title: 'DESIGN', description: 'Visual Studio generates 3D asset matching copy narrative', status: 'completed' as const, icon: ImageIcon },
    { stepNumber: 5, title: 'CHECK', description: '5-point AI quality & hallucination verification', status: 'active' as const, icon: ShieldCheck },
    { stepNumber: 6, title: 'APPROVE', description: 'Human sign-off routing in Approval Queue', status: 'pending' as const, icon: CheckSquare },
    { stepNumber: 7, title: 'PUBLISH', description: 'Direct API dispatch to LinkedIn & Instagram', status: 'pending' as const, icon: Send },
    { stepNumber: 8, title: 'ANALYZE', description: 'Engagement metrics ingestion & feedback loop', status: 'pending' as const, icon: BarChart3 },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* ── Hero Control Header ────────────────────────────────────── */}
      {saveError && <p role="alert" className="text-sm text-rose-300">{saveError}</p>}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.07]">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            AUTONOMOUS CONTENT ENGINE
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Automation Engine
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Local workflow preview only. No background jobs run and no posts are scheduled or published.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={preferences.automationEnabled ? 'primary' : 'outline'}
            size="md"
            icon={preferences.automationEnabled ? Pause : Play}
            onClick={() => updateAutomationPreference({ automationEnabled: !preferences.automationEnabled })}
          >
            {preferences.automationEnabled ? 'Turn preference off' : 'Turn preference on'}
          </Button>
        </div>
      </div>

      {/* ── Execution Status Overview ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="editorial-card rounded-2xl p-5 border border-white/10 space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Preview Status</p>
          <p className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${preferences.automationEnabled ? 'bg-amber-400' : 'bg-slate-500'}`} />
          {preferences.automationEnabled ? 'Preference enabled' : 'Preference off'}
          </p>
        </div>

        <div className="editorial-card rounded-2xl p-5 border border-white/10 space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Execution Schedule</p>
          <p className="text-xl font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            Preference only
          </p>
        </div>

        <div className="editorial-card rounded-2xl p-5 border border-white/10 space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Next Scheduled Run</p>
          <p className="text-xl font-bold text-indigo-300">
            {new Date(`2000-01-01T${preferences.postingTime}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        <div className="editorial-card rounded-2xl p-5 border border-white/10 space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Execution History</p>
          <p className="text-xl font-bold text-slate-300">No jobs executed</p>
        </div>
      </div>

      {/* ── Visual 8-Step Workflow Pipeline ────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Pipeline Architecture Flow
          </h3>
          <span className="text-xs font-mono text-slate-500">8 illustrative stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {workflowSteps.map((step) => (
            <WorkflowStep
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              description={step.description}
              status={step.status}
              icon={step.icon}
            />
          ))}
        </div>
      </div>

      {/* ── Mode & Execution Configuration ─────────────────────────── */}
      <div className="editorial-card rounded-2xl p-6 md:p-8 border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-white/[0.06]">
          Autonomous Safety & Publishing Mode
        </h3>
        <label className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-400" /> Preferred posting time</span>
          <input
            type="time"
            aria-label="Preferred posting time"
            value={preferences.postingTime}
            onChange={(event) => updateAutomationPreference({ postingTime: event.target.value })}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setMode('draft_only')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              mode === 'draft_only'
                ? 'bg-indigo-950/30 border-indigo-500'
                : 'bg-slate-900/60 border-white/[0.06] hover:border-white/20'
            }`}
          >
            <span className="font-mono text-xs font-bold text-indigo-400 block mb-1">MODE 01</span>
            <h4 className="text-sm font-bold text-white mb-1">Draft Only</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates topic research and creates draft briefs in Content Studio without scheduling.
            </p>
          </div>

          <div
            onClick={() => setMode('approval_required')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              mode === 'approval_required'
                ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50'
                : 'bg-slate-900/60 border-white/[0.06] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs font-bold text-indigo-400">MODE 02</span>
              <Badge variant="purple" size="sm">Recommended</Badge>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Approval Required</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI writes copy and generates visuals, then routes to Approval Queue for human sign-off before publishing.
            </p>
          </div>

          <div
            onClick={() => setMode('auto_publish')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              mode === 'auto_publish'
                ? 'bg-indigo-950/30 border-indigo-500'
                : 'bg-slate-900/60 border-white/[0.06] hover:border-white/20'
            }`}
          >
            <span className="font-mono text-xs font-bold text-indigo-400 block mb-1">MODE 03</span>
            <h4 className="text-sm font-bold text-white mb-1">Autonomous Auto-Publish</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Display-only mode selector. Auto-publishing requires social OAuth and a backend worker, neither of which is configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
