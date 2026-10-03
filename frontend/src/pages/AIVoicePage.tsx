import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Eye,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { Button, Badge, Card, Input } from '../components/ui';

export const AIVoicePage: React.FC = () => {
  const [writingStyle, setWritingStyle] = useState('First-principles, authoritative yet conversational, concise bullet insights with actionable takeaways.');
  const [tone, setTone] = useState('Professional & Visionary');
  const [targetAudience, setTargetAudience] = useState('AI Engineers, Technical Founders, SaaS Operators');
  const [primaryTopics, setPrimaryTopics] = useState('Autonomous Agents, Reasoning Models, Spec-Driven Development, Edge AI');
  const [preferredCTA, setPreferredCTA] = useState('Ask an open architectural question to spark discussion in comments.');
  const [preferredHashtags, setPreferredHashtags] = useState('#GenerativeAI #AIEngineering #TechTrends #SoftwareArchitecture');
  const [wordsToAvoid, setWordsToAvoid] = useState('delve, game-changer, revolutionary, unlock, leverage, synergy');

  const [sampleOutput, setSampleOutput] = useState(`Most AI benchmarks measure raw pre-training memorization.\n\nIn real production environments, that's almost meaningless.\n\nWhat actually separates high-performing AI systems today:\n1. Test-time reasoning compute scaling\n2. Deterministic tool verification loops\n3. Clean architectural boundaries between subagents\n\nIf your team is evaluating models this quarter, stop looking at static MMLU scores. Benchmark against multi-step failure recovery instead.\n\nHow is your engineering team testing model reliability in production?`);

  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerateSample = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            BRAND PERSONALIZATION MATRIX
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Teach CopyForge how you write.
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Define your distinct vocabulary, sentence rhythms, and anti-cliché filters to guarantee every draft sounds authentically human.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSave}
          >
            {savedSuccess ? 'Voice Profile Saved!' : 'Save Voice Profile'}
          </Button>
        </div>
      </div>

      {/* ── Split Profile Matrix ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT: Voice Parameters Form (7 cols) ─────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Mic className="w-4 h-4 text-indigo-400" />
              Voice Attributes
            </h3>

            {/* Writing Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Writing Style & Syntax Philosophy
              </label>
              <textarea
                rows={2}
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Tone & Audience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Default Tone
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Persona
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Primary Topics */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Core Domains & Topics
              </label>
              <input
                type="text"
                value={primaryTopics}
                onChange={(e) => setPrimaryTopics(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Preferred CTA */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Preferred Call to Action (CTA)
              </label>
              <input
                type="text"
                value={preferredCTA}
                onChange={(e) => setPreferredCTA(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Preferred Hashtags Cluster
              </label>
              <input
                type="text"
                value={preferredHashtags}
                onChange={(e) => setPreferredHashtags(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Negative Terms / Words to Avoid */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Words to Avoid (Negative Filter)
                </label>
                <span className="text-[10px] font-mono text-rose-400">Strictly Filtered</span>
              </div>
              <input
                type="text"
                value={wordsToAvoid}
                onChange={(e) => setWordsToAvoid(e.target.value)}
                className="w-full bg-slate-900/90 border border-rose-500/30 rounded-xl px-4 py-2 text-xs text-rose-200 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Live Voice Preview (5 cols) ───────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Your AI voice preview
              </h3>
              <Button
                variant="primary"
                size="sm"
                icon={Sparkles}
                loading={isGenerating}
                onClick={handleGenerateSample}
              >
                Generate Sample
              </Button>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-white/[0.08] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {sampleOutput}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-400">Voice Match Confidence</span>
              <span className="font-mono text-emerald-400 font-bold">99.4% Human Parity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
