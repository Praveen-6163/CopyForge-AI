import React, { useState } from 'react';
import { PostStatus, SocialPlatform } from '../types/platform';
import { 
  TrendingUp, Sparkles, CheckCircle2, Clock, 
  Share2, Eye, MessageSquare, ArrowRight, ExternalLink,
  ShieldCheck, AlertCircle, RefreshCw, Check, X, Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// EDITORIAL & CINEMATIC DESIGN SYSTEM COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ─── Button ──────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-sm font-semibold px-5 py-2.5 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/20 hover:border-indigo-300/40 hover:shadow-indigo-500/30 active:scale-[0.98]',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 border border-white/10 hover:border-white/20 active:scale-[0.98]',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.08]',
    outline: 'border border-white/15 hover:border-white/30 text-slate-200 hover:text-white bg-transparent active:bg-white/[0.04]',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 active:scale-[0.98]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 text-current" />}
    </button>
  );
};

// ─── Card & GlassCard ────────────────────────────────────────────────────────
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = true,
  hoverable = false,
  padded = true,
  className = '',
  ...props
}) => {
  const base = glass ? 'glass-card' : 'bg-slate-900/80 border border-white/[0.07]';
  const hover = hoverable ? 'hover:border-indigo-500/30 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5' : '';
  const pad = padded ? 'p-6' : '';

  return (
    <div className={`rounded-2xl ${base} ${hover} ${pad} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const GlassCard = Card;

// ─── PageWrapper ─────────────────────────────────────────────────────────────
export const PageWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className = ''
}) => (
  <div className={`p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in ${className}`}>
    {children}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'blue' | 'pink' | 'emerald';
export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border-white/10',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  error:   'bg-rose-500/10 text-rose-300 border-rose-500/20',
  info:    'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  purple:  'bg-purple-500/10 text-purple-300 border-purple-500/20',
  blue:    'bg-sky-500/10 text-sky-300 border-sky-500/20',
  pink:    'bg-pink-500/10 text-pink-300 border-pink-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', dot }) => (
  <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${BADGE_STYLES[variant]} ${
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
  }`}>
    {dot && (
      <span className={`w-1.5 h-1.5 rounded-full ${
        variant === 'success' || variant === 'emerald' ? 'bg-emerald-400' :
        variant === 'warning' ? 'bg-amber-400' :
        variant === 'error' ? 'bg-rose-400' :
        variant === 'info' || variant === 'purple' ? 'bg-indigo-400' : 'bg-slate-400'
      }`} />
    )}
    {children}
  </span>
);

// ─── PostStatusBadge & PlatformBadge ─────────────────────────────────────────
export const PostStatusBadge: React.FC<{ status: PostStatus }> = ({ status }) => {
  const map: Record<PostStatus, { label: string; variant: BadgeVariant }> = {
    draft:            { label: 'Draft',             variant: 'default' },
    awaiting_approval:{ label: 'Review Required',   variant: 'warning' },
    scheduled:        { label: 'Scheduled',         variant: 'info' },
    published:        { label: 'Published',         variant: 'success' },
    failed:           { label: 'Failed',            variant: 'error' },
  };
  const { label, variant } = map[status] || { label: status, variant: 'default' };
  return <Badge variant={variant} dot>{label}</Badge>;
};

export const PlatformBadge: React.FC<{ platform: SocialPlatform }> = ({ platform }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg border ${
    platform === 'linkedin' 
      ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
      : 'bg-pink-500/10 text-pink-300 border-pink-500/20'
  }`}>
    {platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}
  </span>
);

// ─── Metric & StatCard ───────────────────────────────────────────────────────
export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: { value: number; label: string };
  subtext?: string;
  index?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon: Icon, trend, subtext, index
}) => (
  <div className="editorial-card rounded-2xl p-6 relative overflow-hidden group">
    {index && (
      <span className="text-[11px] font-mono text-slate-500 tracking-wider mb-2 block">{index}</span>
    )}
    <div className="flex items-start justify-between">
      <div>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>

    {(trend || subtext) && (
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
        {trend && (
          <span className={`font-semibold ${trend.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value >= 0 ? '↑ +' : '↓ '}{trend.value}% <span className="text-slate-500 font-normal">{trend.label}</span>
          </span>
        )}
        {subtext && <span className="text-slate-500">{subtext}</span>}
      </div>
    )}
  </div>
);

export const Metric = StatCard;

// ─── Toggle ──────────────────────────────────────────────────────────────────
export const Toggle: React.FC<{
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-xs font-semibold text-slate-200">{label}</p>
      {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-slate-700'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Input & Select ──────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label, hint, error, className = '', id, ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all ${
          error ? 'border-rose-500/50 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({
  label, options, hint, className = '', id, ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
};

// ─── Tabs ────────────────────────────────────────────────────────────────────
export interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number; icon?: React.ElementType }>;
  activeTab?: string;
  active?: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, active, onChange, className = '' }) => {
  const current = activeTab || active || tabs[0]?.id;
  return (
    <div className={`flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/[0.07] rounded-xl overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = current === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Editorial Trend Card ────────────────────────────────────────────────────
export interface TrendCardProps {
  index: string;
  topic: string;
  headline?: string;
  insight: string;
  source: string;
  time: string;
  trendScore: number;
  contentPotential?: string;
  onSelect?: () => void;
  selected?: boolean;
  image?: string;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  index, topic, headline, insight, source, time, trendScore, contentPotential, onSelect, selected, image
}) => (
  <div 
    onClick={onSelect}
    className={`editorial-card rounded-2xl p-6 cursor-pointer relative overflow-hidden transition-all group ${
      selected ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10' : ''
    }`}
  >
    <div className="flex items-start justify-between gap-4 mb-3">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-xs font-bold text-indigo-400 tracking-wider">/{index}</span>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{topic}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
        <TrendingUp className="w-3 h-3" />
        <span>{trendScore}%</span>
      </div>
    </div>

    {headline ? (
      <h4 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {headline}
      </h4>
    ) : null}

    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
      {insight}
    </p>

    {image && (
      <div className="mb-4 rounded-xl overflow-hidden h-28 w-full border border-white/10 bg-slate-900">
        <img src={image} alt={topic} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    )}

    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
      <div className="flex items-center gap-2">
        <span>{source}</span>
        <span>•</span>
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-1 text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
        <span>Studio</span>
        <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  </div>
);

// ─── ContentPreview ──────────────────────────────────────────────────────────
export interface ContentPreviewProps {
  platform: SocialPlatform;
  content: string;
  authorName?: string;
  authorTitle?: string;
  mediaUrl?: string;
  hashtags?: string[];
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  platform,
  content,
  authorName = 'Alex Mercer',
  authorTitle = 'AI Strategist & Growth Architect',
  mediaUrl,
  hashtags = ['#AI', '#TechTrends', '#GenerativeAI']
}) => {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden shadow-2xl">
      {/* Platform Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
            {authorName.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{authorName}</p>
            <p className="text-[10px] text-slate-400">{authorTitle}</p>
          </div>
        </div>
        <PlatformBadge platform={platform} />
      </div>

      {/* Post Content */}
      <div className="p-5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>

      {/* Optional Media */}
      {mediaUrl && (
        <div className="border-t border-b border-white/[0.06] overflow-hidden max-h-72 bg-black/40">
          <img src={mediaUrl} alt="Post asset" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Hashtags & Actions */}
      <div className="px-5 py-3.5 bg-slate-950/40 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          {hashtags.map((h, i) => (
            <span key={i} className="text-indigo-400 text-xs hover:underline cursor-pointer">{h}</span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 1.4k</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> 28</span>
          <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> 12</span>
        </div>
      </div>
    </div>
  );
};

// ─── SocialAccountCard ───────────────────────────────────────────────────────
export interface SocialAccountCardProps {
  platform: 'linkedin' | 'instagram';
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  accountName?: string;
  lastSynced?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  connecting?: boolean;
}

export const SocialAccountCard: React.FC<SocialAccountCardProps> = ({
  platform, name, description, status, accountName, lastSynced, onConnect, onDisconnect, connecting
}) => {
  const isConnected = status === 'connected';
  const isLinkedIn = platform === 'linkedin';

  return (
    <div className="editorial-card rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            isLinkedIn ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
          }`}>
            {isLinkedIn ? 'in' : 'ig'}
          </div>
          <div>
            <h4 className="text-base font-bold text-white">{name}</h4>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <Badge variant={isConnected ? 'success' : 'default'} dot>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
      </div>

      {isConnected ? (
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">{accountName}</p>
            <p className="text-[10px] text-slate-400">Last synced: {lastSynced || 'Just now'}</p>
          </div>
          <Button variant="danger" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-xs text-slate-400">Official OAuth 2.0 connection</p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onConnect} 
            loading={connecting}
          >
            Connect {name}
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── WorkflowStep ────────────────────────────────────────────────────────────
export interface WorkflowStepProps {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  icon: React.ElementType;
}

export const WorkflowStep: React.FC<WorkflowStepProps> = ({
  stepNumber, title, description, status, icon: Icon
}) => {
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
      isActive 
        ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
        : isCompleted
        ? 'bg-slate-900/60 border-emerald-500/30'
        : 'bg-slate-900/40 border-white/[0.06] opacity-75'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
          isActive 
            ? 'bg-indigo-600 text-white' 
            : isCompleted 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-slate-800 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <span className="font-mono text-[11px] text-slate-500">0{stepNumber}</span>
      </div>
      <h5 className="text-sm font-bold text-white mb-1">{title}</h5>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

// ─── SectionHeader ───────────────────────────────────────────────────────────
export interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  badge?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label, title, subtitle, icon: Icon, actions, badge
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
    <div>
      {label && (
        <span className="text-[11px] font-mono font-semibold text-indigo-400 tracking-wider uppercase mb-1 block">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
        {badge && <Badge variant="purple">{badge}</Badge>}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-2xl">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
  </div>
);

// ─── Toast Hook & Container ──────────────────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, show, dismiss };
};

export const ToastContainer: React.FC<{
  toasts: Toast[];
  dismiss: (id: string) => void;
}> = ({ toasts, dismiss }) => (
  <div className="fixed bottom-5 right-5 z-50 space-y-2">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`px-4 py-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in ${
          t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300' :
          t.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-300' :
          'bg-slate-900/95 border-white/20 text-slate-200'
        }`}
      >
        {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Info className="w-4 h-4 text-indigo-400" />}
        <span>{t.message}</span>
        <button onClick={() => dismiss(t.id)} className="ml-2 hover:opacity-75">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    ))}
  </div>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="glass-card rounded-2xl p-12 text-center max-w-md mx-auto my-8 border border-white/[0.06]">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-400">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed mb-6">{description}</p>
    {action}
  </div>
);
