export interface LinkedInConnectionStatus {
  configured: boolean;
  connected: boolean;
  provider?: 'linkedin';
  member_id?: string;
  display_name?: string;
  profile_image?: string | null;
  token_expires_at?: number;
  connected_at?: string;
  error?: 'token_expired';
}

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const backendOrigin = configuredApiBase?.replace(/\/api$/, '') || '';

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${backendOrigin}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`LinkedIn service returned HTTP ${response.status}.`);
  }
  return response.json() as Promise<T>;
};

export const fetchLinkedInStatus = (): Promise<LinkedInConnectionStatus> =>
  request<LinkedInConnectionStatus>('/api/social/linkedin/status');

export const disconnectLinkedIn = (): Promise<{ disconnected: boolean }> =>
  request<{ disconnected: boolean }>('/api/social/linkedin/disconnect', { method: 'POST' });

export const getLinkedInAuthorizationUrl = (): string => `${backendOrigin}/auth/linkedin`;
