import React, { useState } from 'react';
import { Radio, TrendingUp, ExternalLink, RefreshCw, Search, Filter } from 'lucide-react';
import {
  SectionHeader, GlassCard, Badge, Button, EmptyState,
  ConfidenceBar, PageWrapper, Tabs
} from '../components/ui';
import { DEMO_TRENDS } from '../services/platformData';
import { TrendTopic } from '../types/platform';

const CATEGORIES = ['All', 'AI Models', 'Enterprise AI', 'AI Agents', 'Open Source', 'MLOps', 'Career', 'AI Skills', 'AI Infrastructure'];

export const TrendRadarPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<TrendTopic | null>(null);

  const filtered = DEMO_TRENDS.filter(t => {
    const matchesSearch = t.topic.toLowerCase().includes(search.toLowerCase()) ||
      t.source.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-brand-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Trend Radar</h1>
          </div>
          <p className="text-sm text-slate-400">AI-discovered trending topics ready for content generation</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} size="sm">Refresh Trends</Button>
      </div>

      {/* Demo Banner */}
      <div className="mb-6 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-center gap-3">
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-400 border border-amber-400/20 uppercase flex-shrink-0">Demo Data</span>
        <p className="text-xs text-slate-400">Trend data is simulated. Real data will come from the AI Trend Scanner engine when automation is enabled.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics or sources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend List */}
        <div className="xl:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No trends found"
              description="Try adjusting your search or category filter."
            />
          ) : (
            filtered.map((trend) => (
              <GlassCard
                key={trend.id}
                hover
                onClick={() => setSelected(selected?.id === trend.id ? null : trend)}
                className={`p-4 transition-all ${selected?.id === trend.id ? 'border-brand-500/50 bg-brand-500/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-100 truncate">{trend.topic}</h3>
                      {trend.trending && <Badge variant="error" dot size="sm">Trending</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />{trend.source}
                      </span>
                      <span>{trend.recency}</span>
                      <Badge variant="default">{trend.category}</Badge>
                    </div>
                    <ConfidenceBar value={trend.relevanceScore} label="Relevance Score" />
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold ${
                      trend.contentPotential === 'High' ? 'text-emerald-400' :
                      trend.contentPotential === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                    }`}>{trend.contentPotential}</span>
                    <span className="text-[10px] text-slate-500">Content Potential</span>
                  </div>
                </div>
                {selected?.id === trend.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 flex gap-2">
                    <Button variant="primary" size="xs">Generate Content</Button>
                    <Button variant="secondary" size="xs">Add to Queue</Button>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <GlassCard className="p-4">
            <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-400" /> Trend Summary
            </p>
            <div className="space-y-3">
              {[
                { label: 'Total Discovered', value: DEMO_TRENDS.length, color: 'text-white' },
                { label: 'High Potential', value: DEMO_TRENDS.filter(t => t.contentPotential === 'High').length, color: 'text-emerald-400' },
                { label: 'Trending Now', value: DEMO_TRENDS.filter(t => t.trending).length, color: 'text-rose-400' },
                { label: 'Avg Relevance', value: `${Math.round(DEMO_TRENDS.reduce((acc, t) => acc + t.relevanceScore, 0) / DEMO_TRENDS.length)}%`, color: 'text-brand-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <p className="text-xs font-semibold text-slate-300 mb-3">Categories Discovered</p>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(DEMO_TRENDS.map(t => t.category))].map(cat => (
                <Badge key={cat} variant="default">{cat}</Badge>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageWrapper>
  );
};
