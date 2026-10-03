import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckSquare,
  Clock3,
  Linkedin,
  Radio,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button, EmptyState } from '../components/ui';
import { HealthStatus, HistoryItem } from '../types/generation';
import {
  AnalyticsSummary,
  fetchAnalytics,
  fetchPosts,
  ScheduledPost,
} from '../services/platformApi';
import { fetchHistory } from '../services/api';
import { useLinkedInStatus } from '../hooks/useLinkedInStatus';

interface DashboardPageProps {
  health: HealthStatus | null;
  onOpenHistory: (savedOnly: boolean) => void;
}

const PreviewCard: React.FC<{
  platform: 'LinkedIn' | 'Instagram';
  generation: HistoryItem | null;
  onEdit: () => void;
}> = ({ platform, generation, onEdit }) => (
  <article className="cf-preview-card">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
        {platform === 'Instagram'
          ? <span className="text-pink-300">Instagram</span>
          : <span className="text-sky-300">LinkedIn</span>}
      </div>
      <span className={`cf-status-pill ${generation ? 'cf-status-ready' : 'cf-status-empty'}`}>
        {generation ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
        {generation ? 'Generated' : 'No content'}
      </span>
    </div>
    <p className="mt-3 line-clamp-5 min-h-[6.5rem] whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
      {generation?.generated_content || 'Content you generate for this platform will appear here.'}
    </p>
    <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
      <span className="text-[11px] text-slate-500">
        {generation ? `${generation.generated_content.length} characters · ${new Date(generation.created_at).toLocaleString()}` : 'Generated content is saved to your account'}
      </span>
      <button
        type="button"
        onClick={onEdit}
        disabled={!generation}
        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-slate-600"
      >
        Open history
      </button>
    </div>
  </article>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({
  health,
  onOpenHistory,
}) => {
  const navigate = useNavigate();
  const linkedin = useLinkedInStatus();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [upcoming, setUpcoming] = useState<ScheduledPost[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [summary, posts, items] = await Promise.all([
        fetchAnalytics(),
        fetchPosts('scheduled'),
        fetchHistory(),
      ]);
      setAnalytics(summary);
      setUpcoming(posts.slice(0, 3));
      setHistory(items);
      setError('');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not load dashboard data. Verify the backend connection and account session.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const latestFor = (platform: 'LinkedIn' | 'Instagram') =>
    history.find((item) => item.platform === platform) || null;

  return (
    <main className="cf-dashboard mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 xl:p-8">
      <section className="cf-hero relative isolate overflow-hidden">
        <div className="cf-hero-glow" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl">
          <span className="cf-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Your AI content workspace</span>
          <h1 className="mt-4 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
            Create, review, and publish social content.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
            Generate platform-specific content, schedule backend jobs, and review real publishing results.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => navigate('/studio')}>
              Create content
            </Button>
            <Button variant="outline" size="lg" icon={Radio} onClick={() => navigate('/trend-radar')}>
              Open Trend Radar
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="cf-notice border-rose-500/30 bg-rose-500/10 text-rose-200">
          {error}
          {!linkedin.status?.connected && (
            <Button variant="outline" size="sm" onClick={() => navigate('/social')}>Connect LinkedIn</Button>
          )}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Account totals">
        {[
          { label: 'Published', value: analytics?.published_count, icon: Send },
          { label: 'Scheduled', value: analytics?.scheduled_count, icon: CalendarClock },
          { label: 'Awaiting approval', value: analytics?.approval_count, icon: CheckSquare },
          { label: 'LinkedIn account', value: linkedin.status?.connected ? 'Connected' : 'Not connected', icon: Linkedin },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="editorial-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Icon className="w-4 h-4 text-indigo-400" /> {label}
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{value ?? '—'}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PreviewCard
          platform="LinkedIn"
          generation={latestFor('LinkedIn')}
          onEdit={() => onOpenHistory(false)}
        />
        <PreviewCard
          platform="Instagram"
          generation={latestFor('Instagram')}
          onEdit={() => onOpenHistory(false)}
        />
      </section>

      <section className="editorial-card rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-indigo-400" /> Upcoming scheduled posts
          </h2>
          <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => navigate('/calendar')}>
            Calendar
          </Button>
        </div>
        {upcoming.length ? (
          <div className="divide-y divide-white/[0.06]">
            {upcoming.map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{post.topic || 'Scheduled post'}</p>
                  <p className="text-xs text-slate-400">{post.platform} · {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'Time pending'}</p>
                </div>
                <span className="text-xs text-indigo-300 capitalize">{post.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock3}
            title="No scheduled posts"
            description="Create a schedule or enable a recurring backend automation."
            action={<Button variant="primary" size="sm" onClick={() => navigate('/calendar')}>Open Calendar</Button>}
          />
        )}
      </section>

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" onClick={() => onOpenHistory(false)}>Content history</Button>
        <span className={`text-xs self-center ${health?.ai_configured ? 'text-emerald-300' : 'text-amber-300'}`}>
          {health?.ai_configured ? 'AI provider configured' : 'AI provider not configured'}
        </span>
      </div>
    </main>
  );
};
