import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Flame,
  Globe,
  Share2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button, Badge, Card, Input, Tabs } from '../components/ui';

interface TrendItem {
  id: string;
  index: string;
  topic: string;
  headline: string;
  summary: string;
  source: string;
  category: string;
  publishedTime: string;
  trendScore: number;
  growth: string;
  contentPotential: 'Viral' | 'High' | 'Solid';
  suggestedAngle: string;
  image?: string;
}

const TREND_DATA: TrendItem[] = [
  {
    id: '1',
    index: '01',
    topic: 'Reasoning & Test-Time Compute',
    headline: 'Open-weight reasoning models challenge proprietary benchmarks in mathematical logic',
    summary: 'Test-time compute scaling laws demonstrate that dynamic chain-of-thought verification achieves parity with massive frontier models at 1/10th inference cost.',
    source: 'ArXiv / OpenAI Research',
    category: 'Research',
    publishedTime: '18m ago',
    trendScore: 99,
    growth: '+142%',
    contentPotential: 'Viral',
    suggestedAngle: 'Break down why test-time compute is the new Moore\'s Law for AI engineers and founders.',
    image: '/assets/trend_radar_art.jpg'
  },
  {
    id: '2',
    index: '02',
    topic: 'Autonomous Multi-Agent Frameworks',
    headline: 'Enterprises shift from monolithic prompts to graph-orchestrated autonomous subagents',
    summary: 'Production deployments of hierarchical multi-agent networks are handling end-to-end data auditing, customer support escalations, and automated PR generation.',
    source: 'TechCrunch Enterprise',
    category: 'Engineering',
    publishedTime: '42m ago',
    trendScore: 96,
    growth: '+94%',
    contentPotential: 'High',
    suggestedAngle: '3 architectural patterns every engineering team needs before building multi-agent systems.',
    image: '/assets/ai_agent_sculpture.jpg'
  },
  {
    id: '3',
    index: '03',
    topic: 'Local AI & Small Language Models (SLMs)',
    headline: 'Sub-3B parameter quantized models achieve real-time on-device semantic routing',
    summary: 'Apple M4 and Qualcomm Snapdragon NPU optimizations allow private zero-latency local tool dispatch without sending sensitive data to cloud providers.',
    source: 'HackerNews / HuggingFace',
    category: 'Hardware & Edge',
    publishedTime: '1h ago',
    trendScore: 92,
    growth: '+68%',
    contentPotential: 'High',
    suggestedAngle: 'Why on-device privacy is the hidden catalyst for mainstream enterprise AI adoption in 2026.',
  },
  {
    id: '4',
    index: '04',
    topic: 'AI Voice & Conversational Latency',
    headline: 'Sub-200ms conversational audio streaming reaches consumer mobile apps',
    summary: 'Full-duplex audio models eliminate latency between speech input and generated response, creating human-like conversational fluidity.',
    source: 'VentureBeat AI',
    category: 'Multimodal',
    publishedTime: '2h ago',
    trendScore: 88,
    growth: '+52%',
    contentPotential: 'Solid',
    suggestedAngle: 'How sub-200ms latency transforms voice AI from novelty to indispensable daily assistant.',
  },
  {
    id: '5',
    index: '05',
    topic: 'Spec-Driven Agentic Coding',
    headline: 'Engineers adopt specification-first development workflows with autonomous pair-programmers',
    summary: 'Writing comprehensive architectural specs and test suites is becoming the primary human role, while AI agents implement and verify the code.',
    source: 'GitHub Insights',
    category: 'Engineering',
    publishedTime: '3h ago',
    trendScore: 86,
    growth: '+44%',
    contentPotential: 'High',
    suggestedAngle: 'The shift from code-writing to spec-authoring: how the software engineer role is evolving.',
  },
];

export const TrendRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    { id: 'all', label: 'All Topics', count: TREND_DATA.length },
    { id: 'Research', label: 'Research & Science' },
    { id: 'Engineering', label: 'Engineering & Code' },
    { id: 'Hardware & Edge', label: 'Edge & Local AI' },
    { id: 'Multimodal', label: 'Multimodal & Audio' },
  ];

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredTrends = TREND_DATA.filter(t => {
    const matchesSearch = t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.headline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* ── Editorial Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.07]">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            INTELLIGENCE DISCOVERY ENGINE
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Trend Radar
          </h1>
          <Badge variant="warning">Bundled sample topics</Badge>
          <p className="text-sm text-slate-400 max-w-xl">
            Explore example AI topics and draft them in the studio. Live trend sources are not configured in this demo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            loading={isRefreshing}
            onClick={handleRefresh}
          >
            Reset Sample Feed
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            onClick={() => navigate('/studio')}
          >
            Open Content Studio
          </Button>
        </div>
      </div>

      {/* ── Sample Radar Hero Visual Section ───────────────────────── */}
      <div className="editorial-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-semibold text-indigo-300 uppercase tracking-widest">
                SAMPLE TOPIC DATASET
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              High-Velocity Topic: Reasoning & Test-Time Compute
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
              Illustrative example topic and trend metrics. No live sources are connected to this demo.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Sample Trend Score</p>
                <p className="text-lg font-bold text-emerald-400">99 / 100</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Sample Rank</p>
                <p className="text-lg font-bold text-indigo-400">#1 Top Tech</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Best Format</p>
                <p className="text-lg font-bold text-white">LinkedIn Insight</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative group bg-slate-950">
              <img
                src="/assets/trend_radar_art.jpg"
                alt="AI Radar Visualization"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-center">
                <span className="text-xs font-mono text-indigo-300 font-semibold">Example topic artwork</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={categories}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
          className="w-full md:w-auto"
        />

        <div className="w-full md:w-72">
          <Input
            placeholder="Search discovered topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!py-2"
          />
        </div>
      </div>

      {/* ── Trending Now: Large Editorial Cards Layout ─────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            TRENDING NOW
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {filteredTrends.length} Verified Topics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrends.map((trend) => (
            <div
              key={trend.id}
              className="editorial-card rounded-2xl p-7 relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400">/{trend.index}</span>
                    <Badge variant="purple" size="sm">{trend.category}</Badge>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">{trend.growth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{trend.trendScore}%</span>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {trend.headline}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {trend.summary}
                </p>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] mb-5">
                  <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    ✦ Suggested Editorial Angle
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "{trend.suggestedAngle}"
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{trend.source}</span>
                  <span>•</span>
                  <span>{trend.publishedTime}</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => navigate('/studio')}
                >
                  Draft in Studio
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
