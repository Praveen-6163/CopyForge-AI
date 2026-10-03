import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  Check,
  Clock3,
  Instagram,
  Linkedin,
  LockKeyhole,
  PenLine,
  Radio,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { GenerationResponse, HealthStatus } from '../types/generation';
import { scheduleGeneration } from '../services/scheduledPosts';
import { getWorkspacePreferences, saveWorkspacePreferences, WorkspacePreferences } from '../services/workspacePreferences';
import { useLinkedInStatus } from '../hooks/useLinkedInStatus';

interface DashboardPageProps {
  health: HealthStatus | null;
  generation: GenerationResponse | null;
  isGenerating: boolean;
  dashboardContent: { linkedin: GenerationResponse | null; instagram: GenerationResponse | null };
  onGenerate: () => Promise<void>;
  onEditContent: (generation: GenerationResponse) => void;
  onOpenHistory: (savedOnly: boolean) => void;
}

const SAMPLE_TOPIC = {
  title: 'AI agents are changing how teams work',
  description: 'A ready-to-edit idea for your next post. Create content to turn it into a platform-specific draft.',
  image: '/assets/ai_agent_sculpture.jpg',
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const PreviewCard: React.FC<{
  platform: 'LinkedIn' | 'Instagram';
  generation: GenerationResponse | null;
  onEdit: () => void;
}> = ({ platform, generation, onEdit }) => {
  const isInstagram = platform === 'Instagram';
  const content = generation?.generated_content || SAMPLE_TOPIC.description;

  return (
    <article className="cf-preview-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          {isInstagram
            ? <Instagram className="h-4 w-4 text-pink-300" />
            : <Linkedin className="h-4 w-4 text-sky-300" />}
          {platform} preview
        </div>
        <span className={`cf-status-pill ${generation ? 'cf-status-ready' : 'cf-status-sample'}`}>
          {generation ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          {generation ? 'Ready' : 'Sample'}
        </span>
      </div>
      <p className="mt-3 line-clamp-5 min-h-[6.5rem] whitespace-pre-wrap text-xs leading-relaxed text-slate-300">
        {content}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3">
        <span className="text-[11px] text-slate-500">
          {generation ? `${generation.formatted_content.char_count} characters` : 'Generate to personalize'}
        </span>
        <button
          type="button"
          onClick={onEdit}
          disabled={!generation}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 transition hover:text-white disabled:cursor-not-allowed disabled:text-slate-600"
        >
          <PenLine className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
    </article>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  health,
  generation,
  isGenerating,
  dashboardContent,
  onGenerate,
  onEditContent,
  onOpenHistory,
}) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<WorkspacePreferences>(getWorkspacePreferences);
  const [notice, setNotice] = useState('');
  const [scheduledNotice, setScheduledNotice] = useState('');
  const linkedin = useLinkedInStatus();
  const linkedinGeneration = generation?.platform === 'LinkedIn' ? generation : dashboardContent.linkedin;
  const instagramGeneration = generation?.platform === 'Instagram' ? generation : dashboardContent.instagram;

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const updatePreferences = (next: WorkspacePreferences) => {
    setPreferences(next);
    try {
      saveWorkspacePreferences(next);
    } catch (error) {
      console.error('Could not save automation settings.', error);
      setNotice('Could not save this setting. Check browser storage permissions.');
    }
  };

  const editGeneration = (item: GenerationResponse | null) => {
    if (!item) return;
    onEditContent(item);
  };

  const schedulePosts = () => {
    const posts = [linkedinGeneration, instagramGeneration].filter(
      (item): item is GenerationResponse => Boolean(item),
    );
    if (posts.length === 0) {
      setNotice('Create content first, then schedule it for your calendar.');
      return;
    }
    try {
      posts.forEach((item) => scheduleGeneration(item, preferences.postingTime));
      setScheduledNotice(`Saved ${posts.length} draft${posts.length === 1 ? '' : 's'} to your local calendar for the next ${formatTime(preferences.postingTime)} slot.`);
    } catch (error) {
      console.error('Could not schedule draft.', error);
      setNotice(error instanceof Error ? error.message : 'Could not schedule this draft.');
    }
  };

  const requestPublish = () => {
    setNotice('Publishing is unavailable until a social account and server-side publishing integration are connected.');
  };

  return (
    <main className="cf-dashboard mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-6 xl:p-8">
      <section className="cf-hero relative isolate overflow-hidden">
        <div className="cf-hero-glow" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="cf-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Your AI content workspace</span>
            <Badge variant={health?.engine_mode === 'backend' ? 'success' : 'warning'}>
              {health?.engine_mode === 'backend' ? 'Backend connected' : 'Demo mode'}
            </Badge>
          </div>
          <p className="mb-2 text-sm text-sky-100/75">Good morning 👋</p>
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl xl:text-[2.7rem]">
            From trending idea to <span className="text-gradient-cyan">ready-to-post content.</span>
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-300">
            Pick a trend, create platform-ready drafts, and organize your posting schedule—all from one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" icon={Sparkles} onClick={() => void onGenerate()} loading={isGenerating}>
              {isGenerating ? 'Creating content…' : 'Create content'}
            </Button>
            <Button variant="outline" size="lg" icon={Radio} onClick={() => navigate('/trend-radar')}>
              Explore trends
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="cf-step-dot">1</span> Connect accounts</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="flex items-center gap-1.5"><span className="cf-step-dot">2</span> Create a draft</span>
            <ArrowRight className="h-3 w-3 text-slate-600" />
            <span className="flex items-center gap-1.5"><span className="cf-step-dot">3</span> Schedule or publish</span>
          </div>
        </div>
        <div className="cf-hero-art" aria-hidden="true">
          <img src="/assets/ai_agent_sculpture.jpg" alt="" />
          <div className="cf-hero-art-label"><Sparkles className="h-3.5 w-3.5" /> Your content co-pilot</div>
        </div>
      </section>

      {notice && (
        <div role="status" className="cf-notice">
          <LockKeyhole className="h-4 w-4 shrink-0 text-amber-300" /> {notice}
        </div>
      )}

      <section aria-label="Accounts and automation" className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="cf-panel">
          <div className="cf-section-heading">
            <div>
              <p className="cf-eyebrow">Get connected</p>
              <h2>Your social accounts</h2>
            </div>
            <button type="button" className="cf-text-link" onClick={() => navigate('/social/linkedin')}>
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="cf-account-card" onClick={() => navigate('/social/linkedin')}>
              <span className="cf-account-icon cf-linkedin-icon"><Linkedin className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-white">LinkedIn</span>
                <span className={`mt-1 block truncate text-[11px] ${linkedin.status?.connected ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {linkedin.loading
                    ? 'Checking connection…'
                    : linkedin.status?.connected
                      ? `LinkedIn Connected · ${linkedin.status.display_name || 'Account'}`
                      : linkedin.backendUnavailable
                        ? 'Backend unavailable'
                        : linkedin.status?.configured
                          ? 'Not connected'
                          : 'LinkedIn not configured'}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
            <button type="button" className="cf-account-card" onClick={() => navigate('/social/instagram')}>
              <span className="cf-account-icon cf-instagram-icon"><Instagram className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-white">Instagram</span>
                <span className="mt-1 block text-[11px] text-amber-300">Not connected</span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Account setup opens the integration page. Social sign-in and publishing require provider credentials.
          </p>
        </div>

        <div className="cf-panel">
          <div className="cf-section-heading">
            <div>
              <p className="cf-eyebrow">Your daily workflow</p>
              <h2>Daily automation</h2>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences.automationEnabled}
              aria-label="Toggle daily automation"
              onClick={() => updatePreferences({ ...preferences, automationEnabled: !preferences.automationEnabled })}
              className={`cf-switch ${preferences.automationEnabled ? 'is-on' : ''}`}
            >
              <span />
            </button>
          </div>
          <div className="cf-automation-summary">
            <div className="cf-automation-row">
              <span><Clock3 className="h-4 w-4" /> Posting time</span>
              <label className="cf-time-input">
                <input
                  type="time"
                  aria-label="Daily posting time"
                  value={preferences.postingTime}
                  onChange={(event) => updatePreferences({ ...preferences, postingTime: event.target.value })}
                />
              </label>
            </div>
            <div className="cf-automation-row">
              <span><Radio className="h-4 w-4" /> Content source</span>
              <span className="text-right text-slate-200">AI trend ideas</span>
            </div>
            <div className="cf-automation-row">
              <span><Zap className="h-4 w-4" /> Current mode</span>
              <span className="text-right text-slate-200">
                {preferences.automationEnabled ? 'Preference enabled' : 'Off'}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            This saves your daily preference. Automatic background posting is not active until a scheduler and social integrations are configured.
          </p>
        </div>
      </section>

      <section className="cf-panel">
        <div className="cf-section-heading flex-wrap">
          <div>
            <p className="cf-eyebrow">A starting point for today</p>
            <h2>Today’s AI content</h2>
          </div>
          <button type="button" className="cf-text-link" onClick={() => navigate('/trend-radar')}>
            Browse trend radar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.85fr)_minmax(0,1.3fr)_minmax(210px,0.8fr)]">
          <article className="cf-topic-card">
            <div className="cf-topic-image">
              <img src={SAMPLE_TOPIC.image} alt="Sample AI robot visual" />
              <span>Today’s topic · sample</span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h3>{linkedinGeneration?.product_name || instagramGeneration?.product_name || SAMPLE_TOPIC.title}</h3>
              <span className="cf-score-pill"><Sparkles className="h-3 w-3" /> Idea</span>
            </div>
            <p>{linkedinGeneration?.product_description || instagramGeneration?.product_description || SAMPLE_TOPIC.description}</p>
            <button type="button" className="cf-text-link mt-3" onClick={() => navigate('/trend-radar')}>
              Find a trend <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </article>

          <div className="grid gap-3 md:grid-cols-2">
            <PreviewCard
              platform="LinkedIn"
              generation={linkedinGeneration}
              onEdit={() => editGeneration(linkedinGeneration)}
            />
            <PreviewCard
              platform="Instagram"
              generation={instagramGeneration}
              onEdit={() => editGeneration(instagramGeneration)}
            />
          </div>

          <article className="cf-image-card">
            <div className="cf-section-heading">
              <div>
                <p className="cf-eyebrow">Visual preview</p>
                <h2>Image preview</h2>
              </div>
              <button
                type="button"
                aria-label="Open image studio"
                onClick={() => navigate('/image-studio')}
                className="cf-icon-button"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <img src="/assets/hero_ai_pulse.jpg" alt="Sample CopyForge AI artwork" />
            <p>Sample artwork · open Image Studio to explore the visual workspace</p>
          </article>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
          <Button variant="primary" size="md" icon={Send} onClick={requestPublish}>
            Post now
          </Button>
          <Button variant="secondary" size="md" icon={CalendarClock} onClick={schedulePosts}>
            Schedule for {formatTime(preferences.postingTime)}
          </Button>
          <Button variant="outline" size="md" icon={PenLine} onClick={() => navigate('/studio')}>
            Edit content
          </Button>
          <Button variant="ghost" size="md" icon={RefreshCw} onClick={() => void onGenerate()} loading={isGenerating}>
            Regenerate
          </Button>
          <button type="button" className="cf-text-link ml-auto" onClick={() => onOpenHistory(false)}>
            <Settings2 className="h-3.5 w-3.5" /> Open history
          </button>
        </div>
        {scheduledNotice && (
          <div role="status" className="cf-scheduled-notice mt-4">
            <Check className="h-4 w-4 shrink-0" />
            <span>{scheduledNotice} This is a local calendar reminder, not an automatic social post.</span>
            <button type="button" onClick={() => navigate('/calendar')}>Open calendar</button>
          </div>
        )}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
        <span>Connect → Discover → Create → Review → Publish</span>
        <button type="button" onClick={() => navigate('/settings')} className="cf-text-link">
          <Settings2 className="h-3.5 w-3.5" /> Workspace settings
        </button>
      </footer>
    </main>
  );
};
