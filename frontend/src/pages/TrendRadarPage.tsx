import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Flame, Globe, RefreshCw } from 'lucide-react';
import { Badge, Button, EmptyState, Input, Tabs } from '../components/ui';
import { fetchTrends, refreshTrends, TrendItem } from '../services/platformApi';

export const TrendRadarPage: React.FC = () => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTrends = useCallback(async (forceRefresh = false) => {
    setError('');
    try {
      if (forceRefresh) await refreshTrends();
      setTrends(await fetchTrends());
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Trend sources could not be reached. Retry in a moment.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTrends();
  }, [loadTrends]);

  const sources = useMemo(() => [...new Set(trends.map((item) => item.source))].sort(), [trends]);
  const tabs = [
    { id: 'all', label: 'All Sources', count: trends.length },
    ...sources.map((source) => ({ id: source, label: source })),
  ];
  const filteredTrends = trends.filter((trend) => {
    const search = searchQuery.toLowerCase();
    return (
      (selectedSource === 'all' || trend.source === selectedSource) &&
      `${trend.title} ${trend.summary} ${trend.source}`.toLowerCase().includes(search)
    );
  });

  const handleRefresh = () => {
    setRefreshing(true);
    void loadTrends(true);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.07]">
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
            LIVE SOURCE DISCOVERY
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Trend Radar</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Current articles fetched from technology and AI publishers. Each item links to its original source.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Refresh sources
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            onClick={() => navigate('/studio')}
          >
            Open Content Studio
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs
          tabs={tabs}
          activeTab={selectedSource}
          onChange={setSelectedSource}
          className="w-full md:w-auto"
        />
        <div className="w-full md:w-72">
          <Input
            placeholder="Search current articles…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="!py-2"
          />
        </div>
      </div>

      {loading ? (
        <p role="status" className="text-sm text-slate-400">Retrieving current articles…</p>
      ) : filteredTrends.length === 0 ? (
        <EmptyState
          icon={Flame}
          title={error ? 'Trend sources unavailable' : 'No current articles found'}
          description={error || 'Try refreshing the configured publisher feeds later.'}
          action={<Button variant="secondary" onClick={handleRefresh}>Retry</Button>}
        />
      ) : (
        <section className="space-y-5" aria-label="Current AI and technology articles">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-indigo-400" />
            CURRENT ARTICLES
            <span className="text-xs font-mono text-slate-500">{filteredTrends.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTrends.map((trend) => (
              <article
                key={trend.id}
                className="editorial-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <Badge variant="purple" size="sm">{trend.source}</Badge>
                    <span className="text-[11px] text-slate-500">
                      {trend.published_at
                        ? new Date(trend.published_at).toLocaleString()
                        : `Retrieved ${new Date(trend.retrieved_at).toLocaleString()}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{trend.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{trend.summary}</p>
                </div>
                <footer className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Globe className="w-3.5 h-3.5" />
                    Original publisher
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate('/studio')}>
                      Draft content
                    </Button>
                    <a
                      href={trend.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-300 hover:text-white"
                      aria-label={`Open original article: ${trend.title}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
