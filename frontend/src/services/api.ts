import axios from 'axios';
import {
  GenerateRequest, ImproveRequest, GenerationResponse,
  HistoryItem, TemplateItem, HealthStatus
} from '../types/generation';
import {
  generateEngineContent,
  improveEngineContent,
  getEngineHistory,
  toggleEngineSave,
  deleteEngineItem,
  getPresetTemplates,
  saveEngineGenerationToHistory
} from './aiEngineService';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const API_BASE = configuredApiBase
  ? (configuredApiBase.endsWith('/api') ? configuredApiBase : `${configuredApiBase}/api`)
  : '/api';
const USE_BACKEND_API = import.meta.env.DEV || Boolean(configuredApiBase);

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getStoredApiKey = (): string => {
  return localStorage.getItem('copyforge_openai_api_key') || '';
};

export const getStoredModel = (): string => {
  return localStorage.getItem('copyforge_openai_model') || 'gpt-4o-mini';
};

export const fetchHealth = async (): Promise<HealthStatus> => {
  const apiKeyConfigured = getStoredApiKey().startsWith('sk-');
  const localHealth: HealthStatus = {
    status: 'healthy',
    project_name: 'CopyForge AI',
    tagline: 'Turn product ideas into platform-ready content.',
    version: '1.0.0',
    demo_mode: !apiKeyConfigured,
    openai_model: apiKeyConfigured ? `${getStoredModel()} (browser key saved)` : 'CopyForge Local Demo Engine',
    engine_mode: apiKeyConfigured ? 'openai_direct' : 'local_demo'
  };

  if (!USE_BACKEND_API) return localHealth;

  try {
    const res = await apiClient.get<HealthStatus>('/health');
    if (!res.data || typeof res.data.status !== 'string') {
      throw new Error('The backend returned an invalid health response.');
    }
    return {
      ...res.data,
      engine_mode: res.data.demo_mode ? 'backend_demo' : 'backend'
    };
  } catch (error) {
    console.warn('Backend health check failed; using the local demo engine.', error);
    return localHealth;
  }
};

export const generateCopy = async (payload: GenerateRequest): Promise<GenerationResponse> => {
  const userApiKey = getStoredApiKey();
  const userModel = getStoredModel();

  // If user provided a direct OpenAI key in Settings, call OpenAI API directly from client
  if (userApiKey && userApiKey.startsWith('sk-')) {
    try {
      const systemPrompt = `You are CopyForge AI, an elite copywriting AI assistant. Craft high-converting copy for ${payload.platform}.
Tone Directive: ${payload.tone}
Target Audience: ${payload.audience}
Objective: ${payload.objective}`;

      const userPrompt = `Product Name: ${payload.product_name}
Description: ${payload.product_description}
${payload.additional_instructions ? `Additional Instructions: ${payload.additional_instructions}` : ''}`;

      const openAiRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: userModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: payload.parameters.temperature,
          top_p: payload.parameters.top_p,
          max_tokens: payload.parameters.max_tokens
        },
        {
          headers: {
            'Authorization': `Bearer ${userApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = openAiRes.data.choices[0]?.message?.content || '';
      const response = generateEngineContent(payload, false);
      response.generated_content = text;
      response.formatted_content.raw_text = text;
      response.formatted_content.word_count = text.split(/\s+/).filter(Boolean).length;
      response.formatted_content.char_count = text.length;
      response.is_demo_mode = false;
      saveEngineGenerationToHistory(response);
      return response;
    } catch (e: any) {
      console.warn('OpenAI Direct API error, using CopyForge Native Engine:', e);
    }
  }

  if (!USE_BACKEND_API) return generateEngineContent(payload);

  try {
    const res = await apiClient.post<GenerationResponse>('/generate', payload);
    if (!res.data || typeof res.data.generated_content !== 'string') {
      throw new Error('The backend returned an invalid generation response.');
    }
    return res.data;
  } catch (error: any) {
    console.warn('Backend generation failed; using the local demo engine.', error);
    return generateEngineContent(payload);
  }
};

export const improveCopy = async (payload: ImproveRequest): Promise<GenerationResponse> => {
  const userApiKey = getStoredApiKey();
  const userModel = getStoredModel();

  if (userApiKey && userApiKey.startsWith('sk-')) {
    try {
      const openAiRes = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: userModel,
          messages: [
            { role: 'system', content: `You are CopyForge AI. Refine the provided copy according to action: ${payload.action}` },
            { role: 'user', content: `Original Copy:\n${payload.current_content}` }
          ],
          temperature: payload.parameters.temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${userApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = openAiRes.data.choices[0]?.message?.content || '';
      const response = improveEngineContent(payload, false);
      response.generated_content = text;
      response.formatted_content.raw_text = text;
      response.formatted_content.word_count = text.split(/\s+/).filter(Boolean).length;
      response.formatted_content.char_count = text.length;
      response.is_demo_mode = false;
      saveEngineGenerationToHistory(response);
      return response;
    } catch (e) {
      console.warn('OpenAI Direct Refinement error, using Native Engine:', e);
    }
  }

  if (!USE_BACKEND_API) return improveEngineContent(payload);

  try {
    const res = await apiClient.post<GenerationResponse>('/improve', payload);
    if (!res.data || typeof res.data.generated_content !== 'string') {
      throw new Error('The backend returned an invalid refinement response.');
    }
    return res.data;
  } catch (error: any) {
    console.warn('Backend refinement failed; using the local demo engine.', error);
    return improveEngineContent(payload);
  }
};

export const fetchHistory = async (
  search?: string,
  platform?: string,
  tone?: string,
  savedOnly: boolean = false
): Promise<HistoryItem[]> => {
  if (!USE_BACKEND_API) return getEngineHistory(search, platform, tone, savedOnly);

  try {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (platform && platform !== 'All') params.platform = platform;
    if (tone && tone !== 'All') params.tone = tone;
    if (savedOnly) params.saved_only = true;

    const res = await apiClient.get<HistoryItem[]>('/history', { params });
    if (!Array.isArray(res.data)) throw new Error('The backend returned invalid history data.');
    return res.data;
  } catch (error) {
    console.warn('Backend history is unavailable; using local history.', error);
    return getEngineHistory(search, platform, tone, savedOnly);
  }
};

export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  if (!USE_BACKEND_API) return deleteEngineItem(id);

  try {
    const res = await apiClient.delete<{ success: boolean }>(`/history/${id}`);
    if (typeof res.data?.success !== 'boolean') throw new Error('The backend returned an invalid delete response.');
    return res.data.success;
  } catch (error) {
    console.warn('Backend history delete failed; deleting from local history.', error);
    return deleteEngineItem(id);
  }
};

export const toggleSaveItem = async (id: string): Promise<boolean> => {
  if (!USE_BACKEND_API) return toggleEngineSave(id);

  try {
    const res = await apiClient.post<{ is_saved: boolean }>(`/history/${id}/toggle-save`);
    if (typeof res.data?.is_saved !== 'boolean') throw new Error('The backend returned an invalid bookmark response.');
    return res.data.is_saved;
  } catch (error) {
    console.warn('Backend bookmark update failed; using local history.', error);
    return toggleEngineSave(id);
  }
};

export const fetchTemplates = async (): Promise<TemplateItem[]> => {
  if (!USE_BACKEND_API) return getPresetTemplates();

  try {
    const res = await apiClient.get<TemplateItem[]>('/templates');
    if (!Array.isArray(res.data)) throw new Error('The backend returned invalid template data.');
    return res.data;
  } catch (error) {
    console.warn('Backend templates are unavailable; using built-in templates.', error);
    return getPresetTemplates();
  }
};
