import { apiClient } from './api';

export type SocialPlatform = 'linkedin' | 'instagram';
export type PostStatus =
  | 'draft'
  | 'awaiting_approval'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';
export type PublishMode = 'draft_only' | 'approval_required' | 'auto_publish';

export interface TrendItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  published_at: string | null;
  retrieved_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content_item_id: string | null;
  topic: string | null;
  content_type: string | null;
  hook?: string | null;
  cta?: string | null;
  hashtags?: string[];
  image_prompt?: string | null;
  platform: SocialPlatform;
  content: string;
  image_url: string | null;
  scheduled_at: string | null;
  timezone: string;
  mode: PublishMode;
  status: PostStatus;
  published_url: string | null;
  published_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostCreate {
  topic: string;
  description?: string;
  platform: SocialPlatform;
  content: string;
  tone?: string;
  audience?: string;
  content_type?: string;
  hook?: string | null;
  cta?: string | null;
  hashtags?: string[];
  image_prompt?: string | null;
  image_url?: string | null;
  scheduled_at?: string | null;
  timezone: string;
  mode: PublishMode;
}

export interface AutomationSettings {
  enabled: boolean;
  platform: SocialPlatform;
  topic: string;
  description: string;
  tone: string;
  audience: string;
  content_type: string;
  frequency: 'daily';
  posting_time: string;
  timezone: string;
  mode: PublishMode;
  next_run_at?: string | null;
  last_run_at?: string | null;
  last_run_error?: string | null;
}

export interface PublishedPost {
  id: string;
  scheduled_post_id: string;
  platform: SocialPlatform;
  content: string;
  image_url: string | null;
  published_url: string;
  published_at: string;
  analytics_status: string;
}

export const fetchTrends = async (refresh = false): Promise<TrendItem[]> => {
  const response = await apiClient.get<TrendItem[]>('/trends', {
    params: refresh ? { refresh: true } : undefined,
  });
  return response.data;
};

export const refreshTrends = async (): Promise<void> => {
  await apiClient.post('/trends/refresh');
};

export const generateImage = async (
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '4:5',
): Promise<{ id: string; url: string; created_at: string }> => {
  const response = await apiClient.post('/images/generate', {
    prompt,
    aspect_ratio: aspectRatio,
  });
  return response.data;
};

export const fetchPosts = async (status?: PostStatus): Promise<ScheduledPost[]> => {
  const response = await apiClient.get<ScheduledPost[]>('/posts', {
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const createPost = async (payload: PostCreate): Promise<ScheduledPost> => {
  const response = await apiClient.post<ScheduledPost>('/posts', payload);
  return response.data;
};

export const fetchApprovals = async (): Promise<ScheduledPost[]> => {
  const response = await apiClient.get<ScheduledPost[]>('/approvals');
  return response.data;
};

export const updateApproval = async (
  id: string,
  action: 'approve' | 'reject',
): Promise<ScheduledPost> => {
  const response = await apiClient.post<ScheduledPost>(`/approvals/${id}/${action}`);
  return response.data;
};

export const publishPost = async (id: string): Promise<ScheduledPost> => {
  const response = await apiClient.post<ScheduledPost>(`/posts/${id}/publish`);
  return response.data;
};

export const fetchPublishedPosts = async (): Promise<PublishedPost[]> => {
  const response = await apiClient.get<PublishedPost[]>('/published');
  return response.data;
};

export interface AnalyticsSummary {
  published_count: number;
  scheduled_count: number;
  approval_count: number;
  analytics_available: boolean;
  message: string;
}

export const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  const response = await apiClient.get<AnalyticsSummary>('/analytics');
  return response.data;
};

export const fetchAutomation = async (): Promise<AutomationSettings> => {
  const response = await apiClient.get<AutomationSettings>('/automation');
  return response.data;
};

export const saveAutomation = async (
  settings: AutomationSettings,
): Promise<AutomationSettings> => {
  const response = await apiClient.put<AutomationSettings>('/automation', settings);
  return response.data;
};
