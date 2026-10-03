import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, CheckSquare, Send, CalendarClock } from 'lucide-react';
import { fetchAnalytics, AnalyticsSummary } from '../services/platformApi';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setAnalytics(await fetchAnalytics());
      setError('');
    } catch (requestError) {
      const detail = (requestError as { response?: { data?: { detail?: string } } })
        .response?.data?.detail;
      setError(detail || 'Could not retrieve account analytics.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cards = [
    { label: 'Published posts', value: analytics?.published_count, icon: Send },
    { label: 'Scheduled posts', value: analytics?.scheduled_count, icon: CalendarClock },
    { label: 'Awaiting approval', value: analytics?.approval_count, icon: CheckSquare },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          ACCOUNT PERFORMANCE
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-indigo-400" />
          Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Counts below come from your saved post records. No engagement estimates are shown.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="editorial-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-indigo-400" />
              <p className="text-xs text-slate-400">{label}</p>
            </div>
            <p className="text-3xl font-bold text-white mt-4">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="editorial-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10">
        <h2 className="text-sm font-bold text-white">Platform engagement metrics</h2>
        <p className="text-sm text-slate-300 mt-2">
          {analytics?.message || 'Analytics unavailable from platform API'}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          When the connected platform exposes post analytics to this application, verified metrics will appear here.
        </p>
      </div>
    </div>
  );
};
