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

  // SSE Stream Query (POST /query/stream)
  sendQueryStream: async (
    question: string,
    sessionId: string,
    onChunk: (token: string) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
    k: number = 5,
    strict: boolean = true
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          session_id: sessionId,
          k,
          strict,
          use_hybrid: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: Stream connection failed`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const rawData = trimmed.slice(6);
            if (rawData.startsWith('[ERROR]: ')) {
              throw new Error(rawData.slice(9));
            }
            onChunk(rawData);
          }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const rawData = buffer.trim().slice(6);
        if (!rawData.startsWith('[ERROR]: ')) {
          onChunk(rawData);
        }
      }

      onComplete();
    } catch (err: any) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
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
