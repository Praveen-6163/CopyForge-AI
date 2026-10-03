import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CheckSquare, XCircle } from 'lucide-react';
import { Badge, Button, ContentPreview, EmptyState, PlatformBadge } from '../components/ui';
import { ScheduledPost, fetchApprovals, updateApproval } from '../services/platformApi';

export const ApprovalQueuePage: React.FC = () => {
  const [items, setItems] = useState<ScheduledPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchApprovals();
      setItems(result);
      setSelectedId((current) => result.some((item) => item.id === current) ? current : result[0]?.id || null);
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not load approval items from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = items.find((item) => item.id === selectedId) || null;

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selected) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await updateApproval(selected.id, action);
      setNotice(action === 'approve'
        ? 'Post approved and added to the backend publishing schedule.'
        : 'Post returned to Drafts.');
      await load();
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'The approval action failed. The item was not changed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            CONTENT REVIEW
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Approval Queue
            {!loading && <Badge variant="default">{items.length} awaiting</Badge>}
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Review account content before it enters the server-side publishing queue.
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()}>Refresh</Button>
      </div>

      {notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="text-sm text-slate-400">Loading approval queue…</p>
      ) : selected ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <PlatformBadge platform={selected.platform} />
                <h2 className="text-sm font-bold text-white">{selected.topic}</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Created {new Date(selected.created_at).toLocaleString()}
              </span>
            </div>
            <ContentPreview
              platform={selected.platform}
              content={selected.content}
              mediaUrl={selected.image_url || undefined}
            />
            {selected.scheduled_at && (
              <p className="text-xs text-slate-400">
                Planned time: {new Date(selected.scheduled_at).toLocaleString(undefined, { timeZone: selected.timezone })} ({selected.timezone})
              </p>
            )}
            <div className="pt-3 border-t border-white/[0.06] flex justify-end gap-2">
              <Button variant="danger" icon={XCircle} onClick={() => void handleAction('reject')} loading={busy}>
                Return to Drafts
              </Button>
              <Button variant="primary" icon={CheckCircle2} onClick={() => void handleAction('approve')} loading={busy}>
                Approve
              </Button>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Awaiting review ({items.length})
            </h2>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedId === item.id
                    ? 'bg-indigo-950/30 border-indigo-500'
                    : 'bg-slate-900/50 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <PlatformBadge platform={item.platform} />
                  <span className="text-[10px] text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-2">{item.topic}</p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.content}</p>
              </button>
            ))}
          </aside>
        </div>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title={error ? 'Approval queue unavailable' : 'No content awaiting approval'}
          description={error || 'Generated content submitted for review will appear here.'}
        />
      )}
    </div>
  );
};
