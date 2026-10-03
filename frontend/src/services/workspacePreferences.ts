import { AudienceType, ObjectiveType, PlatformType, ToneType } from '../types/generation';

const STORAGE_KEY = 'copyforge_workspace_preferences_v1';

const PLATFORMS: PlatformType[] = ['LinkedIn', 'Instagram', 'Email', 'X/Twitter', 'Facebook', 'Website'];
const TONES: ToneType[] = ['Professional', 'Friendly', 'Witty', 'Persuasive', 'Premium', 'Casual', 'Inspirational', 'Technical'];
const AUDIENCES: AudienceType[] = ['General', 'Students', 'Developers', 'Professionals', 'Business Owners', 'Custom'];
const OBJECTIVES: ObjectiveType[] = ['Product launch', 'Product promotion', 'Awareness', 'Engagement', 'Announcement', 'Educational'];

export interface WorkspacePreferences {
  defaultPlatform: PlatformType;
  defaultTone: ToneType;
  defaultAudience: AudienceType;
  defaultObjective: ObjectiveType;
  automationEnabled: boolean;
  postingTime: string;
}

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = {
  defaultPlatform: 'LinkedIn',
  defaultTone: 'Professional',
  defaultAudience: 'Professionals',
  defaultObjective: 'Product launch',
  automationEnabled: false,
  postingTime: '06:00',
};

const isOption = <T extends string>(value: unknown, options: T[]): value is T =>
  typeof value === 'string' && options.some((option) => option === value);

export const getWorkspacePreferences = (): WorkspacePreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_WORKSPACE_PREFERENCES;

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Stored workspace preferences are not an object.');
    }
    const preferences = parsed as Partial<WorkspacePreferences>;

    return {
      defaultPlatform: isOption(preferences.defaultPlatform, PLATFORMS)
        ? preferences.defaultPlatform : DEFAULT_WORKSPACE_PREFERENCES.defaultPlatform,
      defaultTone: isOption(preferences.defaultTone, TONES)
        ? preferences.defaultTone : DEFAULT_WORKSPACE_PREFERENCES.defaultTone,
      defaultAudience: isOption(preferences.defaultAudience, AUDIENCES)
        ? preferences.defaultAudience : DEFAULT_WORKSPACE_PREFERENCES.defaultAudience,
      defaultObjective: isOption(preferences.defaultObjective, OBJECTIVES)
        ? preferences.defaultObjective : DEFAULT_WORKSPACE_PREFERENCES.defaultObjective,
      automationEnabled: typeof preferences.automationEnabled === 'boolean'
        ? preferences.automationEnabled : DEFAULT_WORKSPACE_PREFERENCES.automationEnabled,
      postingTime: typeof preferences.postingTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(preferences.postingTime)
        ? preferences.postingTime : DEFAULT_WORKSPACE_PREFERENCES.postingTime,
    };
  } catch (error) {
    console.warn('Could not read workspace preferences; using defaults.', error);
    return DEFAULT_WORKSPACE_PREFERENCES;
  }
};

export const saveWorkspacePreferences = (preferences: WorkspacePreferences): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};
