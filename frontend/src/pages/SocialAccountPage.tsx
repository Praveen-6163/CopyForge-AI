import React from 'react';
import {
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { SocialAccountCard } from '../components/ui';
import { useLinkedInStatus } from '../hooks/useLinkedInStatus';

interface SocialAccountPageProps {
  platform?: 'linkedin' | 'instagram';
}

export const SocialAccountPage: React.FC<SocialAccountPageProps> = ({ platform: initialPlatform }) => {
  const linkedin = useLinkedInStatus();
  const linkedinStatus = linkedin.status;
  const lastSynced = linkedinStatus?.connected_at
    ? new Date(linkedinStatus.connected_at).toLocaleString()
    : undefined;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5 pb-6 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          CHANNELS & AUTHENTICATION
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Social Accounts Hub
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
          Connect LinkedIn through its official OAuth authorization flow. CopyForge never asks for your social password.
        </p>
      </div>

      {linkedin.loading && (
        <p role="status" className="text-sm text-slate-400">Checking LinkedIn connection…</p>
      )}
      {linkedin.notice && (
        <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {linkedin.notice}
        </p>
      )}
      {linkedin.error && (
        <p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {linkedin.error}
        </p>
      )}
      {!linkedin.loading && !linkedin.backendUnavailable && !linkedinStatus?.configured && (
        <p role="status" className="rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-3 text-sm text-slate-300">
          LinkedIn not configured. Add the LinkedIn OAuth environment variables to the backend to enable connection.
        </p>
      )}

      {/* ── Social Account Connection Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn */}
        <SocialAccountCard
          platform="linkedin"
          name="LinkedIn"
          description="Professional thought leadership & tech commentary publishing"
          status={linkedin.backendUnavailable
            ? 'unavailable'
            : linkedinStatus?.connected
              ? 'connected'
              : 'disconnected'}
          accountName={linkedinStatus?.display_name}
          profileImage={linkedinStatus?.profile_image}
          lastSynced={lastSynced}
          connectedLabel="LinkedIn Connected"
          onConnect={linkedin.connect}
          onDisconnect={() => void linkedin.disconnect()}
          connecting={linkedin.connecting}
          disconnecting={linkedin.disconnecting}
          connectAvailable={Boolean(linkedinStatus?.configured) && !linkedin.loading && !linkedin.backendUnavailable}
          connectLabel={linkedin.backendUnavailable
            ? 'Backend unavailable'
            : linkedinStatus?.configured
              ? 'Connect LinkedIn'
              : 'LinkedIn not configured'}
          unavailableMessage={linkedin.backendUnavailable
            ? 'CopyForge backend is unavailable.'
            : 'LinkedIn OAuth is not configured on the server.'}
        />

        {/* Instagram */}
        <SocialAccountCard
          platform="instagram"
          name="Instagram"
          description="Visual carousel assets & bio-link traffic generation"
          status="disconnected"
          connectAvailable={false}
          unavailableMessage="Instagram OAuth is not configured in this demo."
        />
      </div>

      {/* ── OAuth Security & Token Privacy Details ──────────────────── */}
      <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          LinkedIn integration status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Official OAuth 2.0</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              LinkedIn uses server-side OAuth and requests profile identity plus member social posting permission. Instagram remains a demo integration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Server-side token storage</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              LinkedIn access tokens are encrypted and stored only by the backend. No access token or client secret is returned to the browser.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Publishing unavailable</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This connection flow does not publish posts. Publishing should only be enabled after a separate posting workflow is implemented and authorized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
