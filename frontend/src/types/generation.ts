export type PlatformType = 'LinkedIn' | 'Instagram' | 'Email' | 'X/Twitter' | 'Facebook' | 'Website';
export type ToneType = 'Professional' | 'Friendly' | 'Witty' | 'Persuasive' | 'Premium' | 'Casual' | 'Inspirational' | 'Technical';
export type AudienceType = 'General' | 'Students' | 'Developers' | 'Professionals' | 'Business Owners' | 'Custom';
export type ObjectiveType = 'Product launch' | 'Product promotion' | 'Awareness' | 'Engagement' | 'Announcement' | 'Educational';
export type ContentType = 'Social post' | 'Carousel' | 'Story' | 'Reel script' | 'Email newsletter' | 'Video script' | 'Ad copy';

export interface PromptParameters {
  temperature: number;
  top_p: number;
  max_tokens: number;
}

export interface GenerateRequest {
  product_name: string;
  product_description: string;
  platform: PlatformType;
  tone: ToneType;
  audience: AudienceType | string;
  objective: ObjectiveType;
  content_type: ContentType;
  additional_instructions?: string;
  parameters: PromptParameters;
}

export interface ImproveRequest {
  current_content: string;
  action: 'make_shorter' | 'make_longer' | 'enhance_persuasion' | 'change_tone' | 'change_platform' | 'fix_grammar';
  product_name: string;
  platform: PlatformType;
  tone: ToneType;
  new_tone?: ToneType;
  new_platform?: PlatformType;
  parameters: PromptParameters;
}

export interface EmailFormattedContent {
  subject: string;
  preview_text: string;
  body: string;
}

export interface FormattedContent {
  raw_text: string;
  email_data?: EmailFormattedContent | null;
  twitter_char_count?: number | null;
  twitter_limit?: number | null;
  instagram_recommended?: string | null;
  word_count: number;
  char_count: number;
}

export interface PlatformValidationResult {
  is_valid: boolean;
  passed_rules: string[];
  warnings: string[];
  platform_constraints: Record<string, any>;
}

export interface GenerationResponse {
  id: string;
  product_name: string;
  product_description: string;
  platform: PlatformType;
  tone: ToneType;
  audience: string;
  objective: string;
  content_type: ContentType;
  prompt_parameters: Record<string, any>;
  compiled_prompt: string;
  generated_content: string;
  hook?: string | null;
  cta?: string | null;
  hashtags: string[];
  image_prompt?: string | null;
  formatted_content: FormattedContent;
  platform_validation: PlatformValidationResult;
  is_saved: boolean;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  product_name: string;
  product_description: string;
  platform: PlatformType;
  tone: ToneType;
  audience: string;
  objective: string;
  content_type: ContentType;
  generated_content: string;
  hook?: string | null;
  cta?: string | null;
  hashtags?: string[];
  image_prompt?: string | null;
  prompt_parameters: Record<string, any>;
  is_saved: boolean;
  created_at: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  platform: PlatformType;
  tone: ToneType;
  audience: AudienceType;
  objective: ObjectiveType;
  product_name_placeholder: string;
  product_description_placeholder: string;
  additional_instructions: string;
}

export interface HealthStatus {
  status: string;
  project_name: string;
  tagline: string;
  version: string;
  openai_model: string;
  ai_configured: boolean;
}

export type PipelineStage = 'idle' | 'brief' | 'prompt_compiling' | 'ai_generating' | 'validating' | 'ready';
