import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENT LIBRARY
// Used across all platform pages.
// ─────────────────────────────────────────────────────────────────────────────

// ─── StatCard ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  accent?: string;
  iconBg?: string;
}
export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon: Icon, trend, accent = 'border-slate-800', iconBg = 'bg-brand-500/15',
}) => (
  <div className={`glass-card rounded-xl p-5 border ${accent} hover:border-brand-500/40 transition-all group`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-brand-400" />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          trend.value >= 0
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
        }`}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'blue' | 'pink';
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}
const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-slate-700/60 text-slate-300 border-slate-600/60',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  error:   'bg-rose-500/15 text-rose-400 border-rose-500/30',
  info:    'bg-brand-500/15 text-brand-300 border-brand-500/30',
  purple:  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  blue:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  pink:    'bg-pink-500/15 text-pink-400 border-pink-500/30',
};
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm', dot }) => (
  <span className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${BADGE_STYLES[variant]} ${
    size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  }`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${
      variant === 'success' ? 'bg-emerald-400' :
      variant === 'warning' ? 'bg-amber-400' :
      variant === 'error' ? 'bg-rose-400' :
      variant === 'info' ? 'bg-brand-400' : 'bg-slate-400'
    }`} />}
    {children}
  </span>
);

// ─── PostStatusBadge ──────────────────────────────────────────────────────────
import { PostStatus } from '../types/platform';
export const PostStatusBadge: React.FC<{ status: PostStatus }> = ({ status }) => {
  const map: Record<PostStatus, { label: string; variant: BadgeVariant }> = {
    draft:            { label: 'Draft',            variant: 'default' },
    awaiting_approval:{ label: 'Awaiting Approval', variant: 'warning' },
    scheduled:        { label: 'Scheduled',        variant: 'info' },
    published:        { label: 'Published',        variant: 'success' },
    failed:           { label: 'Failed',           variant: 'error' },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
};

// ─── PlatformBadge ────────────────────────────────────────────────────────────
import { SocialPlatform } from '../types/platform';
export const PlatformBadge: React.FC<{ platform: SocialPlatform }> = ({ platform }) => (
  <Badge variant={platform === 'linkedin' ? 'blue' : 'pink'} size="sm">
    {platform === 'linkedin' ? '💼 LinkedIn' : '📸 Instagram'}
  </Badge>
);

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  demoLabel?: boolean;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title, subtitle, icon: Icon, actions, demoLabel,
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-brand-400" />
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          {demoLabel && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 uppercase tracking-wider">
              Demo
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// ─── GlassCard ────────────────────────────────────────────────────────────────
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hover, onClick }) => (
  <div
    onClick={onClick}
    className={`glass-card rounded-xl border border-slate-800/80 ${
      hover ? 'hover:border-brand-500/40 cursor-pointer' : ''
    } ${onClick ? 'cursor-pointer' : ''} transition-all ${className}`}
  >
    {children}
  </div>
);

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ElementType;
  loading?: boolean;
  children: React.ReactNode;
}
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-600/25',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600',
  ghost:     'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200',
  danger:    'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 hover:border-rose-500/50',
  success:   'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30',
};
const BUTTON_SIZES: Record<string, string> = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3.5 py-2 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
};
export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary', size = 'sm', icon: Icon, loading, children, className = '', disabled, ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all
      hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
      ${BUTTON_STYLES[variant]} ${BUTTON_SIZES[size]} ${className}`}
  >
    {loading ? (
      <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
    ) : Icon ? (
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    ) : null}
    {children}
  </button>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-slate-300 mb-1.5">{title}</h3>
    <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">{description}</p>
    {action}
  </div>
);

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; label?: string }> = ({
  size = 'md', label
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className={`border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin ${
      size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
    }`} />
    {label && <p className="text-xs text-slate-400">{label}</p>}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
const TOAST_ICONS = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-900/80 border-emerald-500/40 text-emerald-300',
  error:   'bg-rose-900/80 border-rose-500/40 text-rose-300',
  warning: 'bg-amber-900/80 border-amber-500/40 text-amber-300',
  info:    'bg-brand-900/80 border-brand-500/40 text-brand-300',
};
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => {
      const Icon = TOAST_ICONS[t.type];
      return (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl pointer-events-auto ${TOAST_STYLES[t.type]}`}
          style={{ animation: 'slideInRight 0.25s ease' }}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    })}
  </div>
);

// ─── useToast hook ────────────────────────────────────────────────────────────
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  const show = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return { toasts, show, dismiss };
};

// ─── ConfirmDialog ────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, variant = 'default'
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── PageWrapper ──────────────────────────────────────────────────────────────
export const PageWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className = ''
}) => (
  <main className={`flex-1 p-6 overflow-y-auto ${className}`}>
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </main>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ElementType; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
    {tabs.map(tab => {
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active === tab.id
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              active === tab.id ? 'bg-brand-500/30 text-brand-300' : 'bg-slate-700 text-slate-400'
            }`}>{tab.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
}
export const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4">
    {(label || description) && (
      <div>
        {label && <p className="text-sm font-medium text-slate-200">{label}</p>}
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    )}
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-brand-600' : 'bg-slate-700'
      }`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

// ─── Confidence Bar ───────────────────────────────────────────────────────────
export const ConfidenceBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div className="space-y-1">
    {label && <div className="flex justify-between text-xs text-slate-400">
      <span>{label}</span><span className="text-brand-300 font-semibold">{value}%</span>
    </div>}
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          value >= 90 ? 'bg-emerald-500' : value >= 75 ? 'bg-brand-500' : 'bg-amber-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);
