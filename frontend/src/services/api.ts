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

export interface ParsedApiError {
  message: string;
  isAuth: boolean;
  requestId?: string;
  errorType?: string;
}

export const parseApiError = (error: any): ParsedApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    const detailObj = typeof data?.detail === 'object' ? data.detail : null;
    const detailMsg = typeof data?.detail === 'string' ? data.detail : detailObj?.message;
    const requestId = detailObj?.request_id || data?.request_id;
    const errorType = detailObj?.error || data?.error_type;

    if (status === 401) {
      return {
        message: detailMsg || 'LinkedIn connection expired. Reconnect LinkedIn to continue generating.',
        isAuth: true,
        requestId,
        errorType: 'UNAUTHORIZED',
      };
    }

    if (
      status === 503 ||
      status === 504 ||
      errorType === 'gemini_unavailable' ||
      errorType === 'MODEL_ACCESS' ||
      errorType === 'MODEL_FALLBACK_EXHAUSTED'
    ) {
      return {
        message: detailMsg || 'Gemini is temporarily unavailable. Please try again in a few seconds.',
        isAuth: false,
        requestId,
        errorType: 'AI_UNAVAILABLE',
      };
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: 'The AI request took too long. Please try again.',
        isAuth: false,
        requestId,
        errorType: 'TIMEOUT',
      };
    }

    if (!error.response || error.code === 'ERR_NETWORK') {
      return {
        message: 'Backend is waking up or temporarily unavailable. Please try again in a few seconds.',
        isAuth: false,
        requestId,
        errorType: 'NETWORK_ERROR',
      };
    }

    if (detailMsg) {
      return {
        message: detailMsg,
        isAuth: false,
        requestId,
        errorType: errorType || 'SERVER_ERROR',
      };
    }
  }

  return {
    message:
      error?.message ||
      'Unable to connect to the CopyForge backend. Please contact the administrator.',
    isAuth: false,
  };
};

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
