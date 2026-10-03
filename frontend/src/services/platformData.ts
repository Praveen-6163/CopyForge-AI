import {
  TrendTopic, ScheduledPost, ApprovalItem, SocialAccount,
  AutomationConfig, AIVoiceProfile, AnalyticsData, DashboardStats
} from '../types/platform';

// ─── Seed Data ────────────────────────────────────────────────────────────────
// All data below is DEMO / MOCK only.
// Replace with real API calls when backend is connected.

export const DEMO_TRENDS: TrendTopic[] = [
  { id: 't1', topic: 'Gemini 2.0 Flash', source: 'Google Blog', recency: '1h ago', relevanceScore: 97, contentPotential: 'High', category: 'AI Models', trending: true },
  { id: 't2', topic: 'Generative AI in Enterprise', source: 'TechCrunch', recency: '3h ago', relevanceScore: 92, contentPotential: 'High', category: 'Enterprise AI', trending: true },
  { id: 't3', topic: 'AI Agents & Agentic Workflows', source: 'OpenAI Blog', recency: '5h ago', relevanceScore: 95, contentPotential: 'High', category: 'AI Agents', trending: true },
  { id: 't4', topic: 'Open Source LLMs', source: 'HuggingFace', recency: '6h ago', relevanceScore: 88, contentPotential: 'High', category: 'Open Source', trending: false },
  { id: 't5', topic: 'Machine Learning Ops', source: 'ML News', recency: '8h ago', relevanceScore: 80, contentPotential: 'Medium', category: 'MLOps', trending: false },
  { id: 't6', topic: 'Data Science Careers 2026', source: 'LinkedIn Insights', recency: '10h ago', relevanceScore: 75, contentPotential: 'Medium', category: 'Career', trending: false },
  { id: 't7', topic: 'Prompt Engineering Best Practices', source: 'Anthropic', recency: '12h ago', relevanceScore: 85, contentPotential: 'High', category: 'AI Skills', trending: true },
  { id: 't8', topic: 'Vector Databases & RAG', source: 'Pinecone Blog', recency: '14h ago', relevanceScore: 83, contentPotential: 'Medium', category: 'AI Infrastructure', trending: false },
];

export const DEMO_SCHEDULED_POSTS: ScheduledPost[] = [
  {
    id: 'p1',
    topic: 'Gemini 2.0 Flash — What Developers Need to Know',
    platform: 'linkedin',
    contentType: 'AI News',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    content: '🚀 Google just dropped Gemini 2.0 Flash and the performance gains are remarkable. Here\'s what every developer and AI practitioner needs to understand about this release...',
    imageUrl: undefined,
  },
  {
    id: 'p2',
    topic: 'Building with AI Agents in 2026',
    platform: 'instagram',
    contentType: 'Educational',
    scheduledAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'awaiting_approval',
    content: '✨ AI Agents are rewriting how software works. Here\'s a breakdown of the top frameworks developers are using to build autonomous workflows...',
    imageUrl: undefined,
  },
  {
    id: 'p3',
    topic: 'Open Source AI Weekly Roundup',
    platform: 'linkedin',
    contentType: 'Industry Insight',
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    content: 'This week in open source AI: Mistral drops a new model, Meta releases Llama updates, and the community builds something incredible...',
    publishedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    engagementData: { likes: 312, comments: 47, shares: 89, clicks: 1204, impressions: 18500 },
  },
  {
    id: 'p4',
    topic: 'Prompt Engineering Masterclass Thread',
    platform: 'linkedin',
    contentType: 'Tutorial',
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    content: 'Most people are using AI wrong. Here are 7 prompt engineering techniques that will 10x your output quality...',
  },
  {
    id: 'p5',
    topic: 'My AI Stack in 2026',
    platform: 'instagram',
    contentType: 'Personal Brand',
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    content: 'Here\'s the exact AI tool stack I use every single day to build, write, and grow — a visual breakdown...',
  },
];

export const DEMO_APPROVAL_ITEMS: ApprovalItem[] = [
  {
    id: 'a1',
    topic: 'Gemini 2.0 Flash — Developer Guide',
    platform: 'linkedin',
    contentType: 'AI News',
    content: '🚀 Google just released Gemini 2.0 Flash. After testing it extensively, here\'s what stands out:\n\n✅ 2x faster inference than Gemini 1.5\n✅ Native multimodal input (text, image, audio, video)\n✅ 1M token context window maintained\n✅ Available via Google AI Studio and Vertex AI\n\nFor developers building AI applications, this changes the cost-performance equation significantly. The latency improvements alone make real-time applications much more viable.\n\nWhat are you building with Gemini? Drop it in the comments 👇\n\n#GoogleAI #Gemini #AIDevs #GenerativeAI #MachineLearning',
    hashtags: ['#GoogleAI', '#Gemini', '#AIDevs', '#GenerativeAI', '#MachineLearning'],
    aiConfidence: 94,
    source: 'Google Blog + TechCrunch',
    generatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'a2',
    topic: 'AI Agents — The Future of Software',
    platform: 'instagram',
    contentType: 'Educational',
    content: '🤖 AI Agents are here and they\'re changing everything\n\nHere\'s what you need to know:\n\n📌 What are AI Agents?\nSoftware that perceives its environment, makes decisions, and takes actions autonomously.\n\n📌 Top frameworks in 2026:\n• LangGraph — State machines for agents\n• AutoGen — Multi-agent conversations\n• CrewAI — Role-based agent teams\n• OpenAI Assistants — Production-ready\n\n📌 Real use cases:\n✨ Automated research workflows\n✨ Code generation pipelines\n✨ Customer service agents\n\nSave this for your next AI project! 🔖\n\n#AIAgents #GenerativeAI #MachineLearning #AITools',
    hashtags: ['#AIAgents', '#GenerativeAI', '#MachineLearning', '#AITools'],
    aiConfidence: 89,
    source: 'OpenAI Blog + Anthropic Research',
    generatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'a3',
    topic: 'Vector Databases Explained',
    platform: 'linkedin',
    contentType: 'Tutorial',
    content: 'Vector databases are the backbone of modern RAG applications. Here\'s a concise technical breakdown for developers getting started with semantic search and retrieval-augmented generation...',
    hashtags: ['#VectorDB', '#RAG', '#AI', '#LLM', '#Pinecone'],
    aiConfidence: 87,
    source: 'Pinecone Blog + Weaviate Docs',
    generatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
];

export const DEMO_SOCIAL_ACCOUNTS: SocialAccount[] = [
  {
    platform: 'linkedin',
    connected: false,
  },
  {
    platform: 'instagram',
    connected: false,
  },
];

export const DEMO_AUTOMATION_CONFIG: AutomationConfig = {
  enabled: false,
  scheduleTime: '06:00',
  timezone: 'Asia/Kolkata',
  mode: 'approval_required',
  platforms: ['linkedin', 'instagram'],
  topicsPerRun: 3,
  maxPostsPerDay: 2,
};

export const DEMO_AI_VOICE: AIVoiceProfile = {
  writingStyle: 'Clear, concise, and insightful — lead with value, not fluff.',
  preferredTone: 'Professional with a friendly edge',
  topics: ['Generative AI', 'Machine Learning', 'Software Development', 'AI Tools', 'Career Growth'],
  audience: 'Developers, AI practitioners, and tech professionals',
  wordsToAvoid: ['leverage', 'synergy', 'disruptive', 'game-changer', 'guru'],
  preferredHashtags: ['#GenerativeAI', '#MachineLearning', '#AIDevs', '#OpenSource', '#TechCareers'],
  ctaStyle: 'Question-based to drive comments (e.g. "What\'s your take on this?")',
  samplePost: '',
};

export const DEMO_ANALYTICS: AnalyticsData = {
  postsPublished: 47,
  engagementRate: 6.8,
  totalLikes: 3241,
  totalComments: 489,
  totalShares: 712,
  totalClicks: 9834,
  byPlatform: {
    linkedin: { posts: 28, engagement: 7.2, reach: 42000 },
    instagram: { posts: 19, engagement: 6.1, reach: 18500 },
  },
  topPerforming: DEMO_SCHEDULED_POSTS.filter(p => p.status === 'published'),
  weeklyData: [
    { day: 'Mon', linkedin: 420, instagram: 180 },
    { day: 'Tue', linkedin: 380, instagram: 210 },
    { day: 'Wed', linkedin: 510, instagram: 290 },
    { day: 'Thu', linkedin: 440, instagram: 240 },
    { day: 'Fri', linkedin: 620, instagram: 370 },
    { day: 'Sat', linkedin: 290, instagram: 510 },
    { day: 'Sun', linkedin: 210, instagram: 390 },
  ],
};

export const DEMO_DASHBOARD_STATS: DashboardStats = {
  postsPublished: 47,
  postsScheduled: 3,
  pendingApproval: 3,
  trendsDiscovered: 8,
  engagementRate: 6.8,
  connectedAccounts: 0, // Will update when OAuth implemented
};

// ─── Automation Timeline ──────────────────────────────────────────────────────
export const AUTOMATION_TIMELINE = [
  { time: '06:00 AM', label: 'AI Trend Scan', desc: 'Research latest AI/technology news & trending topics', status: 'idle' as const, icon: 'radar' },
  { time: '06:15 AM', label: 'Content Generation', desc: 'Generate LinkedIn + Instagram content for top topics', status: 'idle' as const, icon: 'brain' },
  { time: '06:25 AM', label: 'Visual Generation', desc: 'Generate platform-optimized post images', status: 'idle' as const, icon: 'image' },
  { time: '06:30 AM', label: 'Quality Check', desc: 'Validate sources, content accuracy, and brand voice', status: 'idle' as const, icon: 'shield' },
  { time: '06:35 AM', label: 'Publishing', desc: 'Send for approval or auto-publish to connected accounts', status: 'idle' as const, icon: 'send' },
];
