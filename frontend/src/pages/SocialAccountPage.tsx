import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { SocialAccountCard } from '../components/ui';
import { useLinkedInStatus } from '../hooks/useLinkedInStatus';
import { apiClient } from '../services/api';
import { getBackendOrigin } from '../services/linkedinOAuth';

interface InstagramStatus {
  configured: boolean;
  connected: boolean;
  display_name?: string;
  profile_image?: string | null;
  connected_at?: string;
  error?: string;
}

interface SocialAccountPageProps {
  platform?: 'linkedin' | 'instagram';
}

export const SocialAccountPage: React.FC<SocialAccountPageProps> = () => {
  const linkedin = useLinkedInStatus();
  const [instagram, setInstagram] = useState<InstagramStatus | null>(null);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [instagramConnecting, setInstagramConnecting] = useState(false);
  const [instagramDisconnecting, setInstagramDisconnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refreshInstagram = useCallback(async () => {
    setInstagramLoading(true);
    try {
      const response = await apiClient.get<InstagramStatus>('/social/instagram/status');
      setInstagram(response.data);
      setError('');
    } catch {
      setInstagram(null);
      setError('Could not reach the Instagram connection service.');
    } finally {
      setInstagramLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshInstagram();
  }, [refreshInstagram]);

  const connectInstagram = () => {
    if (!instagram?.configured) {
      setMessage(
        'Instagram is not configured. Add META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI to the backend environment, then register the callback URL in Meta.',
      );
      return;
    }
    if (!linkedin.status?.connected) {
      setMessage('Connect LinkedIn to sign in before connecting Instagram.');
      return;
    }
    setInstagramConnecting(true);
    window.location.assign(`${getBackendOrigin()}/auth/instagram`);
  };

  const disconnectInstagram = async () => {
    setInstagramDisconnecting(true);
    setError('');
    try {
      const response = await apiClient.post<{ disconnected: boolean }>(
        '/social/instagram/disconnect',
      );
      if (!response.data.disconnected) throw new Error('Disconnect was not confirmed.');
      setMessage('Instagram has been disconnected.');
      await refreshInstagram();
    } catch {
      setError('Could not disconnect Instagram. Check that the backend is available and try again.');
    } finally {
      setInstagramDisconnecting(false);
    }
  };

  const lastLinkedInSync = linkedin.status?.connected_at
    ? new Date(linkedin.status.connected_at).toLocaleString()
    : undefined;
  const lastInstagramSync = instagram?.connected_at
    ? new Date(instagram.connected_at).toLocaleString()
    : undefined;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-1.5 pb-6 border-b border-white/[0.07]">
        <span className="text-[11px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
          CHANNELS & AUTHENTICATION
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Social Accounts</h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
          Connect social profiles through their official authorization flows. Tokens are stored and used only by the backend.
        </p>
      </div>

      {(linkedin.loading || instagramLoading) && (
        <p role="status" className="text-sm text-slate-400">Checking account connections…</p>
      )}
      {(message || linkedin.notice) && (
        <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message || linkedin.notice}
        </p>
      )}
      {(error || linkedin.error) && (
        <p role="alert" className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error || linkedin.error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SocialAccountCard
          platform="linkedin"
          name="LinkedIn"
          description="Professional posts and thought leadership"
          status={linkedin.backendUnavailable
            ? 'unavailable'
            : linkedin.status?.connected
              ? 'connected'
              : 'disconnected'}
          accountName={linkedin.status?.display_name}
          profileImage={linkedin.status?.profile_image}
          lastSynced={lastLinkedInSync}
          connectedLabel="Connected"
          onConnect={linkedin.connect}
          onDisconnect={() => void linkedin.disconnect()}
          connecting={linkedin.connecting}
          disconnecting={linkedin.disconnecting}
          connectAvailable={Boolean(linkedin.status?.configured) && !linkedin.loading && !linkedin.backendUnavailable}
          connectLabel="Connect LinkedIn"
          unavailableMessage="LinkedIn OAuth is not configured on the backend."
        />

        <SocialAccountCard
          platform="instagram"
          name="Instagram"
          description="Instagram Business and Creator publishing"
          status={instagramLoading
            ? 'unavailable'
            : instagram?.connected
              ? 'connected'
              : 'disconnected'}
          accountName={instagram?.display_name}
          profileImage={instagram?.profile_image}
          lastSynced={lastInstagramSync}
          connectedLabel="Connected"
          onConnect={connectInstagram}
          onDisconnect={() => void disconnectInstagram()}
          connecting={instagramConnecting}
          disconnecting={instagramDisconnecting}
          connectAvailable={!instagramLoading}
          connectLabel="Connect Instagram"
          unavailableMessage="Instagram status is unavailable from the backend."
        />
      </div>

      <div className="editorial-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Integration security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <p className="text-indigo-400 font-bold">LinkedIn OAuth 2.0</p>
            <p className="text-slate-400 leading-relaxed">
              LinkedIn identity is used to sign in. Posting credentials remain encrypted on the backend.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5">
            <p className="text-indigo-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> Instagram API
            </p>
            <p className="text-slate-400 leading-relaxed">
              Instagram requires a Meta app with Instagram Business Login and the approved publishing permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
