import axios from 'axios';
import { AnalyticsSummary, FeedbackPayload, SystemHealth } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface QueryApiResponse {
  session_id: string;
  question: string;
  answer: string;
  context?: string;
  sources?: Array<{
    source: string;
    doc_type: string;
    content_snippet: string;
  }>;
  response_time_sec?: number;
}

export const apiService = {
  // Query RAG Backend (POST /query)
  sendQuery: async (
    question: string,
    sessionId: string,
    k: number = 5,
    strict: boolean = true
  ): Promise<QueryApiResponse> => {
    const response = await apiClient.post<QueryApiResponse>('/query', {
      question,
      session_id: sessionId,
      k,
      strict,
      use_hybrid: true,
    });
    return response.data;
  },

  // Submit Feedback (POST /feedback)
  sendFeedback: async (payload: FeedbackPayload): Promise<void> => {
    await apiClient.post('/feedback', payload);
  },

  // Health Check (GET /health)
  getHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get<SystemHealth>('/health');
    return response.data;
  },

  // Admin Analytics (GET /admin/analytics)
  getAdminAnalytics: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get<AnalyticsSummary>('/admin/analytics');
    return response.data;
  },

  // Trigger Rebuild (POST /rebuild)
  triggerRebuild: async (): Promise<{ status: string; message: string; document_count: number }> => {
    const response = await apiClient.post('/rebuild');
    return response.data;
  },
};
