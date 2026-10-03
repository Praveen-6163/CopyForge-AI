import React, { useState } from 'react';
import {
  BarChart2, TrendingUp, Heart, MessageCircle, Share2, Eye,
  Linkedin, Instagram, Award, Info
} from 'lucide-react';
import {
  StatCard, GlassCard, SectionHeader, Badge, PageWrapper, PlatformBadge
} from '../components/ui';
import { DEMO_ANALYTICS } from '../services/platformData';

// Simple bar chart using divs (no external chart library needed)
const BarChart: React.FC<{ data: { day: string; linkedin: number; instagram: number }[] }> = ({ data }) => {
  const max = Math.max(...data.flatMap(d => [d.linkedin, d.instagram]));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map(d => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5 w-full justify-center h-32">
            <div
              className="w-3 rounded-t bg-blue-500/70 hover:bg-blue-400 transition-all"
              style={{ height: `${(d.linkedin / max) * 100}%` }}
              title={`LinkedIn: ${d.linkedin}`}
            />
            <div
              className="w-3 rounded-t bg-pink-500/70 hover:bg-pink-400 transition-all"
              style={{ height: `${(d.instagram / max) * 100}%` }}
              title={`Instagram: ${d.instagram}`}
            />
          </div>
          <span className="text-[10px] text-slate-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const data = DEMO_ANALYTICS;

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          </div>
          <p className="text-sm text-slate-400">Content performance and engagement insights</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400">Demo Analytics</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label="Posts Published" value={data.postsPublished} icon={Eye} iconBg="bg-brand-500/15" trend={{ value: 12, label: 'this month' }} />
        <StatCard label="Engagement Rate" value={`${data.engagementRate}%`} icon={TrendingUp} iconBg="bg-emerald-500/15" trend={{ value: 2.1, label: '' }} />
        <StatCard label="Total Likes" value={data.totalLikes.toLocaleString()} icon={Heart} iconBg="bg-rose-500/15" />
        <StatCard label="Comments" value={data.totalComments.toLocaleString()} icon={MessageCircle} iconBg="bg-blue-500/15" />
        <StatCard label="Shares" value={data.totalShares.toLocaleString()} icon={Share2} iconBg="bg-purple-500/15" />
        <StatCard label="Link Clicks" value={data.totalClicks.toLocaleString()} icon={BarChart2} iconBg="bg-cyan-500/15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Weekly Chart */}
        <GlassCard className="p-5 xl:col-span-2">
          <SectionHeader title="Weekly Engagement" subtitle="LinkedIn vs Instagram reach" icon={BarChart2} demoLabel />
          <BarChart data={data.weeklyData} />
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-sm bg-blue-500/70" /> LinkedIn
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-sm bg-pink-500/70" /> Instagram
            </div>
          </div>
        </GlassCard>

        {/* Platform Comparison */}
        <GlassCard className="p-5">
          <SectionHeader title="Platform Breakdown" subtitle="Performance by channel" demoLabel />
          <div className="space-y-5">
            {/* LinkedIn */}
            <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">LinkedIn</span>
              </div>
              {[
                { label: 'Posts', value: data.byPlatform.linkedin.posts },
                { label: 'Engagement', value: `${data.byPlatform.linkedin.engagement}%` },
                { label: 'Reach', value: `${(data.byPlatform.linkedin.reach / 1000).toFixed(0)}K` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs py-1.5 border-b border-blue-500/10 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-blue-300 font-semibold">{value}</span>
                </div>
              ))}
            </div>

            {/* Instagram */}
            <div className="p-4 rounded-xl bg-pink-500/8 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-semibold text-pink-300">Instagram</span>
              </div>
              {[
                { label: 'Posts', value: data.byPlatform.instagram.posts },
                { label: 'Engagement', value: `${data.byPlatform.instagram.engagement}%` },
                { label: 'Reach', value: `${(data.byPlatform.instagram.reach / 1000).toFixed(1)}K` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs py-1.5 border-b border-pink-500/10 last:border-0">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-pink-300 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Best Performing */}
      <GlassCard className="p-5">
        <SectionHeader
          title="Best Performing Content"
          subtitle="Your top posts by engagement"
          icon={Award}
          demoLabel
        />
        {data.topPerforming.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No published posts yet. Content performance will appear here.</p>
        ) : (
          <div className="space-y-3">
            {data.topPerforming.map(post => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                <PlatformBadge platform={post.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{post.topic}</p>
                  <p className="text-xs text-slate-500">{post.contentType}</p>
                </div>
                {post.engagementData && (
                  <div className="flex items-center gap-4 text-xs flex-shrink-0">
                    <span className="flex items-center gap-1 text-rose-400"><Heart className="w-3.5 h-3.5" />{post.engagementData.likes}</span>
                    <span className="flex items-center gap-1 text-blue-400"><MessageCircle className="w-3.5 h-3.5" />{post.engagementData.comments}</span>
                    <span className="flex items-center gap-1 text-emerald-400"><Share2 className="w-3.5 h-3.5" />{post.engagementData.shares}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* AI Insights */}
      <GlassCard className="p-5 mt-6">
        <SectionHeader title="AI-Generated Insights" subtitle="Automated content performance analysis" demoLabel />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Best posting time', value: '9–11 AM IST', insight: 'Weekday mornings show 40% higher engagement on LinkedIn' },
            { label: 'Top content type', value: 'AI News', insight: 'News & educational posts generate 3× more comments' },
            { label: 'Optimal post length', value: '200–350 words', insight: 'Medium-length posts outperform short-form by 28%' },
          ].map(({ label, value, insight }) => (
            <div key={label} className="p-4 rounded-xl bg-slate-900/60 border border-brand-500/20">
              <p className="text-[10px] text-brand-400 uppercase font-semibold tracking-wider mb-1">{label}</p>
              <p className="text-base font-bold text-white mb-1.5">{value}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </PageWrapper>
  );
};
