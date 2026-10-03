import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Share2,
  Eye,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { StatCard, Badge } from '../components/ui';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            AUDIENCE & PERFORMANCE INTELLIGENCE
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Analytics & ROI
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Illustrative sample metrics only. Connect publishing accounts and analytics sources to see real performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning">Sample data</Badge>
          <span className="text-xs font-mono text-slate-400">Timeframe:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white">
            Last 30 Days
          </span>
        </div>
      </div>

      {/* ── Large Metrics Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          index="01"
          label="Published"
          value="48"
          icon={Send}
          trend={{ value: 24, label: 'MoM' }}
        />
        <StatCard
          index="02"
          label="Engagement"
          value="5.2%"
          icon={TrendingUp}
          trend={{ value: 18, label: 'rate' }}
        />
        <StatCard
          index="03"
          label="Total Reach"
          value="184k"
          icon={Eye}
          trend={{ value: 42, label: 'impressions' }}
        />
        <StatCard
          index="04"
          label="Link Clicks"
          value="3,420"
          icon={ArrowUpRight}
          trend={{ value: 31, label: 'CTR' }}
        />
        <StatCard
          index="05"
          label="Comments"
          value="892"
          icon={MessageSquare}
          trend={{ value: 15, label: 'replies' }}
        />
        <StatCard
          index="06"
          label="Shares & Reposts"
          value="640"
          icon={Share2}
          trend={{ value: 28, label: 'virality' }}
        />
      </div>

      {/* ── Visual Performance Breakdowns ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Platform Performance (6 cols) */}
        <div className="lg:col-span-6 editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-white/[0.06]">
            Platform Performance Distribution
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-400">💼 LinkedIn (Professional Thought Leadership)</span>
                <span className="font-mono text-white font-bold">128.4k Reach (70%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-[11px] text-slate-400">Average 32 comments per post • Highest conversion to pipeline.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-pink-400">📸 Instagram (Visual Carousels & Reels)</span>
                <span className="font-mono text-white font-bold">55.6k Reach (30%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: '30%' }} />
              </div>
              <p className="text-[11px] text-slate-400">Average 410 saves per carousel • High profile visitor velocity.</p>
            </div>
          </div>
        </div>

        {/* Best Posting Time & Velocity (6 cols) */}
        <div className="lg:col-span-6 editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-white/[0.06] flex items-center justify-between">
            <span>Optimal Distribution Windows</span>
            <span className="text-[11px] font-mono text-indigo-400">AI Predictive</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
              <p className="text-slate-400 uppercase font-mono text-[10px]">Peak LinkedIn Window</p>
              <p className="text-base font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Tue & Thu • 08:30 AM
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">+3.8x higher engagement</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
              <p className="text-slate-400 uppercase font-mono text-[10px]">Peak Instagram Window</p>
              <p className="text-base font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-400" />
                Mon & Wed • 06:15 PM
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">+2.9x higher saves</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Audience Insights ───────────────────────────────────── */}
      <div className="editorial-card rounded-2xl p-6 md:p-8 border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-white/[0.06] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Editorial Recommendations & Growth Vectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
            <p className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
              ✦ What your audience is responding to
            </p>
            <p className="text-slate-200 leading-relaxed">
              Posts containing <strong>concrete architectural breakdowns</strong> (e.g. multi-agent graph topologies vs prompt chaining) receive <strong>3.2x more comments from Senior Engineers and Founders</strong> than generic high-level summaries.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
            <p className="font-mono text-indigo-400 font-bold uppercase text-[11px]">
              ✦ Topics worth exploring next
            </p>
            <p className="text-slate-200 leading-relaxed">
              <strong>"Local quantized SLMs running on Apple Silicon"</strong> and <strong>"Test-time compute scaling laws"</strong> show high search momentum with low competitor saturation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
