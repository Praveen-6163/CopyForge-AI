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
  Linkedin,
  Instagram,
  Zap,
  Mic,
  BarChart3,
  Settings,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface SidebarProps {
  health?: HealthStatus | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'purple' | 'amber';
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
      { to: '/trend-radar', label: 'Trend Radar', icon: Radio, badge: 'Live', badgeVariant: 'purple' },
      { to: '/studio', label: 'Content Studio', icon: PenTool },
      { to: '/image-studio', label: 'Image Studio', icon: ImageIcon, badge: 'New', badgeVariant: 'purple' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { to: '/calendar', label: 'Content Calendar', icon: Calendar },
      { to: '/approvals', label: 'Approval Queue', icon: CheckSquare, badge: '2', badgeVariant: 'amber' },
      { to: '/published', label: 'Published Posts', icon: Send },
    ],
  },
  {
    title: 'SOCIAL',
    items: [
      { to: '/social/linkedin', label: 'LinkedIn', icon: Linkedin },
      { to: '/social/instagram', label: 'Instagram', icon: Instagram },
    ],
  },
  {
    title: 'AUTOMATION',
    items: [
      { to: '/automation', label: 'Automation', icon: Zap },
      { to: '/ai-voice', label: 'AI Voice', icon: Mic },
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

export const NewSidebar: React.FC<SidebarProps> = ({ health }) => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-white/[0.07] flex flex-col flex-shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* ── Brand Logo ────────────────────────────────────────────── */}
      <div className="p-6 pb-5 border-b border-white/[0.06] flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group">
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
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-medium text-white">AI Engine Active</p>
              <p className="text-[10px] text-slate-500">{health?.openai_model || 'gpt-4o-mini'}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-500">
          <NavLink to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</NavLink>
          <span>v2.4 Editorial</span>
        </div>
      </div>
    </aside>
  );
};
