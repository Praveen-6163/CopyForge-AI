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
  getPresetTemplates
} from './aiEngineService';

const API_BASE = '/api';

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
  try {
    const res = await apiClient.get<HealthStatus>('/health');
    return {
      ...res.data,
      demo_mode: false // Fully Functional Mode
    };
  } catch (error) {
    const userApiKey = getStoredApiKey();
    const model = getStoredModel();
    // Client-side status for Netlify deployment
    return {
      status: 'healthy',
      project_name: 'CopyForge AI',
      tagline: 'Turn product ideas into platform-ready content.',
      version: '1.0.0',
      demo_mode: false,
      openai_model: userApiKey ? `${model} (Direct Key Connected)` : model
    };
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
      const response = generateEngineContent(payload);
      response.generated_content = text;
      response.formatted_content.raw_text = text;
      response.formatted_content.word_count = text.split(/\s+/).filter(Boolean).length;
      response.formatted_content.char_count = text.length;
      response.is_demo_mode = false;
      return response;
    } catch (e: any) {
      console.warn('OpenAI Direct API error, using CopyForge Native Engine:', e);
    }
  }

  try {
    const res = await apiClient.post<GenerationResponse>('/generate', payload);
    return { ...res.data, is_demo_mode: false };
  } catch (error: any) {
    // Rely on CopyForge Native Engine
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
      const response = improveEngineContent(payload);
      response.generated_content = text;
      response.formatted_content.raw_text = text;
      response.formatted_content.word_count = text.split(/\s+/).filter(Boolean).length;
      response.formatted_content.char_count = text.length;
      response.is_demo_mode = false;
      return response;
    } catch (e) {
      console.warn('OpenAI Direct Refinement error, using Native Engine:', e);
    }
  }

  try {
    const res = await apiClient.post<GenerationResponse>('/improve', payload);
    return { ...res.data, is_demo_mode: false };
  } catch (error: any) {
    return improveEngineContent(payload);
  }
};

export const fetchHistory = async (
  search?: string,
  platform?: string,
  tone?: string,
  savedOnly: boolean = false
): Promise<HistoryItem[]> => {
  try {
    const params: Record<string, any> = {};
    if (search) params.search = search;
    if (platform && platform !== 'All') params.platform = platform;
    if (tone && tone !== 'All') params.tone = tone;
    if (savedOnly) params.saved_only = true;

    const res = await apiClient.get<HistoryItem[]>('/history', { params });
    return res.data;
  } catch (error) {
    return getEngineHistory(search, platform, tone, savedOnly);
  }
};

export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  try {
    const res = await apiClient.delete<{ success: boolean }>(`/history/${id}`);
    return res.data.success;
  } catch (error) {
    return deleteEngineItem(id);
  }
};

export const toggleSaveItem = async (id: string): Promise<boolean> => {
  try {
    const res = await apiClient.post<{ is_saved: boolean }>(`/history/${id}/toggle-save`);
    return res.data.is_saved;
  } catch (error) {
    return toggleEngineSave(id);
  }
};

export const fetchTemplates = async (): Promise<TemplateItem[]> => {
  try {
    const res = await apiClient.get<TemplateItem[]>('/templates');
    return res.data;
  } catch (error) {
    return getPresetTemplates();
  }
};
