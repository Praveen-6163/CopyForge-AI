import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Info,
  Layers,
  Linkedin,
  Instagram,
  PenTool,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import { Badge, Button, EmptyState } from '../components/ui';
import { fetchTrends, refreshTrends, TrendItem } from '../services/platformApi';

interface TrendRadarPageProps {
  onCreatePost?: (trend: TrendItem, platform?: 'LinkedIn' | 'Instagram') => void;
}

const CATEGORIES = [
  'All',
  'AI',
  'LLMs',
  'Research',
  'Tools',
  'Business',
  'Robotics',
  'Developer',
  'Student Opportunities',
];

type SortOption = 'newest' | 'importance' | 'relevance';

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const TrendRadarPage: React.FC<TrendRadarPageProps> = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadTrends = useCallback(async (forceRefresh = false) => {
    setError('');
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (forceRefresh) {
        await refreshTrends();
      }
      const data = await fetchTrends(forceRefresh);
      setTrends(data);
      setLastRefreshedAt(new Date());
    } catch (requestError: any) {
      const detail = requestError?.response?.data?.detail || requestError?.message;
      if (detail && typeof detail === 'string') {
        setError(detail);
      } else if (requestError?.code === 'ERR_NETWORK') {
        setError('Unable to connect to the CopyForge backend.');
      } else {
        setError('Live web search is temporarily unavailable. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadTrends();
  }, [loadTrends]);

  const handleCreatePost = (trend: TrendItem, platform: 'LinkedIn' | 'Instagram' = 'LinkedIn') => {
    if (onCreatePost) {
      onCreatePost(trend, platform);
    }
    navigate('/studio', { state: { trend, targetPlatform: platform } });
  };

  const filteredTrends = useMemo(() => {
    let result = trends.filter((trend) => {
      const categoryMatch =
        selectedCategory === 'All' ||
        (trend.category || 'AI').toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      if (!query) return categoryMatch;

      const title = (trend.title || '').toLowerCase();
      const summary = (trend.summary || '').toLowerCase();
      const whyItMatters = (trend.whyItMatters || '').toLowerCase();
      const source = (trend.sourceName || trend.source || '').toLowerCase();
      const tags = (trend.tags || []).join(' ').toLowerCase();

      const textMatch =
        title.includes(query) ||
        summary.includes(query) ||
        whyItMatters.includes(query) ||
        source.includes(query) ||
        tags.includes(query);

      return categoryMatch && textMatch;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'importance') {
        const order: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const scoreA = order[a.importance || 'Medium'] || 2;
        const scoreB = order[b.importance || 'Medium'] || 2;
        if (scoreB !== scoreA) return scoreB - scoreA;
      }
      // Default / newest
      const timeA = new Date(a.publishedAt || a.published_at || a.retrievedAt || a.retrieved_at || 0).getTime();
      const timeB = new Date(b.publishedAt || b.published_at || b.retrievedAt || b.retrieved_at || 0).getTime();
      return timeB - timeA;
    });

    return result;
  }, [trends, selectedCategory, searchQuery, sortBy]);

  const getImportanceBadge = (importance?: string) => {
    const imp = importance || 'High';
    if (imp === 'High') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
          HIGH IMPACT
        </span>
      );
    }
    if (imp === 'Medium') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20">
        LOW
      </span>
    );
  };

  const getCategoryBadge = (category?: string) => {
    const cat = category || 'AI';
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        {cat}
      </span>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE WEB INTELLIGENCE
            </span>
            {lastRefreshedAt && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Updated {formatRelativeTime(lastRefreshedAt.toISOString())}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            AI Trend Radar
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
            Real-time AI and technology intelligence grounded in Google Search. Discover verified model releases, research breakthroughs, and developer news to turn into high-converting copy.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => void loadTrends(true)}
            className="border border-white/10 hover:border-indigo-500/50 transition-all"
          >
            Refresh Trends
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={ArrowRight}
            onClick={() => navigate('/studio')}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            Open Content Studio
          </Button>
        </div>
      </div>

      {/* ─── Error State Alert ──────────────────────────────────────────────── */}
      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-rose-300/80">
              {error.includes('configured')
                ? 'Ensure GEMINI_API_KEY is configured in your backend environment variables on Render.'
                : 'Click "Refresh Trends" or retry in a moment.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Filter & Search Bar ────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory.toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/[0.08]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search trends, tags, or topics…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="importance">Highest Impact</option>
              </select>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {filteredTrends.length} {filteredTrends.length === 1 ? 'trend' : 'trends'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Trend Grid / Empty / Loading ───────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border border-white/[0.08] bg-slate-900/40 space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-800 rounded" />
                <div className="h-4 w-20 bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-slate-800 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-slate-800/60 rounded" />
                <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
              </div>
              <div className="h-10 w-full bg-slate-800/40 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredTrends.length === 0 ? (
        <EmptyState
          icon={Flame}
          title={error ? 'Trend discovery unavailable' : 'No matching trends found'}
          description={
            error
              ? 'Check backend connectivity and click Refresh Trends.'
              : 'Try clearing your search query or selecting a different category filter.'
          }
          action={
            <Button variant="secondary" onClick={() => void loadTrends(true)}>
              Refresh Trends
            </Button>
          }
        />
      ) : (
        <section className="space-y-6" aria-label="Discovered AI Trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTrends.map((trend) => {
              const sourceUrl = trend.sourceUrl || trend.source_url || '#';
              const sourceName = trend.sourceName || trend.source || 'Publisher';
              const timeDisplay = formatRelativeTime(
                trend.publishedAt || trend.published_at || trend.retrievedAt || trend.retrieved_at
              );

              return (
                <article
                  key={trend.id}
                  onClick={() => setSelectedTrend(trend)}
                  className="group rounded-2xl p-6 border border-white/[0.08] bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between gap-5 cursor-pointer relative"
                >
                  <div className="space-y-3.5">
                    {/* Badges and timestamp */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getCategoryBadge(trend.category)}
                        {getImportanceBadge(trend.importance)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {timeDisplay}
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                      {trend.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {trend.summary}
                    </p>

                    {/* Why It Matters Callout */}
                    {trend.whyItMatters && (
                      <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/15 p-3 space-y-1">
                        <p className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          Why It Matters
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {trend.whyItMatters}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {trend.tags && trend.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {trend.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.04]"
                          >
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div
                    className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate max-w-[160px] sm:max-w-[200px]">
                      <Globe className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate font-medium">{sourceName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sourceUrl && sourceUrl !== '#' && (
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors"
                          title="Open original article in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Read Source
                        </a>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        icon={PenTool}
                        onClick={() => handleCreatePost(trend, 'LinkedIn')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold shadow-sm"
                      >
                        Create Post
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Detail Modal ───────────────────────────────────────────────────── */}
      {selectedTrend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTrend(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedTrend.category)}
                  {getImportanceBadge(selectedTrend.importance)}
                  <span className="text-xs font-mono text-slate-400">
                    {formatRelativeTime(
                      selectedTrend.publishedAt ||
                        selectedTrend.published_at ||
                        selectedTrend.retrievedAt ||
                        selectedTrend.retrieved_at
                    )}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {selectedTrend.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrend(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                  Executive Summary
                </h4>
                <p className="bg-slate-950/50 p-4 rounded-xl border border-white/[0.06]">
                  {selectedTrend.summary}
                </p>
              </div>

              {selectedTrend.whyItMatters && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-1.5 font-semibold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    Why This Matters
                  </h4>
                  <p className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20 text-indigo-100">
                    {selectedTrend.whyItMatters}
                  </p>
                </div>
              )}

              {/* Metadata details */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04]">
                  <p className="text-[11px] text-slate-500 font-mono">Source Publisher</p>
                  <p className="text-xs font-semibold text-white mt-1">
                    {selectedTrend.sourceName || selectedTrend.source || 'Publisher'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/40 border border-white/[0.04]">
                  <p className="text-[11px] text-slate-500 font-mono">Published / Retrieved</p>
                  <p className="text-xs font-semibold text-white mt-1">
                    {selectedTrend.publishedAt
                      ? new Date(selectedTrend.publishedAt).toLocaleString()
                      : `Retrieved ${new Date(selectedTrend.retrievedAt || Date.now()).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {selectedTrend.tags && selectedTrend.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Related Tags
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedTrend.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/[0.06]"
                      >
                        #{t.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              {(selectedTrend.sourceUrl || selectedTrend.source_url) ? (
                <a
                  href={selectedTrend.sourceUrl || selectedTrend.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Full Source
                </a>
              ) : <div />}

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="md"
                  icon={Linkedin}
                  onClick={() => {
                    handleCreatePost(selectedTrend, 'LinkedIn');
                    setSelectedTrend(null);
                  }}
                  className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
                >
                  Create LinkedIn Post
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={Instagram}
                  onClick={() => {
                    handleCreatePost(selectedTrend, 'Instagram');
                    setSelectedTrend(null);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                >
                  Create Instagram Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
