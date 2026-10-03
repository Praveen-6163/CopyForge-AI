import React from 'react';
import {
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { SocialAccountCard } from '../components/ui';

interface SocialAccountPageProps {
  platform?: 'linkedin' | 'instagram';
}

export const SocialAccountPage: React.FC<SocialAccountPageProps> = ({ platform: initialPlatform }) => {
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
          Social account cards are previews only. This demo has no OAuth credentials and cannot access or publish to your accounts.
        </p>
      </div>

      {/* ── Social Account Connection Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn */}
        <SocialAccountCard
          platform="linkedin"
          name="LinkedIn"
          description="Professional thought leadership & tech commentary publishing"
          status="disconnected"
          connectAvailable={false}
        />

        {/* Instagram */}
        <SocialAccountCard
          platform="instagram"
          name="Instagram"
          description="Visual carousel assets & bio-link traffic generation"
          status="disconnected"
          connectAvailable={false}
        />
      </div>

      {/* ── OAuth Security & Token Privacy Details ──────────────────── */}
      <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Demo Integration Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>OAuth unavailable</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              LinkedIn and Instagram sign-in has not been configured. Connect buttons are disabled and do not create fake accounts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local demo only</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              This browser demo stores generated drafts locally. It does not request or store social access tokens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Publishing unavailable</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Posts cannot be published until a server-side integration and provider credentials are configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
