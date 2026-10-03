import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Linkedin, Instagram, Filter } from 'lucide-react';
import { SectionHeader, GlassCard, PostStatusBadge, Badge, Button, PageWrapper } from '../components/ui';
import { DEMO_SCHEDULED_POSTS } from '../services/platformData';
import { PostStatus, SocialPlatform } from '../types/platform';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_FILTERS: PostStatus[] = ['draft', 'awaiting_approval', 'scheduled', 'published', 'failed'];

export const ContentCalendarPage: React.FC = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getPostsForDay = (day: number) => {
    return DEMO_SCHEDULED_POSTS.filter(post => {
      const d = new Date(post.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day &&
        (platformFilter === 'all' || post.platform === platformFilter) &&
        (statusFilter === 'all' || post.status === statusFilter);
    });
  };

  const filteredPosts = DEMO_SCHEDULED_POSTS.filter(post =>
    (platformFilter === 'all' || post.platform === platformFilter) &&
    (statusFilter === 'all' || post.status === statusFilter)
  );

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Content Calendar</h1>
          </div>
          <p className="text-sm text-slate-400">View and manage your scheduled content pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            {(['month', 'week'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  viewMode === mode ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Platform:</span>
          {(['all', 'linkedin', 'instagram'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize ${
                platformFilter === p ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
              }`}
            >
              {p === 'linkedin' ? '💼' : p === 'instagram' ? '📸' : ''} {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_FILTERS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <GlassCard className="p-5 xl:col-span-2">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-white">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-500 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-lg" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const posts = getPostsForDay(day);
              return (
                <div
                  key={day}
                  className={`h-20 rounded-lg border p-1.5 transition-all ${
                    isToday
                      ? 'bg-brand-500/10 border-brand-500/40'
                      : 'border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[11px] font-semibold block mb-1 ${isToday ? 'text-brand-300' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5 overflow-hidden">
                    {posts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium ${
                          post.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                        }`}
                      >
                        {post.platform === 'linkedin' ? '💼' : '📸'} {post.topic.substring(0, 12)}...
                      </div>
                    ))}
                    {posts.length > 2 && (
                      <div className="text-[9px] text-slate-500 px-1">+{posts.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Post List Panel */}
        <div className="space-y-4">
          <GlassCard className="p-4">
            <p className="text-xs font-semibold text-slate-300 mb-3">All Content ({filteredPosts.length})</p>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredPosts.map(post => (
                <div key={post.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    {post.platform === 'linkedin'
                      ? <Linkedin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      : <Instagram className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                    }
                    <p className="text-xs font-semibold text-slate-200 truncate flex-1">{post.topic}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(post.scheduledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                    <PostStatusBadge status={post.status} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};
