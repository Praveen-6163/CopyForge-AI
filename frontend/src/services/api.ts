import axios from 'axios';
import {
  GenerateRequest, ImproveRequest, GenerationResponse,
  HistoryItem, TemplateItem, HealthStatus
} from '../types/generation';
import {
  generateDemoContentFallback,
  improveDemoContentFallback,
  getDemoHistoryFallback,
  toggleDemoSaveFallback,
  deleteDemoItemFallback,
  getPresetTemplatesFallback
} from './demoFallback';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchHealth = async (): Promise<HealthStatus> => {
  try {
    const res = await apiClient.get<HealthStatus>('/health');
    return res.data;
  } catch (error) {
    // Client-side fallback for Netlify static host
    return {
      status: 'healthy',
      project_name: 'CopyForge AI',
      tagline: 'Turn product ideas into platform-ready content.',
      version: '1.0.0',
      demo_mode: true,
      openai_model: 'gpt-4o-mini'
    };
  }
};

export const generateCopy = async (payload: GenerateRequest): Promise<GenerationResponse> => {
  try {
    const res = await apiClient.post<GenerationResponse>('/generate', payload);
    return res.data;
  } catch (error: any) {
    // If backend returns 404 or network error on Netlify static host, fall back to client demo engine
    if (error.response?.status === 404 || !error.response || error.code === 'ERR_NETWORK') {
      console.warn('Backend API unavailable. Utilizing client-side Demo Engine.');
      return generateDemoContentFallback(payload);
    }
    throw error;
  }
};

export const improveCopy = async (payload: ImproveRequest): Promise<GenerationResponse> => {
  try {
    const res = await apiClient.post<GenerationResponse>('/improve', payload);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404 || !error.response || error.code === 'ERR_NETWORK') {
      return improveDemoContentFallback(payload);
    }
    throw error;
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
    return getDemoHistoryFallback(search, platform, tone, savedOnly);
  }
};

export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  try {
    const res = await apiClient.delete<{ success: boolean }>(`/history/${id}`);
    return res.data.success;
  } catch (error) {
    return deleteDemoItemFallback(id);
  }
};

export const toggleSaveItem = async (id: string): Promise<boolean> => {
  try {
    const res = await apiClient.post<{ is_saved: boolean }>(`/history/${id}/toggle-save`);
    return res.data.is_saved;
  } catch (error) {
    return toggleDemoSaveFallback(id);
  }
};

export const fetchTemplates = async (): Promise<TemplateItem[]> => {
  try {
    const res = await apiClient.get<TemplateItem[]>('/templates');
    return res.data;
  } catch (error) {
    return getPresetTemplatesFallback();
  }
};
