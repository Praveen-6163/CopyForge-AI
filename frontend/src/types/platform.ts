// ─── Platform Types ───────────────────────────────────────────────────────────
export type SocialPlatform = 'linkedin' | 'instagram';
export type PostStatus = 'draft' | 'awaiting_approval' | 'scheduled' | 'published' | 'failed';
export type AutomationMode = 'draft_only' | 'approval_required' | 'auto_publish';
export type ContentType = 'AI News' | 'Educational' | 'Tutorial' | 'Career' | 'Project Showcase' | 'Industry Insight' | 'Trending Topic' | 'Personal Brand';

// ─── Trend ───────────────────────────────────────────────────────────────────
export interface TrendTopic {
  id: string;
  topic: string;
  source: string;
  recency: string;          // e.g. "2h ago"
  relevanceScore: number;   // 0-100
  contentPotential: 'High' | 'Medium' | 'Low';
  category: string;
  trending: boolean;
}

// ─── Scheduled / Published Post ──────────────────────────────────────────────
export interface ScheduledPost {
  id: string;
  topic: string;
  platform: SocialPlatform;
  contentType: ContentType;
  scheduledAt: string;      // ISO string
  status: PostStatus;
  content: string;
  imageUrl?: string;
  approvedBy?: string;
  publishedAt?: string;
  engagementData?: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    impressions: number;
  };
}

// ─── Approval Item ────────────────────────────────────────────────────────────
export interface ApprovalItem {
  id: string;
  topic: string;
  platform: SocialPlatform;
  contentType: ContentType;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  aiConfidence: number;
  source: string;
  generatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── Social Account ───────────────────────────────────────────────────────────
export interface SocialAccount {
  platform: SocialPlatform;
  connected: boolean;
  accountName?: string;
  profileUrl?: string;
  avatarUrl?: string;
  lastSynced?: string;
  followerCount?: number;
  connectionId?: string;    // backend integration point
}

// ─── Automation Config ────────────────────────────────────────────────────────
export interface AutomationConfig {
  enabled: boolean;
  scheduleTime: string;     // "06:00"
  timezone: string;
  mode: AutomationMode;
  platforms: SocialPlatform[];
  topicsPerRun: number;
  maxPostsPerDay: number;
}

// ─── AI Voice Profile ─────────────────────────────────────────────────────────
export interface AIVoiceProfile {
  writingStyle: string;
  preferredTone: string;
  topics: string[];
  audience: string;
  wordsToAvoid: string[];
  preferredHashtags: string[];
  ctaStyle: string;
  samplePost?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsData {
  postsPublished: number;
  engagementRate: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  byPlatform: {
    linkedin: { posts: number; engagement: number; reach: number };
    instagram: { posts: number; engagement: number; reach: number };
  };
  topPerforming: ScheduledPost[];
  weeklyData: { day: string; linkedin: number; instagram: number }[];
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export interface DashboardStats {
  postsPublished: number;
  postsScheduled: number;
  pendingApproval: number;
  trendsDiscovered: number;
  engagementRate: number;
  connectedAccounts: number;
}
