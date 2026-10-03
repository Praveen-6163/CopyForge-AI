import React from 'react';
import {
  LayoutDashboard, TrendingUp, Send, CheckSquare,
  Users, Radio, Zap, BarChart2, Clock, ArrowRight,
  Linkedin, Instagram, Activity
} from 'lucide-react';
import {
  StatCard, Badge, PostStatusBadge, PlatformBadge, SectionHeader,
  GlassCard, Button, PageWrapper
} from '../components/ui';
import {
  DEMO_DASHBOARD_STATS, DEMO_TRENDS, DEMO_SCHEDULED_POSTS,
  AUTOMATION_TIMELINE
} from '../services/platformData';

const STAGE_ICONS: Record<string, React.ElementType> = {
  radar: Radio, brain: Zap, image: BarChart2, shield: CheckSquare, send: Send
};

export const DashboardPage: React.FC = () => {
  const stats = DEMO_DASHBOARD_STATS;
  const recentPosts = DEMO_SCHEDULED_POSTS.slice(0, 4);
  const topTrends = DEMO_TRENDS.slice(0, 6);

  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="w-5 h-5 text-brand-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        </div>
        <p className="text-sm text-slate-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — AI Content Intelligence Overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Posts Published" value={stats.postsPublished} icon={Send} trend={{ value: 12, label: 'this week' }} iconBg="bg-emerald-500/15" />
        <StatCard label="Posts Scheduled" value={stats.postsScheduled} icon={Clock} iconBg="bg-brand-500/15" />
        <StatCard label="Pending Approval" value={stats.pendingApproval} icon={CheckSquare} iconBg="bg-amber-500/15" />
        <StatCard label="AI Trends Found" value={stats.trendsDiscovered} icon={Radio} iconBg="bg-purple-500/15" />
        <StatCard label="Engagement Rate" value={`${stats.engagementRate}%`} icon={TrendingUp} trend={{ value: 2.1, label: '' }} iconBg="bg-cyan-500/15" />
        <StatCard label="Connected Accounts" value={stats.connectedAccounts} icon={Users} iconBg="bg-slate-700/60" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Today's Automation Timeline */}
        <GlassCard className="p-5 xl:col-span-1">
          <SectionHeader
            title="Today's Automation"
            subtitle="Daily 6:00 AM workflow"
            icon={Zap}
            demoLabel
          />
          <div className="space-y-3">
            {AUTOMATION_TIMELINE.map((step, idx) => {
              const Icon = STAGE_ICONS[step.icon] || Zap;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {idx < AUTOMATION_TIMELINE.length - 1 && (
                      <div className="w-px flex-1 bg-slate-800 my-1" />
                    )}
                  </div>
                  <div className="pb-2 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-500">{step.time}</span>
                      <Badge variant="default">{step.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Automation Status</span>
              <Badge variant="warning" dot>Disabled</Badge>
            </div>
          </div>
        </GlassCard>

        {/* Trending AI Topics */}
        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader
            title="Trending AI Topics"
            subtitle="Discovered today by AI Trend Radar"
            icon={Radio}
            demoLabel
            actions={
              <Button variant="ghost" size="xs" icon={ArrowRight}>
                View All
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topTrends.map((trend) => (
              <div
                key={trend.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-brand-300 transition-colors truncate">
                      {trend.topic}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{trend.source}</p>
                  </div>
                  {trend.trending && (
                    <Badge variant="error" dot>Hot</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">{trend.recency}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      trend.contentPotential === 'High' ? 'text-emerald-400' :
                      trend.contentPotential === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                    }`}>{trend.contentPotential} Potential</span>
                    <span className="text-brand-400 font-mono">{trend.relevanceScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <GlassCard className="p-5">
          <SectionHeader
            title="Upcoming Posts"
            subtitle="Scheduled & pending content"
            icon={Clock}
            demoLabel
            actions={
              <Button variant="ghost" size="xs" icon={ArrowRight}>View Calendar</Button>
            }
          />
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  post.platform === 'linkedin' ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-500/15 text-pink-400'
                }`}>
                  {post.platform === 'linkedin' ? <Linkedin className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{post.topic}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(post.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(post.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <PostStatusBadge status={post.status} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Social Accounts Status */}
        <GlassCard className="p-5">
          <SectionHeader
            title="Social Accounts"
            subtitle="Connected publishing channels"
            icon={Users}
          />
          <div className="space-y-4">
            {[
              { platform: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
              { platform: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/15 border-pink-500/30' },
            ].map(({ platform, icon: Icon, color, bg }) => (
              <div key={platform} className={`p-4 rounded-xl border ${bg} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{platform}</p>
                    <p className="text-xs text-slate-500">Not Connected</p>
                  </div>
                </div>
                <Badge variant="default">Not Connected</Badge>
              </div>
            ))}
            <p className="text-[11px] text-slate-600 text-center mt-2">
              Connect accounts via Social Accounts in the sidebar
            </p>
          </div>

          {/* Content Performance Mini */}
          <div className="mt-5 pt-4 border-t border-slate-800/60">
            <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-400" /> Content Performance (Demo)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Likes', value: '3.2K', color: 'text-pink-400' },
                { label: 'Comments', value: '489', color: 'text-blue-400' },
                { label: 'Shares', value: '712', color: 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </PageWrapper>
  );
};
