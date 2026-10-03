import { useCallback, useEffect, useState } from 'react';
import {
  disconnectLinkedIn,
  fetchLinkedInStatus,
  getLinkedInAuthorizationUrl,
  LinkedInConnectionStatus,
} from '../services/linkedinOAuth';

const CALLBACK_MESSAGES: Record<string, string> = {
  connected: 'LinkedIn Connected.',
  cancelled: 'LinkedIn authorization was cancelled.',
  not_configured: 'LinkedIn is not configured on the CopyForge backend.',
};

const FAILURE_MESSAGES: Record<string, string> = {
  state: 'Connection failed: the LinkedIn sign-in session expired or could not be verified. Please try again.',
  authorization: 'Connection failed: LinkedIn authorization was declined.',
  code: 'Connection failed: LinkedIn could not validate the authorization code. Please try again.',
  token: 'Connection failed: the authorization token was rejected. Please reconnect.',
  permissions: 'Connection failed: LinkedIn did not grant the required member posting permission.',
  network: 'Connection failed: could not reach LinkedIn. Check your connection and try again.',
  provider: 'Connection failed: LinkedIn could not complete the request. Please try again later.',
  profile: 'Connection failed: LinkedIn did not return the required profile details.',
  storage: 'Connection failed: the server could not securely save this LinkedIn connection.',
};

export interface LinkedInStatusState {
  status: LinkedInConnectionStatus | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  backendUnavailable: boolean;
  error: string;
  notice: string;
  connect: () => void;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useLinkedInStatus = (): LinkedInStatusState => {
  const [status, setStatus] = useState<LinkedInConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setBackendUnavailable(false);
    try {
      const result = await fetchLinkedInStatus();
      setStatus(result);
      setBackendUnavailable(false);
      if (result.error === 'token_expired') {
        setError('Connection failed: your LinkedIn access token has expired. Reconnect to continue.');
      } else {
        setError('');
      }
    } catch {
      setStatus(null);
      setBackendUnavailable(true);
      setError('CopyForge backend is unavailable. Start or configure the backend to use LinkedIn OAuth.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackResult = params.get('linkedin');
    const callbackReason = params.get('reason');
    if (callbackResult) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
    }
    void (async () => {
      await refresh();
      if (callbackResult === 'failed') {
        setError(FAILURE_MESSAGES[callbackReason || ''] || 'LinkedIn connection failed. Please try again.');
      } else if (callbackResult) {
        setNotice(CALLBACK_MESSAGES[callbackResult] || '');
      }
    })();
  }, [refresh]);

  useEffect(() => {
    if (status?.error !== 'token_expired' || !status.connected) return;
    setError('Connection failed: your LinkedIn access token has expired. Reconnect to continue.');
  }, [status]);

  const connect = useCallback(() => {
    if (!status?.configured || backendUnavailable) return;
    setConnecting(true);
    setError('');
    window.location.assign(getLinkedInAuthorizationUrl());
  }, [backendUnavailable, status?.configured]);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    setError('');
    try {
      const result = await disconnectLinkedIn();
      if (!result.disconnected) throw new Error('Disconnect was not confirmed.');
      setStatus((current) => current ? { ...current, connected: false } : current);
      setNotice('LinkedIn has been disconnected.');
    } catch {
      setError('Could not disconnect LinkedIn. Check that the backend is available and try again.');
    } finally {
      setDisconnecting(false);
    }
  }, []);

  return {
    status,
    loading,
    connecting,
    disconnecting,
    backendUnavailable,
    error,
    notice,
    connect,
    disconnect,
    refresh,
  };
};
