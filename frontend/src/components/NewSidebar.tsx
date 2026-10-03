import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  PenTool,
  Image as ImageIcon,
  Calendar,
  CheckSquare,
  Send,
  Share2,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  History,
  Bookmark
} from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface SidebarProps {
  health?: HealthStatus | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenHistory: (savedOnly: boolean) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'purple';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'HOME',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/trend-radar', label: 'Trend Radar', icon: Radio },
      { to: '/studio', label: 'Content Studio', icon: PenTool },
      { to: '/image-studio', label: 'Image Studio', icon: ImageIcon },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { to: '/calendar', label: 'Content Calendar', icon: Calendar },
      { to: '/approvals', label: 'Approval Queue', icon: CheckSquare },
      { to: '/published', label: 'Published Posts', icon: Send },
    ],
  },
  {
    title: 'SOCIAL',
    items: [
      { to: '/social', label: 'Social Accounts', icon: Share2 },
    ],
  },
  {
    title: 'AUTOMATION',
    items: [
      { to: '/automation', label: 'Automation', icon: Zap },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const NewSidebar: React.FC<SidebarProps> = ({ health, onOpenHistory, mobileOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
    {mobileOpen && (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
      />
    )}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 flex-col select-none border-r border-white/[0.07] bg-[#0d1117] transition-transform duration-200 md:sticky md:top-0 md:z-30 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* ── Brand Logo ────────────────────────────────────────────── */}
      <div className="p-6 pb-5 border-b border-white/[0.06] flex items-center justify-between">
        <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base text-white tracking-tight flex items-center gap-1">
              CopyForge<span className="text-indigo-400">.</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">
              AI Intelligence
            </span>
          </div>
        </NavLink>
      </div>

      {/* ── Navigation List ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                        item.badgeVariant === 'purple'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Sidebar Footer / Engine Health ─────────────────────────── */}
      <div className="p-4 border-t border-white/[0.06] bg-slate-950/40">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-400'}`}>
            </span>
            <div>
              <p className="text-xs font-medium text-white">
                {!health ? 'Backend unavailable' : 'Backend connected'}
              </p>
              <p className="text-[10px] text-slate-500">
                {health ? (health.ai_configured ? health.openai_model : 'AI provider not configured') : 'Check backend URL'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { onOpenHistory(false); onClose(); }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] px-2 py-2 text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.04]"
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <button
            type="button"
            onClick={() => { onOpenHistory(true); onClose(); }}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] px-2 py-2 text-[11px] text-slate-400 hover:text-white hover:bg-white/[0.04]"
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-500">
          <NavLink to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</NavLink>
          <span>v2.4 Editorial</span>
        </div>
      </div>
    </aside>
    </>
  );
};
