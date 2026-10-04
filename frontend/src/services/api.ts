import axios from 'axios';
import {
  GenerateRequest,
  GenerationResponse,
  HealthStatus,
  HistoryItem,
  ImproveRequest,
  TemplateItem,
} from '../types/generation';
import { getLinkedInSession } from './linkedinOAuth';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const defaultApiBase = import.meta.env.DEV
  ? ''
  : 'https://copyforge-ai-backend.onrender.com';
const backendOrigin = configuredApiBase || defaultApiBase;
const API_BASE = backendOrigin
  ? (backendOrigin.endsWith('/api') ? backendOrigin : `${backendOrigin}/api`)
  : '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // send session cookie on every request
  timeout: 120000,
});

apiClient.interceptors.request.use((request) => {
  const sessionId = getLinkedInSession();
  if (sessionId) request.headers.set('Authorization', `Bearer ${sessionId}`);
  return request;
});

export const fetchHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get<HealthStatus>('/health');
  if (!response.data || typeof response.data.status !== 'string') {
    throw new Error('The backend returned an invalid health response.');
  }
  return response.data;
};

export const generateCopy = async (
  payload: GenerateRequest,
): Promise<GenerationResponse> => {
  const response = await apiClient.post<GenerationResponse>('/generate', payload);
  if (!response.data || typeof response.data.generated_content !== 'string') {
    throw new Error('The backend returned an invalid generation response.');
  }
  return response.data;
};

export const improveCopy = async (
  payload: ImproveRequest,
): Promise<GenerationResponse> => {
  const response = await apiClient.post<GenerationResponse>('/improve', payload);
  if (!response.data || typeof response.data.generated_content !== 'string') {
    throw new Error('The backend returned an invalid refinement response.');
  }
  return response.data;
};

export const fetchHistory = async (
  search?: string,
  platform?: string,
  tone?: string,
  savedOnly = false,
): Promise<HistoryItem[]> => {
  const response = await apiClient.get<HistoryItem[]>('/history', {
    params: {
      ...(search ? { search } : {}),
      ...(platform && platform !== 'All' ? { platform } : {}),
      ...(tone && tone !== 'All' ? { tone } : {}),
      ...(savedOnly ? { saved_only: true } : {}),
    },
  });
  if (!Array.isArray(response.data)) {
    throw new Error('The backend returned invalid history data.');
  }
  return response.data;
};

export const deleteHistoryItem = async (id: string): Promise<boolean> => {
  const response = await apiClient.delete<{ success: boolean }>(`/history/${id}`);
  if (typeof response.data?.success !== 'boolean') {
    throw new Error('The backend returned an invalid delete response.');
  }
  return response.data.success;
};

export const toggleSaveItem = async (id: string): Promise<boolean> => {
  const response = await apiClient.post<{ is_saved: boolean }>(
    `/history/${id}/toggle-save`,
  );
  if (typeof response.data?.is_saved !== 'boolean') {
    throw new Error('The backend returned an invalid bookmark response.');
  }
  return response.data.is_saved;
};

export const fetchTemplates = async (): Promise<TemplateItem[]> => {
  const response = await apiClient.get<TemplateItem[]>('/templates');
  if (!Array.isArray(response.data)) {
    throw new Error('The backend returned invalid template data.');
  }
  return response.data;
};
