import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Instagram
} from 'lucide-react';
import { Button, Badge, PlatformBadge, PostStatusBadge, Tabs } from '../components/ui';
import { PostStatus } from '../types/platform';

interface CalendarEvent {
  id: string;
  day: number;
  time: string;
  topic: string;
  platform: 'linkedin' | 'instagram';
  status: PostStatus;
  thumbnail?: string;
  hook: string;
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
  const [currentMonth, setCurrentMonth] = useState('October 2026');

  const filterTabs = [
    { id: 'all', label: 'All Events', count: SCHEDULED_ITEMS.length },
    { id: 'scheduled', label: 'Scheduled', count: 2 },
    { id: 'awaiting_approval', label: 'In Approval', count: 1 },
    { id: 'draft', label: 'Drafts', count: 2 },
  ];

  const filteredEvents = SCHEDULED_ITEMS.filter(e => 
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
            Editorial publishing schedule across connected LinkedIn and Instagram channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900/90 border border-white/10 rounded-xl p-1">
            <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 font-mono">{currentMonth}</span>
            <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigate('/studio')}
          >
            New Schedule
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
                    <span className="text-[9px] text-slate-500 uppercase">OCT</span>
                    <span className="font-bold text-white">{item.day < 10 ? `0${item.day}` : item.day}</span>
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
              <span className="text-slate-500 font-mono text-[11px]">Auto-publish enabled</span>
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
