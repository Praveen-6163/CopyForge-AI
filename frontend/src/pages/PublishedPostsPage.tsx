import React, { useState } from 'react';
import { Send, Heart, MessageCircle, Share2, Eye, TrendingUp, Linkedin, Instagram } from 'lucide-react';
import {
  SectionHeader, GlassCard, Badge, Button, EmptyState,
  PlatformBadge, PageWrapper, Tabs
} from '../components/ui';
import { DEMO_SCHEDULED_POSTS } from '../services/platformData';

export const PublishedPostsPage: React.FC = () => {
  const [platformTab, setPlatformTab] = useState('all');

  const published = DEMO_SCHEDULED_POSTS.filter(p => p.status === 'published' &&
    (platformTab === 'all' || p.platform === platformTab)
  );

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Published Posts</h1>
          </div>
          <p className="text-sm text-slate-400">Track your published content and performance</p>
        </div>
      </div>

      <div className="mb-5">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Platforms' },
            { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
            { id: 'instagram', label: 'Instagram', icon: Instagram },
          ]}
          active={platformTab}
          onChange={setPlatformTab}
        />
      </div>

      {published.length === 0 ? (
        <GlassCard className="p-8">
          <EmptyState
            icon={Send}
            title="No published posts yet"
            description="Approved and published content will appear here with engagement metrics."
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {published.map(post => (
            <GlassCard key={post.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <PlatformBadge platform={post.platform} />
                    <Badge variant="purple">{post.contentType}</Badge>
                    <Badge variant="success" dot>Published</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1">{post.topic}</h3>
                  <p className="text-xs text-slate-500">
                    Published {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 mb-4">
                <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">{post.content}</p>
              </div>

              {/* Engagement Metrics */}
              {post.engagementData && (
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: 'Likes', value: post.engagementData.likes, icon: Heart, color: 'text-rose-400' },
                    { label: 'Comments', value: post.engagementData.comments, icon: MessageCircle, color: 'text-blue-400' },
                    { label: 'Shares', value: post.engagementData.shares, icon: Share2, color: 'text-emerald-400' },
                    { label: 'Clicks', value: post.engagementData.clicks.toLocaleString(), icon: TrendingUp, color: 'text-brand-400' },
                    { label: 'Impressions', value: (post.engagementData.impressions / 1000).toFixed(1) + 'K', icon: Eye, color: 'text-purple-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5`} />
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
