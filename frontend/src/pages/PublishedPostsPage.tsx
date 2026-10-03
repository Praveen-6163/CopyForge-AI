import React, { useState } from 'react';
import { Send, Heart, MessageSquare, Share2, Eye, TrendingUp, Linkedin, Instagram } from 'lucide-react';
import { Badge, Button, EmptyState, PlatformBadge, Tabs } from '../components/ui';
import { DEMO_SCHEDULED_POSTS } from '../services/platformData';

export const PublishedPostsPage: React.FC = () => {
  const [platformTab, setPlatformTab] = useState('all');

  const published = DEMO_SCHEDULED_POSTS.filter(p => p.status === 'published' &&
    (platformTab === 'all' || p.platform === platformTab)
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            DISTRIBUTION AUDIT LOG
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Published Posts
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Audit history of distributed content with real-time engagement telemetry across channels.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'all', label: 'All Platforms' },
            { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
            { id: 'instagram', label: 'Instagram', icon: Instagram },
          ]}
          activeTab={platformTab}
          onChange={setPlatformTab}
        />
      </div>

      {published.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No published posts yet"
          description="Approved and scheduled content will appear here with live engagement counters once broadcasted."
        />
      ) : (
        <div className="space-y-6">
          {published.map(post => (
            <div key={post.id} className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PlatformBadge platform={post.platform} />
                    <Badge variant="purple">{post.contentType}</Badge>
                    <Badge variant="success" dot>Published</Badge>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{post.topic}</h3>
                  <p className="text-xs font-mono text-slate-500">
                    Broadcasted {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06]">
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">{post.content}</p>
              </div>

              {/* Engagement Metrics */}
              {post.engagementData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                  {[
                    { label: 'Likes & Reactions', value: post.engagementData.likes, icon: Heart, color: 'text-rose-400' },
                    { label: 'Comments', value: post.engagementData.comments, icon: MessageSquare, color: 'text-blue-400' },
                    { label: 'Shares', value: post.engagementData.shares, icon: Share2, color: 'text-emerald-400' },
                    { label: 'Clicks', value: post.engagementData.clicks.toLocaleString(), icon: TrendingUp, color: 'text-indigo-400' },
                    { label: 'Impressions', value: (post.engagementData.impressions / 1000).toFixed(1) + 'K', icon: Eye, color: 'text-purple-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                      <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
                      <p className={`text-base font-bold ${color}`}>{value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
