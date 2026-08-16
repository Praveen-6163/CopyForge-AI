import axios from 'axios';
import {
  GenerateRequest, ImproveRequest, GenerationResponse,
  HistoryItem, TemplateItem, HealthStatus
} from '../types/generation';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = async (): Promise<HealthStatus> => {
  const res = await apiClient.get<HealthStatus>('/health');
  return res.data;
};

export const generateCopy = async (payload: GenerateRequest): Promise<GenerationResponse> => {
  const res = await apiClient.post<GenerationResponse>('/generate', payload);
  return res.data;
};

export const improveCopy = async (payload: ImproveRequest): Promise<GenerationResponse> => {
  const res = await apiClient.post<GenerationResponse>('/improve', payload);
  return res.data;
};

export const fetchHistory = async (
  search?: string,
  platform?: string,
  tone?: string,
  savedOnly: boolean = false
): Promise<HistoryItem[]> => {
  const params: Record<string, any> = {};
  if (search) params.search = search;
  if (platform && platform !== 'All') params.platform = platform;
  if (tone && tone !== 'All') params.tone = tone;
  if (savedOnly) params.saved_only = true;

  const res = await apiClient.get<HistoryItem[]>('/history', { params });
  return res.data;
};

export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  const res = await apiClient.delete<{ success: boolean }>(`/history/${id}`);
  return res.data.success;
};

export const toggleSaveItem = async (id: string): Promise<boolean> => {
  const res = await apiClient.post<{ is_saved: boolean }>(`/history/${id}/toggle-save`);
  return res.data.is_saved;
};

export const fetchTemplates = async (): Promise<TemplateItem[]> => {
  const res = await apiClient.get<TemplateItem[]>('/templates');
  return res.data;
};
