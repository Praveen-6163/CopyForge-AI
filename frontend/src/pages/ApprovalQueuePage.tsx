import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  PenTool,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button, Badge, PlatformBadge, ContentPreview } from '../components/ui';

interface ApprovalItem {
  id: string;
  topic: string;
  platform: 'linkedin' | 'instagram';
  author: string;
  submittedAt: string;
  content: string;
  mediaUrl?: string;
  metrics: {
    contentQuality: number;
    sourceQuality: number;
    originality: number;
    platformFit: number;
    engagementPotential: number;
  };
  summary: string;
}

const QUEUE_ITEMS: ApprovalItem[] = [
  {
    id: '1',
    topic: 'Autonomous Multi-Agent Systems in Production',
    platform: 'linkedin',
    author: 'Autonomous AI Engine',
    submittedAt: 'Today at 06:15 AM',
    content: `Are we witnessing the end of monolithic LLM prompts in production?\n\nOver the last 6 months, engineering teams have shifted dramatically toward graph-orchestrated multi-agent networks (LangGraph, CrewAI, AutoGen).\n\nWhy this shift is accelerating:\n• Monolithic prompts hallucinate when context windows exceed 50k tokens.\n• Hierarchical subagents isolate failure domains.\n• Self-correcting reflection loops yield 94% higher code execution accuracy.\n\nIf you are designing AI architecture this quarter, treat single prompts as legacy prototypes.\n\nWhat is your team's stance on multi-agent deployments? Let's discuss in the comments.`,
    mediaUrl: '/assets/ai_agent_sculpture.jpg',
    metrics: {
      contentQuality: 98,
      sourceQuality: 94,
      originality: 96,
      platformFit: 99,
      engagementPotential: 92,
    },
    summary: 'High authority LinkedIn thought-leadership post addressing real architectural trends with verified benchmarks.',
  },
  {
    id: '2',
    topic: 'Reasoning Compute Scaling Laws',
    platform: 'instagram',
    author: 'Trend Intelligence Bot',
    submittedAt: 'Today at 08:30 AM',
    content: `Moore's Law is moving from silicon to Test-Time Compute 🧠⚡\n\nReasoning models don't just output answers—they generate dynamic verification paths that scale with problem difficulty.\n\nSwipe to explore 3 reasons why this changes AI development forever 👉\n\nLink in bio for our complete architectural breakdown.\n\n#AIResearch #GenerativeAI #DeepLearning #TechTrends`,
    mediaUrl: '/assets/trend_radar_art.jpg',
    metrics: {
      contentQuality: 92,
      sourceQuality: 90,
      originality: 88,
      platformFit: 95,
      engagementPotential: 94,
    },
    summary: 'Visual carousel copy optimized for high Instagram saves and profile link conversions.',
  },
];

export const ApprovalQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApprovalItem[]>(QUEUE_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const currentItem = items[selectedIndex];

  const handleAction = (type: 'approve' | 'reject' | 'schedule') => {
    if (!currentItem) return;
    const msg = type === 'approve' ? `Approved "${currentItem.topic}" for distribution!` :
                type === 'schedule' ? `Scheduled "${currentItem.topic}" for publication!` :
                `Rejected "${currentItem.topic}".`;
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            EDITORIAL QUALITY CONTROL
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Approval Queue
            <Badge variant="warning">{items.length} Pending Review</Badge>
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Inspect autonomous drafts, review AI quality diagnostics, and approve for multi-channel distribution.
          </p>
        </div>

        {notification && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {currentItem ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT: Content Preview (7 cols) ─────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <PlatformBadge platform={currentItem.platform} />
                  <span className="text-xs font-bold text-white">{currentItem.topic}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Submitted {currentItem.submittedAt}</span>
              </div>

              <ContentPreview
                platform={currentItem.platform}
                content={currentItem.content}
                mediaUrl={currentItem.mediaUrl}
              />

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleAction('reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={PenTool}
                    onClick={() => navigate('/studio')}
                  >
                    Edit in Studio
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Calendar}
                    onClick={() => handleAction('schedule')}
                  >
                    Schedule
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleAction('approve')}
                  >
                    Approve Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: AI Analysis & Quality Gauges (5 cols) ────────── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AI Quality Diagnostics
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Score: 96 / 100
                </span>
              </div>

              <div className="space-y-4">
                {/* Gauge 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Content Quality</span>
                    <span className="font-mono text-white font-bold">{currentItem.metrics.contentQuality}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentItem.metrics.contentQuality}%` }} />
                  </div>
                </div>

                {/* Gauge 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Source Quality & Factuality</span>
                    <span className="font-mono text-white font-bold">{currentItem.metrics.sourceQuality}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentItem.metrics.sourceQuality}%` }} />
                  </div>
                </div>

                {/* Gauge 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Originality & Non-Plagiarism</span>
                    <span className="font-mono text-white font-bold">{currentItem.metrics.originality}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${currentItem.metrics.originality}%` }} />
                  </div>
                </div>

                {/* Gauge 4 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Platform Fit & Format Compliance</span>
                    <span className="font-mono text-white font-bold">{currentItem.metrics.platformFit}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${currentItem.metrics.platformFit}%` }} />
                  </div>
                </div>

                {/* Gauge 5 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Engagement Potential</span>
                    <span className="font-mono text-white font-bold">{currentItem.metrics.engagementPotential}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${currentItem.metrics.engagementPotential}%` }} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-1.5">
                <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  AI Editorial Assessment
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentItem.summary}
                </p>
              </div>
            </div>

            {/* Queue Selector List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Other Pending Items ({items.length})
              </p>
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedIndex === idx
                      ? 'bg-indigo-950/30 border-indigo-500'
                      : 'bg-slate-900/50 border-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <PlatformBadge platform={item.platform} />
                    <span className="text-[10px] font-mono text-slate-500">{item.submittedAt}</span>
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-1">{item.topic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">All Clear! Queue is empty.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Autonomous drafts will appear here for human sign-off before publishing.
          </p>
        </div>
      )}
    </div>
  );
};
