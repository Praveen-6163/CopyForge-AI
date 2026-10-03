import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Instagram
} from 'lucide-react';
import { Button, PlatformBadge, PostStatusBadge, Tabs } from '../components/ui';
import { PostStatus, ScheduledPost } from '../types/platform';
import { getScheduledPosts } from '../services/scheduledPosts';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  topic: string;
  platform: 'linkedin' | 'instagram';
  status: PostStatus;
  thumbnail?: string;
  hook: string;
  dateLabel?: string;
}

const SCHEDULED_ITEMS: CalendarEvent[] = [
  {
    id: '1',
    day: 4,
    time: '09:00 AM',
    topic: 'Reasoning Models Scaling Laws',
    platform: 'linkedin',
    status: 'scheduled',
    thumbnail: '/assets/trend_radar_art.jpg',
    hook: 'Why test-time compute is changing software economics in 2026...',
  },
  {
    id: '2',
    day: 6,
    time: '05:30 PM',
    topic: 'Autonomous Multi-Agent Systems',
    platform: 'instagram',
    status: 'awaiting_approval',
    thumbnail: '/assets/ai_agent_sculpture.jpg',
    hook: '3 patterns every developer must know before building AI agents 🤖',
  },
  {
    id: '3',
    day: 9,
    time: '11:15 AM',
    topic: 'Spec-Driven Agentic Coding',
    platform: 'linkedin',
    status: 'draft',
    hook: 'The shift from code-writing to spec-authoring: how engineering roles evolve.',
  },
  {
    id: '4',
    day: 12,
    time: '02:00 PM',
    topic: 'CopyForge AI Platform Launch',
    platform: 'linkedin',
    status: 'scheduled',
    thumbnail: '/assets/hero_ai_pulse.jpg',
    hook: 'Introducing CopyForge AI: Turn product ideas into platform-ready marketing copy.',
  },
  {
    id: '5',
    day: 15,
    time: '04:00 PM',
    topic: 'Local AI & On-Device Small Models',
    platform: 'instagram',
    status: 'draft',
    hook: 'Zero cloud latency: the revolution of on-device quantized models 📱',
  },
];

export const ContentCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const currentMonth = 'October 2026';
  const [localSchedules] = useState<ScheduledPost[]>(getScheduledPosts);

  const savedEvents: CalendarEvent[] = localSchedules.map((post) => {
    const date = new Date(post.scheduledAt);
    return {
      id: post.id,
      day: date.getDate(),
      time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      topic: post.topic,
      platform: post.platform,
      status: post.status,
      thumbnail: post.imageUrl,
      hook: post.content,
      dateLabel: date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  });
  const calendarEvents = [...savedEvents, ...SCHEDULED_ITEMS];
  const filterTabs = [
    { id: 'all', label: 'All Events', count: calendarEvents.length },
    { id: 'scheduled', label: 'Scheduled', count: calendarEvents.filter((event) => event.status === 'scheduled').length },
    { id: 'awaiting_approval', label: 'In Approval', count: calendarEvents.filter((event) => event.status === 'awaiting_approval').length },
    { id: 'draft', label: 'Drafts', count: calendarEvents.filter((event) => event.status === 'draft').length },
  ];

  const filteredEvents = calendarEvents.filter(e =>
    selectedStatus === 'all' || e.status === selectedStatus
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Calendar Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            PLANNING & EDITORIAL TIMELINE
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Content Calendar
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Example editorial items for the demo. Nothing here is scheduled for external publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 rounded-xl p-1">
            <span className="text-xs font-bold text-white px-3 font-mono">{currentMonth} · Sample</span>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/studio')}
          >
            Create Draft
          </Button>
        </div>
      </div>

      {/* ── Status Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={filterTabs}
          activeTab={selectedStatus}
          onChange={setSelectedStatus}
        />
        <span className="text-xs font-mono text-slate-500">
          Showing {filteredEvents.length} Items
        </span>
      </div>

      {/* ── Editorial Timeline Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((item) => (
          <div
            key={item.id}
            className="editorial-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center font-mono text-xs">
                    <span className="text-[9px] text-slate-500 uppercase">{item.dateLabel?.split(' ')[0] || 'OCT'}</span>
                    <span className="font-bold text-white">{item.dateLabel ? item.dateLabel.split(' ')[1]?.replace(',', '') : item.day < 10 ? `0${item.day}` : item.day}</span>
                  </div>
                  <div>
                    <PlatformBadge platform={item.platform} />
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
                <PostStatusBadge status={item.status} />
              </div>

              {item.thumbnail && (
                <div className="h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                  <img src={item.thumbnail} alt={item.topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div>
                <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                  {item.topic}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed italic">
                  "{item.hook}"
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {localSchedules.some((scheduled) => scheduled.id === item.id) ? 'Local reminder · not published' : 'Demo item · not scheduled'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/studio')}
              >
                Inspect
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
