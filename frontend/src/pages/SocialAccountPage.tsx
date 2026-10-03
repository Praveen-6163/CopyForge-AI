import React, { useState } from 'react';
import { Linkedin, Instagram, Link2, LogOut, Shield, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import { SectionHeader, GlassCard, Button, Badge, useToast, ToastContainer, ConfirmDialog, PageWrapper } from '../components/ui';
import { SocialAccount } from '../types/platform';
import { DEMO_SOCIAL_ACCOUNTS } from '../services/platformData';

interface SocialAccountPageProps {
  platform: 'linkedin' | 'instagram';
}

const PLATFORM_INFO = {
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'blue',
    gradient: 'from-blue-600/20 to-indigo-600/20',
    border: 'border-blue-500/30',
    description: 'Connect your LinkedIn account to publish professional posts, articles, and share AI-generated content directly to your feed.',
    permissions: ['Read basic profile information', 'Read email address', 'Publish posts on your behalf (only when you initiate)'],
    oauthNote: 'LinkedIn OAuth 2.0 is configured but requires backend credentials setup.',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'pink',
    gradient: 'from-pink-600/20 to-purple-600/20',
    border: 'border-pink-500/30',
    description: 'Connect your Instagram Business or Creator account to schedule and publish visual content, captions, and Stories.',
    permissions: ['Read public profile information', 'View connected Facebook pages', 'Publish content on your behalf (only when you initiate)'],
    oauthNote: 'Instagram requires a Facebook Business account. OAuth 2.0 via Meta API.',
  },
};

export const SocialAccountPage: React.FC<SocialAccountPageProps> = ({ platform }) => {
  const [account, setAccount] = useState<SocialAccount>(
    DEMO_SOCIAL_ACCOUNTS.find(a => a.platform === platform) || { platform, connected: false }
  );
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const { toasts, show, dismiss } = useToast();
  const info = PLATFORM_INFO[platform];
  const Icon = info.icon;

  const handleConnect = () => {
    // Integration point: redirect to OAuth flow
    show('info', 'OAuth connection requires backend configuration. See integration guide below.');
  };

  const handleDisconnect = () => {
    setAccount({ platform, connected: false });
    show('success', `${info.name} account disconnected successfully.`);
    setShowDisconnectConfirm(false);
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-5 h-5 ${platform === 'linkedin' ? 'text-blue-400' : 'text-pink-400'}`} />
            <h1 className="text-2xl font-bold text-white tracking-tight">{info.name}</h1>
          </div>
          <p className="text-sm text-slate-400">Manage your {info.name} account connection</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Account Card */}
        <GlassCard className={`p-6 border ${info.border} bg-gradient-to-br ${info.gradient}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${platform === 'linkedin' ? 'text-blue-400' : 'text-pink-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{info.name}</h2>
              <div className="mt-1">
                {account.connected ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="success" dot size="md">Connected</Badge>
                    {account.accountName && (
                      <span className="text-sm text-slate-300 font-medium">@{account.accountName}</span>
                    )}
                  </div>
                ) : (
                  <Badge variant="default" size="md">Not Connected</Badge>
                )}
              </div>
            </div>
          </div>

          {account.connected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-500 text-xs mb-1">Account</p>
                  <p className="text-slate-200 font-semibold">{account.accountName || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-500 text-xs mb-1">Last Synced</p>
                  <p className="text-slate-200 font-semibold">{account.lastSynced || 'Just now'}</p>
                </div>
              </div>
              <Button variant="danger" icon={LogOut} size="md" onClick={() => setShowDisconnectConfirm(true)}>
                Disconnect {info.name}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{info.description}</p>
              <Button
                variant="primary"
                icon={Link2}
                size="md"
                onClick={handleConnect}
                className="w-full"
              >
                Connect {info.name} Account
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Permissions */}
        <GlassCard className="p-5">
          <SectionHeader title="Permissions Requested" subtitle={`What CopyForge AI will access on ${info.name}`} icon={Shield} />
          <ul className="space-y-3">
            {info.permissions.map((perm, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${platform === 'linkedin' ? 'text-blue-400' : 'text-pink-400'}`} />
                {perm}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800/60">
            CopyForge AI will never post without your explicit action. All tokens are stored server-side and encrypted at rest.
          </p>
        </GlassCard>

        {/* Integration Guide */}
        <GlassCard className="p-5">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-200 mb-2">Backend Integration Required</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                {info.oauthNote} To enable real OAuth connections, configure the following in your backend:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                <li className="font-mono">• {platform === 'linkedin' ? 'LINKEDIN_CLIENT_ID' : 'META_APP_ID'} — App credentials</li>
                <li className="font-mono">• {platform === 'linkedin' ? 'LINKEDIN_CLIENT_SECRET' : 'META_APP_SECRET'} — App secret (server-side only)</li>
                <li className="font-mono">• REDIRECT_URI — OAuth callback endpoint</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3">
                Store all credentials in environment variables. <span className="text-rose-400 font-semibold">Never expose secrets in frontend code.</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <ConfirmDialog
        isOpen={showDisconnectConfirm}
        title={`Disconnect ${info.name}?`}
        message={`Your ${info.name} account will be disconnected. All access tokens will be immediately deleted. You can reconnect at any time.`}
        confirmLabel="Yes, Disconnect"
        variant="danger"
        onConfirm={handleDisconnect}
        onCancel={() => setShowDisconnectConfirm(false)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageWrapper>
  );
};
