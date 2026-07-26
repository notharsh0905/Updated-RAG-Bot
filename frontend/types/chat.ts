export interface DocumentSource {
  source: string;
  doc_type: string;
  content_snippet: string;
  relevance_score?: number;
  page?: number;
  chunk_id?: string;
}

export interface SuggestionObject {
  short_label: string;
  full_question: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: DocumentSource[] | null;
  suggestions?: (string | SuggestionObject)[] | null;
  timestamp: string;
  isStreaming?: boolean;
  isError?: boolean;
  rawQuestion?: string;
}

export interface FeedbackPayload {
  session_id: string;
  question: string;
  answer: string;
  rating: number;
  comments?: string;
}

export interface AnalyticsSummary {
  total_queries: number;
  avg_response_time_sec: number;
  cache_hits: number;
  satisfaction_pct: number;
  thumbs_up: number;
  thumbs_down: number;
}

export interface SystemHealth {
  status: string;
  ollama: {
    connected: boolean;
    models?: string[];
  };
  dataset: {
    exists: boolean;
  };
  vector_db: {
    collection: string;
    document_count: number;
  };
}
