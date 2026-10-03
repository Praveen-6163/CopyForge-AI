import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Badge, Button, EmptyState, PlatformBadge } from '../components/ui';
import { PostCreate, ScheduledPost, createPost, fetchPosts } from '../services/platformApi';

const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

const statusLabel: Record<ScheduledPost['status'], string> = {
  draft: 'Draft',
  awaiting_approval: 'Awaiting Approval',
  scheduled: 'Scheduled',
  publishing: 'Publishing',
  published: 'Published',
  failed: 'Failed',
};

export const ContentCalendarPage: React.FC = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [platform, setPlatform] = useState<'linkedin' | 'instagram'>('linkedin');
  const [scheduledAt, setScheduledAt] = useState('');
  const [timezone, setTimezone] = useState(currentTimezone);
  const [mode, setMode] = useState<PostCreate['mode']>('approval_required');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await fetchPosts());
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not load calendar records from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await createPost({
        topic,
        description: '',
        platform,
        content,
        image_url: imageUrl.trim() || null,
        image_prompt: imagePrompt.trim() || null,
        timezone,
        mode,
        scheduled_at: scheduledAt || null,
      });
      setTopic('');
      setContent('');
      setImageUrl('');
      setImagePrompt('');
      setScheduledAt('');
      setFormOpen(false);
      setNotice('Post saved to your account calendar.');
      await load();
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not save this post. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  const filters = [
    ['all', 'All'],
    ['draft', 'Draft'],
    ['awaiting_approval', 'Awaiting Approval'],
    ['scheduled', 'Scheduled'],
    ['publishing', 'Publishing'],
    ['published', 'Published'],
    ['failed', 'Failed'],
  ];
  const visiblePosts = posts.filter((post) => statusFilter === 'all' || post.status === statusFilter);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            ACCOUNT POSTING SCHEDULE
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Content Calendar</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Calendar items are loaded from your account database. Scheduled jobs execute on the backend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" icon={RefreshCw} onClick={() => void load()}>
            Refresh
          </Button>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setFormOpen((open) => !open)}>
            Schedule Post
          </Button>
        </div>
      </div>

      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {formOpen && (
        <form onSubmit={submit} className="editorial-card rounded-2xl p-6 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="md:col-span-2 text-sm font-bold text-white">Create a calendar item</h2>
          <label className="space-y-1.5 text-xs text-slate-300">
            Topic
            <input required value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
          </label>
          <label className="space-y-1.5 text-xs text-slate-300">
            Platform
            <select value={platform} onChange={(event) => setPlatform(event.target.value as typeof platform)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="md:col-span-2 space-y-1.5 text-xs text-slate-300">
            Content
            <textarea required rows={5} value={content} onChange={(event) => setContent(event.target.value)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
          </label>
          <label className="md:col-span-2 space-y-1.5 text-xs text-slate-300">
            Image URL (optional)
            <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
          </label>
          {!imageUrl.trim() && (
            <label className="md:col-span-2 space-y-1.5 text-xs text-slate-300">
              Image prompt (optional; used to generate a publishable Instagram image)
              <textarea rows={3} maxLength={4000} value={imagePrompt} onChange={(event) => setImagePrompt(event.target.value)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
            </label>
          )}
          <label className="space-y-1.5 text-xs text-slate-300">
            Date and time
            <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
          </label>
          <label className="space-y-1.5 text-xs text-slate-300">
            Timezone (IANA)
            <input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Asia/Kolkata" className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white" />
          </label>
          <label className="space-y-1.5 text-xs text-slate-300">
            Publishing mode
            <select value={mode} onChange={(event) => setMode(event.target.value as PostCreate['mode'])} className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2.5 text-white">
              <option value="draft_only">Draft Only</option>
              <option value="approval_required">Approval Required</option>
              <option value="auto_publish">Auto Publish</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save Post</Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStatusFilter(id)}
            className={`rounded-lg px-3 py-2 text-xs font-medium border ${
              statusFilter === id
                ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border-white/10'
            }`}
          >
            {label}{id === 'all' ? ` (${posts.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <p role="status" className="text-sm text-slate-400">Loading calendar…</p>
      ) : visiblePosts.length === 0 ? (
        <EmptyState
          icon={Plus}
          title={error ? 'Calendar unavailable' : 'No posts in this view'}
          description={error || 'Create a draft, request approval, or schedule a post to get started.'}
          action={<Button variant="primary" onClick={() => setFormOpen(true)}>Create Post</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visiblePosts.map((post) => (
            <article key={post.id} className="editorial-card rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <PlatformBadge platform={post.platform} />
                  <p className="text-[11px] text-slate-500 mt-2">
                    {post.scheduled_at
                      ? new Date(post.scheduled_at).toLocaleString(undefined, { timeZone: post.timezone })
                      : 'No publish time set'}
                    {' · '}{post.timezone}
                  </p>
                </div>
                <Badge variant={post.status === 'failed' ? 'error' : post.status === 'published' ? 'success' : 'default'}>
                  {statusLabel[post.status]}
                </Badge>
              </div>
              <h3 className="font-bold text-white">{post.topic || 'Scheduled content'}</h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-5">{post.content}</p>
              {post.last_error && <p role="alert" className="text-xs text-rose-300">{post.last_error}</p>}
              {post.published_url && <a href={post.published_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 underline">Open published post</a>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
