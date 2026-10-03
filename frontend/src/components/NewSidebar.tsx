import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles, LayoutDashboard, Radio, PenTool, Image, Calendar,
  CheckSquare, Send, BarChart2, Linkedin, Instagram, Zap,
  Mic2, Settings, Shield, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { HealthStatus } from '../types/generation';

interface NewSidebarProps {
  health: HealthStatus | null;
}

// ─── Navigation Structure ─────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'MAIN',
    items: [
      { to: '/',            label: 'Dashboard',         icon: LayoutDashboard },
      { to: '/trend-radar', label: 'Trend Radar',       icon: Radio },
      { to: '/studio',      label: 'Content Studio',    icon: PenTool },
      { to: '/image-studio',label: 'Image Studio',      icon: Image },
      { to: '/calendar',    label: 'Content Calendar',  icon: Calendar },
      { to: '/approvals',   label: 'Approval Queue',    icon: CheckSquare },
      { to: '/published',   label: 'Published Posts',   icon: Send },
      { to: '/analytics',   label: 'Analytics',         icon: BarChart2 },
    ],
  },
  {
    label: 'SOCIAL ACCOUNTS',
    items: [
      { to: '/social/linkedin',  label: 'LinkedIn',  icon: Linkedin },
      { to: '/social/instagram', label: 'Instagram', icon: Instagram },
    ],
  },
  {
    label: 'AUTOMATION',
    items: [
      { to: '/automation', label: 'Automation', icon: Zap },
      { to: '/ai-voice',   label: 'AI Voice',   icon: Mic2 },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const NewSidebar: React.FC<NewSidebarProps> = ({ health }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0`}>
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2.5 group ${collapsed ? 'justify-center w-full' : ''}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-white tracking-tight truncate">CopyForge AI</h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">AI Content Automation</p>
            </div>
          )}
        </button>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors ml-1 flex-shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 mb-1 p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group
                    ${isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }
                    ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 flex-shrink-0">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                AI Engine
              </span>
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-mono text-[10px]">
                Active
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono flex justify-between mb-2">
              <span>Model:</span>
              <span className="text-slate-300">{health?.openai_model || 'gpt-4o-mini'}</span>
            </div>
            <NavLink
              to="/privacy"
              className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Privacy Policy
            </NavLink>
          </>
        ) : (
          <NavLink to="/settings" className="flex justify-center text-slate-500 hover:text-slate-300">
            <Settings className="w-4 h-4" />
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#0d121f] border border-slate-800 text-slate-300 shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 bg-[#0d121f] border-r border-slate-800/80 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 220 }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0d121f] border-r border-slate-800/80 h-screen sticky top-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-14' : 'w-52'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
