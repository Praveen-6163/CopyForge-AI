import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Radio,
  PenTool,
  Calendar,
  CheckSquare,
  Zap,
  Activity,
  Compass,
  Layers,
  Send
} from 'lucide-react';
import { Button, TrendCard, Badge, StatCard } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const editorialTrends = [
    {
      index: '01',
      topic: 'AI Agents',
      headline: 'Autonomous multi-agent orchestration frameworks entering enterprise production',
      insight: 'LangGraph, AutoGen and CrewAI architectures are replacing monolithic LLM chains for complex software workflows.',
      source: 'TechCrunch / ArXiv',
      time: '12m ago',
      trendScore: 98,
      image: '/assets/ai_agent_sculpture.jpg',
    },
    {
      index: '02',
      topic: 'Generative AI',
      headline: 'Reasoning models redefine chain-of-thought distillation and agentic tools',
      insight: 'DeepSeek-R1 and OpenAI o3 benchmarks trigger massive community interest in open test-time compute scaling.',
      source: 'VentureBeat AI',
      time: '45m ago',
      trendScore: 94,
      image: '/assets/trend_radar_art.jpg',
    },
    {
      index: '03',
      topic: 'AI Coding',
      headline: 'Spec-driven development paired with agentic IDEs changes engineering workflows',
      insight: 'Full codebase context agents allow single engineers to design, build, and deploy full-stack platforms 10x faster.',
      source: 'GitHub Trends',
      time: '1h ago',
      trendScore: 91,
    },
    {
      index: '04',
      topic: 'Multimodal AI',
      headline: 'Real-time video and audio token stream interfaces reach mobile devices',
      insight: 'Native multimodal models enable conversational screen inspection and live voice pair-programming.',
      source: 'HuggingFace',
      time: '2h ago',
      trendScore: 89,
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* ── Top Cinematic Header ───────────────────────────────────── */}
      <div className="space-y-3">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          COPYFORGE AI
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.15]">
          Turn AI trends into content that gets noticed.
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
          Discover emerging AI topics, create platform-ready content, generate visuals and automate your social publishing workflow.
        </p>
      </div>

      {/* ── Featured "Today's AI Pulse" Hero Section (Reference Design) ── */}
      <div className="editorial-card rounded-3xl p-6 md:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5 z-10">
            <div className="space-y-1.5">
              <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider">/01</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Today's AI Pulse
              </h2>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed pt-1">
                The most relevant AI and technology conversations discovered for you.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Active Collection</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Live Feed</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Autonomous Agents & Reasoning Architectures
              </p>
              <p className="text-[11px] text-slate-500">
                14 trending topics detected across LinkedIn & X tech channels.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                iconRight={ArrowRight}
                onClick={() => navigate('/studio')}
              >
                Create with AI
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={Radio}
                onClick={() => navigate('/trend-radar')}
              >
                Open Radar
              </Button>
            </div>
          </div>

          {/* Right Column / Large Cinematic 3D Hero Artwork */}
          <div className="lg:col-span-7 relative">
            <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative group max-h-[380px] bg-slate-950">
              <img
                src="/assets/hero_ai_pulse.jpg"
                alt="Today's AI Pulse Artwork"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Editorial Pill (Like Reference Design) */}
              <div className="absolute top-4 right-4 backdrop-blur-md bg-slate-950/70 border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-white shadow-xl">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-[11px]">Explore AI Creations</span>
              </div>

              {/* Bottom Overlay Title (Like Reference Design) */}
              <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                    Shape the Future with CopyForge
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mt-0.5 line-clamp-1">
                    Turn complex research into high-converting LinkedIn and Instagram posts.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/image-studio')}
                >
                  Visual Studio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Overview ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index="01"
          label="Active Trends"
          value="28"
          icon={Radio}
          trend={{ value: 34, label: 'vs last week' }}
        />
        <StatCard
          index="02"
          label="Drafts in Queue"
          value="6"
          icon={PenTool}
          trend={{ value: 12, label: 'this week' }}
        />
        <StatCard
          index="03"
          label="Scheduled"
          value="4"
          icon={Calendar}
          subtext="Next: Tomorrow 9:00 AM"
        />
        <StatCard
          index="04"
          label="Avg Engagement"
          value="4.8%"
          icon={Activity}
          trend={{ value: 18, label: 'organic ROI' }}
        />
      </div>

      {/* ── Editorial Trend Cards (01, 02, 03, 04) ──────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider">TRENDING DISCOVERIES</span>
            <h3 className="text-xl font-bold text-white tracking-tight">Top AI Conversations Today</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => navigate('/trend-radar')}
          >
            Explore all 28 trends
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {editorialTrends.map((trend) => (
            <TrendCard
              key={trend.index}
              index={trend.index}
              topic={trend.topic}
              headline={trend.headline}
              insight={trend.insight}
              source={trend.source}
              time={trend.time}
              trendScore={trend.trendScore}
              image={trend.image}
              onSelect={() => navigate('/studio')}
            />
          ))}
        </div>
      </div>

      {/* ── Quick Workspaces Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div 
          onClick={() => navigate('/studio')}
          className="glass-card rounded-2xl p-6 cursor-pointer border border-white/[0.07] hover:border-indigo-500/40 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PenTool className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-1 flex items-center justify-between">
            Content Studio
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Write structured, platform-ready copy with dynamic prompt compilation and parameter control.
          </p>
        </div>

        <div 
          onClick={() => navigate('/image-studio')}
          className="glass-card rounded-2xl p-6 cursor-pointer border border-white/[0.07] hover:border-indigo-500/40 group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-1 flex items-center justify-between">
            Image Studio
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate 3D renders, infographics, and editorial artwork matching your written narrative.
          </p>
        </div>

        <div 
          onClick={() => navigate('/automation')}
          className="glass-card rounded-2xl p-6 cursor-pointer border border-white/[0.07] hover:border-indigo-500/40 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white mb-1 flex items-center justify-between">
            Autonomous Pipeline
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure automated topic discovery, multi-stage approval routing, and scheduled publishing.
          </p>
        </div>
      </div>
    </div>
  );
};
