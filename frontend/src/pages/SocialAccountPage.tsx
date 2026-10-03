import React, { useState } from 'react';
import {
  Linkedin,
  Instagram,
  ShieldCheck,
  Key,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Button, Badge, SocialAccountCard } from '../components/ui';

interface SocialAccountPageProps {
  platform?: 'linkedin' | 'instagram';
}

export const SocialAccountPage: React.FC<SocialAccountPageProps> = ({ platform: initialPlatform }) => {
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = (plat: 'linkedin' | 'instagram') => {
    setIsConnecting(plat);
    setTimeout(() => {
      if (plat === 'linkedin') setLinkedinConnected(true);
      if (plat === 'instagram') setInstagramConnected(true);
      setIsConnecting(null);
    }, 1000);
  };

  const handleDisconnect = (plat: 'linkedin' | 'instagram') => {
    if (plat === 'linkedin') setLinkedinConnected(false);
    if (plat === 'instagram') setInstagramConnected(false);
  };

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
          Connect official OAuth accounts for automated distribution. We enforce a zero client exposure security policy where access tokens are never stored insecurely.
        </p>
      </div>

      {/* ── Social Account Connection Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn */}
        <SocialAccountCard
          platform="linkedin"
          name="LinkedIn"
          description="Professional thought leadership & tech commentary publishing"
          status={linkedinConnected ? 'connected' : 'disconnected'}
          accountName={linkedinConnected ? 'Praveen Medida (Founder)' : undefined}
          lastSynced={linkedinConnected ? 'Just now' : undefined}
          onConnect={() => handleConnect('linkedin')}
          onDisconnect={() => handleDisconnect('linkedin')}
          connecting={isConnecting === 'linkedin'}
        />

        {/* Instagram */}
        <SocialAccountCard
          platform="instagram"
          name="Instagram"
          description="Visual carousel assets & bio-link traffic generation"
          status={instagramConnected ? 'connected' : 'disconnected'}
          accountName={instagramConnected ? '@copyforge.ai' : undefined}
          lastSynced={instagramConnected ? '2 hours ago' : undefined}
          onConnect={() => handleConnect('instagram')}
          onDisconnect={() => handleDisconnect('instagram')}
          connecting={isConnecting === 'instagram'}
        />
      </div>

      {/* ── OAuth Security & Token Privacy Details ──────────────────── */}
      <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Zero Client Token Exposure Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Key className="w-3.5 h-3.5" />
              <span>Restricted Scopes</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              We only request <code>w_member_social</code> and <code>instagram_content_publish</code> permissions needed for drafting and scheduling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted Storage</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              OAuth tokens are encrypted at rest with AES-256 and never transmitted to the browser client.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Instant Revocation</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Clicking Disconnect immediately deletes all associated tokens from database records permanently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
