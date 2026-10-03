import React, { useCallback, useEffect, useState } from 'react';
import { Instagram, Linkedin, Send } from 'lucide-react';
import { Badge, EmptyState, PlatformBadge, Tabs } from '../components/ui';
import { PublishedPost, fetchPublishedPosts } from '../services/platformApi';

export const PublishedPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [platformTab, setPlatformTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await fetchPublishedPosts());
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not load published posts from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const published = posts.filter((post) => platformTab === 'all' || post.platform === platformTab);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            ACCOUNT PUBLISHING HISTORY
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Published Posts</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Posts and links are read from your account records. Metrics are shown only when the platform supplies them.
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

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="text-sm text-slate-400">Loading published posts…</p>
      ) : published.length === 0 ? (
        <EmptyState
          icon={Send}
          title={error ? 'Published posts unavailable' : 'No published posts yet'}
          description={error || 'Successfully published account posts will appear here.'}
        />
      ) : (
        <div className="space-y-5">
          {published.map((post) => (
            <article key={post.id} className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={post.platform} />
                    <Badge variant="success">Published</Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-500">
                    {new Date(post.published_at).toLocaleString()}
                  </p>
                </div>
                <a
                  href={post.published_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-300 hover:text-white underline"
                >
                  Open on platform
                </a>
              </div>
              {post.image_url && (
                <img src={post.image_url} alt="Published post media" className="max-h-80 rounded-xl object-contain" />
              )}
              <p className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] text-sm text-slate-200 whitespace-pre-wrap">
                {post.content}
              </p>
              <p className="text-xs text-slate-400">{post.analytics_status}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
