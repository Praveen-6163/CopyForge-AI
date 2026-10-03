import { GenerationResponse } from '../types/generation';
import { ScheduledPost } from '../types/platform';

const STORAGE_KEY = 'copyforge_scheduled_posts_v1';

export const getScheduledPosts = (): ScheduledPost[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const posts: unknown = JSON.parse(stored);
    if (!Array.isArray(posts)) throw new Error('Saved scheduled posts are not a list.');
    return posts as ScheduledPost[];
  } catch (error) {
    console.warn('Could not load locally scheduled drafts.', error);
    return [];
  }
};

export const scheduleGeneration = (
  generation: GenerationResponse,
  postingTime: string,
): ScheduledPost => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(postingTime)) {
    throw new Error('Choose a valid posting time.');
  }

  const [hours, minutes] = postingTime.split(':').map(Number);
  const scheduledAt = new Date();
  scheduledAt.setHours(hours, minutes, 0, 0);
  if (scheduledAt.getTime() <= Date.now()) scheduledAt.setDate(scheduledAt.getDate() + 1);

  const post: ScheduledPost = {
    id: `scheduled-${generation.id}-${generation.platform.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    topic: generation.product_name,
    platform: generation.platform === 'Instagram' ? 'instagram' : 'linkedin',
    contentType: 'Trending Topic',
    scheduledAt: scheduledAt.toISOString(),
    status: 'scheduled',
    content: generation.generated_content,
    imageUrl: '/assets/ai_agent_sculpture.jpg',
  };

  const existing = getScheduledPosts().filter((item) => item.id !== post.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...existing].slice(0, 100)));
  return post;
};
