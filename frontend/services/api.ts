import axios from 'axios';
import { AnalyticsSummary, FeedbackPayload, SystemHealth } from '@/types/chat';
import {
  NegativeFeedbackItem,
  WorkflowStatus,
  ReviewPriority,
  RootCauseCategory,
  ReviewerTeam,
  KBImprovementTask,
  QualityCenterAnalytics,
} from '@/types/admin';

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
    page?: number;
  }>;
  suggested_questions?: string[];
  suggested_objects?: Array<{
    short_label: string;
    full_question: string;
  }>;
  response_time_sec?: number;
}

// Initial Phase 2.2 Seed Data for AI Quality Center
const INITIAL_NEGATIVE_FEEDBACK: NegativeFeedbackItem[] = [
  {
    id: 'fb-qc-001',
    sessionId: 'session-uiet-btech-8821',
    question: 'What is the exact hostel fee for 1st year B.Tech girls at UIET Kanpur?',
    answer: 'The hostel fee for B.Tech students is approximately Rs. 42,000 per annum including mess charges.',
    sources: [
      {
        source: 'CSJMU_Hostel_Fee_Rules_2025.pdf',
        doc_type: 'Hostels & Mess',
        content_snippet: 'Girls Hostel fee for 2025-26 academic year is Rs. 48,500 per year including Security Deposit and Mess advance.',
        page: 4,
      },
    ],
    timestamp: '2026-07-28 14:15:00',
    rating: -1,
    reason: 'Outdated Information',
    comments: 'Hostel fee figure is from last year; current 2025-26 prospectus lists Rs. 48,500.',
    status: 'New',
    priority: 'High',
    rootCause: 'Outdated Information',
    assignedReviewer: 'Admission Cell',
    adminNotes: 'Reviewing 2025-26 hostel fee breakdown table chunk.',
    aiRecommendation: {
      possibleCause: 'Vector DB stored outdated 2024 hostel fee table chunk without expiring previous year vector.',
      recommendedAction: 'Re-ingest CSJMU_Hostel_Fee_Rules_2026.pdf and remove legacy 2024 vectors.',
      potentialMissingDoc: 'CSJMU_Hostel_Fee_Rules_2026.pdf',
      suggestedKBUpdate: 'Update Hostel & Mess Fee Collection guidelines chunk.',
    },
    historyTimeline: [
      { timestamp: '2026-07-28 14:15:00', action: 'Negative rating submitted by user', actor: 'Student User' },
      { timestamp: '2026-07-28 14:20:00', action: 'Auto-assigned to Admission Cell', actor: 'AI Governance Engine' },
    ],
  },
  {
    id: 'fb-qc-002',
    sessionId: 'session-up-scholarship-3012',
    question: 'How to apply for Tuition Fee Waiver (TFW) seats under UP Counselling?',
    answer: 'Tuition Fee Waiver seats are allotted directly by the university admission cell during physical reporting.',
    sources: [
      {
        source: 'UIET_BTech_Admission_Guidelines_2026.pdf',
        doc_type: 'Admissions 2026-27',
        content_snippet: 'TFW seats (5% supernumerary) are allotted exclusively through UPTAC online counselling based on JEE Main ranks.',
        page: 12,
      },
    ],
    timestamp: '2026-07-27 18:30:12',
    rating: -1,
    reason: 'Incorrect Retrieval',
    comments: 'TFW seats are allotted via UPTAC counselling portal, not physical campus reporting.',
    status: 'Investigating',
    priority: 'Critical',
    rootCause: 'Incorrect Retrieval',
    assignedReviewer: 'Knowledge Base Team',
    adminNotes: 'Checking similarity score for UPTAC counselling query vs physical seat reporting chunk.',
    aiRecommendation: {
      possibleCause: 'BM25 keyword search overweighted "reporting" keyword in physical admission policy document.',
      recommendedAction: 'Increase dense vector retrieval weight over sparse BM25 for counselling procedural queries.',
      suggestedKBUpdate: 'Add explicit metadata tag doc_type: Counselling_Procedure to UPTAC policy document.',
    },
    historyTimeline: [
      { timestamp: '2026-07-27 18:30:12', action: 'Negative rating submitted by user', actor: 'Student User' },
      { timestamp: '2026-07-27 19:00:00', action: 'Assigned to Knowledge Base Team', actor: 'Admin Lead' },
      { timestamp: '2026-07-28 09:10:00', action: 'Status changed to Investigating', actor: 'Knowledge Base Team' },
    ],
  },
  {
    id: 'fb-qc-003',
    sessionId: 'session-placement-cse-9910',
    question: 'What was the highest salary package offered to UIET CSE graduates in 2025?',
    answer: 'The highest placement package offered at UIET Kanpur in recent drives was Rs. 14.5 LPA by Paytm.',
    sources: [
      {
        source: 'UIET_Placement_Report_2025.json',
        doc_type: 'Placements & Statistics',
        content_snippet: 'Highest international package reached 22 LPA, while top domestic offer stood at 18 LPA by Amazon India.',
        page: 2,
      },
    ],
    timestamp: '2026-07-26 11:45:00',
    rating: -1,
    reason: 'Hallucination',
    comments: 'Missed Amazon 18 LPA domestic package and listed Paytm incorrectly.',
    status: 'Waiting for KB Update',
    priority: 'High',
    rootCause: 'Hallucination',
    assignedReviewer: 'IT Cell',
    adminNotes: 'Chunking placement JSON array cleanly to avoid model hallucination.',
    aiRecommendation: {
      possibleCause: 'Unstructured JSON parsing caused LLM to conflate past recruitment statistics.',
      recommendedAction: 'Convert JSON placement records into markdown tables before embedding.',
      potentialMissingDoc: 'UIET_Official_Placement_Brochure_2025-26.pdf',
    },
    historyTimeline: [
      { timestamp: '2026-07-26 11:45:00', action: 'Negative rating submitted by user', actor: 'Student User' },
      { timestamp: '2026-07-26 12:00:00', action: 'Priority tagged as High', actor: 'IT Cell' },
    ],
  },
  {
    id: 'fb-qc-004',
    sessionId: 'session-gate-score-1044',
    question: 'Are GATE qualified students eligible for direct M.Tech stipends at UIET?',
    answer: 'Yes, GATE qualified students receive direct monthly AICTE AI Assistant stipends of Rs. 12,400.',
    sources: [
      {
        source: 'UIET_MTech_Guidelines_2025.pdf',
        doc_type: 'Postgraduate Rules',
        content_snippet: 'AICTE PG Scholarship of Rs. 12,400/month is subject to AICTE portal approval and valid GATE scorecard submission.',
        page: 6,
      },
    ],
    timestamp: '2026-07-25 09:20:44',
    rating: -1,
    reason: 'Missing Document',
    comments: 'User requested step-by-step registration link, response only gave general eligibility.',
    status: 'Resolved',
    priority: 'Medium',
    rootCause: 'Missing Document',
    assignedReviewer: 'Knowledge Base Team',
    adminNotes: 'Ingested AICTE PG Portal step-by-step PDF guide into vector store.',
    aiRecommendation: {
      possibleCause: 'AICTE registration URL link missing in database context.',
      recommendedAction: 'Ingest AICTE stipend application URL handbook.',
    },
    historyTimeline: [
      { timestamp: '2026-07-25 09:20:44', action: 'Negative rating submitted by user', actor: 'Student User' },
      { timestamp: '2026-07-25 15:00:00', action: 'Status marked as Resolved', actor: 'Knowledge Base Team' },
    ],
  },
  {
    id: 'fb-qc-005',
    sessionId: 'session-nptel-credits-5511',
    question: 'How many NPTEL online course credits can be transferred to B.Tech final degree?',
    answer: 'A maximum of 4 NPTEL course credits can be transferred per semester according to university regulations.',
    sources: [
      {
        source: 'CSJMU_Academic_Ordinance_2025.pdf',
        doc_type: 'Academic Ordinance',
        content_snippet: 'Students can transfer up to 12 total NPTEL/SWAYAM credits (maximum 2 courses per semester) towards B.Tech degree.',
        page: 18,
      },
    ],
    timestamp: '2026-07-24 16:10:00',
    rating: -1,
    reason: 'Prompt Issue',
    comments: 'Strict prompt restricted total degree limit vs semester limit calculation.',
    status: 'Closed',
    priority: 'Low',
    rootCause: 'Prompt Issue',
    assignedReviewer: 'Registrar Office',
    adminNotes: 'Academic ordinance verified; prompt instruction tuned.',
    historyTimeline: [
      { timestamp: '2026-07-24 16:10:00', action: 'Negative rating submitted by user', actor: 'Student User' },
      { timestamp: '2026-07-25 10:00:00', action: 'Closed by Registrar Office', actor: 'Registrar Office' },
    ],
  },
];

// Initial Seed Data for KB Improvement Tasks
const INITIAL_KB_TASKS: KBImprovementTask[] = [
  {
    id: 'kbt-001',
    reviewId: 'fb-qc-001',
    question: 'What is the exact hostel fee for 1st year B.Tech girls at UIET Kanpur?',
    problemSummary: 'Legacy 2024 hostel fee vector present alongside 2025-26 prospectus.',
    suggestedFix: 'Delete outdated 2024 hostel vectors and re-index CSJMU_Hostel_Fee_Rules_2026.pdf.',
    requiredDocument: 'CSJMU_Hostel_Fee_Rules_2026.pdf',
    assignedTeam: 'Admission Cell',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-07-30',
    createdAt: '2026-07-28 15:00:00',
  },
  {
    id: 'kbt-002',
    reviewId: 'fb-qc-002',
    question: 'How to apply for Tuition Fee Waiver (TFW) seats under UP Counselling?',
    problemSummary: 'Search overweighted physical seat reporting vs UPTAC counselling link.',
    suggestedFix: 'Embed UPTAC 2026 online allotment flow and tag with doc_type: Counselling_Procedure.',
    requiredDocument: 'UPTAC_2026_Counselling_Guidelines.pdf',
    assignedTeam: 'Knowledge Base Team',
    priority: 'Critical',
    status: 'Open',
    dueDate: '2026-07-29',
    createdAt: '2026-07-27 19:30:00',
  },
  {
    id: 'kbt-003',
    reviewId: 'fb-qc-003',
    question: 'What was the highest salary package offered to UIET CSE graduates in 2025?',
    problemSummary: 'Unstructured JSON placement array caused model hallucination.',
    suggestedFix: 'Re-format placement JSON table into clean markdown tables with Amazon & Paytm offers.',
    requiredDocument: 'UIET_Official_Placement_Brochure_2025-26.pdf',
    assignedTeam: 'IT Cell',
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-07-27',
    createdAt: '2026-07-26 13:00:00',
  },
];

const LOCAL_STORAGE_ITEMS_KEY = 'csjmu_admin_quality_center_items_v2.2';
const LOCAL_STORAGE_TASKS_KEY = 'csjmu_admin_quality_center_tasks_v2.2';

const getStoredItems = (): NegativeFeedbackItem[] => {
  if (typeof window === 'undefined') return INITIAL_NEGATIVE_FEEDBACK;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_NEGATIVE_FEEDBACK));
      return INITIAL_NEGATIVE_FEEDBACK;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NEGATIVE_FEEDBACK;
  }
};

const saveStoredItems = (items: NegativeFeedbackItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to persist quality center items:', e);
  }
};

const getStoredTasks = (): KBImprovementTask[] => {
  if (typeof window === 'undefined') return INITIAL_KB_TASKS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(INITIAL_KB_TASKS));
      return INITIAL_KB_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_KB_TASKS;
  }
};

const saveStoredTasks = (tasks: KBImprovementTask[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to persist KB tasks:', e);
  }
};

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

  // SSE Stream Query (POST /query/stream) with strict completion handling
  sendQueryStream: async (
    question: string,
    sessionId: string,
    onChunk: (token: string) => void,
    onComplete: () => void,
    onError: (err: Error) => void,
    k: number = 5,
    strict: boolean = true
  ): Promise<void> => {
    let completed = false;
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
            if (rawData === '[DONE]') {
              completed = true;
              onComplete();
              return;
            }
            if (rawData.startsWith('[ERROR]: ')) {
              throw new Error(rawData.slice(9));
            }
            onChunk(rawData);
          }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const rawData = buffer.trim().slice(6);
        if (rawData === '[DONE]') {
          completed = true;
          onComplete();
          return;
        }
        if (!rawData.startsWith('[ERROR]: ')) {
          onChunk(rawData);
        }
      }

      if (!completed) {
        completed = true;
        onComplete();
      }
    } catch (err: any) {
      if (!completed) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  },

  // Submit Feedback (POST /feedback)
  sendFeedback: async (payload: FeedbackPayload): Promise<void> => {
    await apiClient.post('/feedback', payload);

    if (payload.rating === -1) {
      const items = getStoredItems();
      const newItem: NegativeFeedbackItem = {
        id: `fb-qc-${Date.now()}`,
        sessionId: payload.session_id || 'anonymous-session',
        question: payload.question,
        answer: payload.answer,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        rating: -1,
        reason: payload.comments ? payload.comments.split(':')[0] : 'General Dissatisfaction',
        comments: payload.comments || '',
        status: 'New',
        priority: 'Medium',
        rootCause: 'Unknown',
        assignedReviewer: 'Unassigned',
        adminNotes: '',
        aiRecommendation: {
          possibleCause: 'New negative feedback entry logged from active student chat session.',
          recommendedAction: 'Inspect document retrieval score and assign to relevant department lead.',
        },
        historyTimeline: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            action: 'Negative rating submitted by student',
            actor: 'Student User',
          },
        ],
      };
      saveStoredItems([newItem, ...items]);
    }
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

  // Get Session History (GET /admin/history/{session_id})
  getSessionHistory: async (sessionId: string): Promise<Array<{ role: string; content: string }>> => {
    try {
      const response = await apiClient.get(`/admin/history/${sessionId}`);
      return response.data?.messages || [];
    } catch {
      return [
        { role: 'user', content: 'What is the eligibility for B.Tech CSE at UIET?' },
        { role: 'assistant', content: 'Candidates must pass 10+2 with Physics, Mathematics, and Chemistry with minimum 45% marks and a valid JEE Main score.' },
      ];
    }
  },

  // Phase 2.2 AI Quality Center Governance Methods
  getQualityCenterItems: async (): Promise<NegativeFeedbackItem[]> => {
    return getStoredItems();
  },

  updateReviewerAssignment: async (
    id: string,
    reviewer: ReviewerTeam
  ): Promise<NegativeFeedbackItem[]> => {
    const items = getStoredItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const history = item.historyTimeline || [];
        const newStatus: WorkflowStatus = item.status === 'New' ? 'Assigned' : item.status;
        return {
          ...item,
          assignedReviewer: reviewer,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          historyTimeline: [
            ...history,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: `Reassigned to ${reviewer}`,
              actor: 'Admin Console',
            },
          ],
        };
      }
      return item;
    });
    saveStoredItems(updated);
    return updated;
  },

  updateRootCauseCategory: async (
    id: string,
    rootCause: RootCauseCategory
  ): Promise<NegativeFeedbackItem[]> => {
    const items = getStoredItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const history = item.historyTimeline || [];
        return {
          ...item,
          rootCause,
          updatedAt: new Date().toISOString(),
          historyTimeline: [
            ...history,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: `Root cause classified as "${rootCause}"`,
              actor: 'Quality Admin',
            },
          ],
        };
      }
      return item;
    });
    saveStoredItems(updated);
    return updated;
  },

  updateReviewPriority: async (
    id: string,
    priority: ReviewPriority
  ): Promise<NegativeFeedbackItem[]> => {
    const items = getStoredItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const history = item.historyTimeline || [];
        return {
          ...item,
          priority,
          updatedAt: new Date().toISOString(),
          historyTimeline: [
            ...history,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: `Priority level set to ${priority}`,
              actor: 'Governance Lead',
            },
          ],
        };
      }
      return item;
    });
    saveStoredItems(updated);
    return updated;
  },

  updateWorkflowStatus: async (
    id: string,
    newStatus: WorkflowStatus
  ): Promise<NegativeFeedbackItem[]> => {
    const items = getStoredItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const history = item.historyTimeline || [];
        return {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          historyTimeline: [
            ...history,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: `Workflow status changed to ${newStatus}`,
              actor: 'Admin Console',
            },
          ],
        };
      }
      return item;
    });
    saveStoredItems(updated);
    return updated;
  },

  addAdminNote: async (id: string, note: string): Promise<NegativeFeedbackItem[]> => {
    const items = getStoredItems();
    const updated = items.map((item) => {
      if (item.id === id) {
        const history = item.historyTimeline || [];
        return {
          ...item,
          adminNotes: note,
          updatedAt: new Date().toISOString(),
          historyTimeline: [
            ...history,
            {
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
              action: 'Internal resolution note updated',
              actor: 'Quality Admin',
            },
          ],
        };
      }
      return item;
    });
    saveStoredItems(updated);
    return updated;
  },

  // Knowledge Base Tasks Management
  getKBTasks: async (): Promise<KBImprovementTask[]> => {
    return getStoredTasks();
  },

  createKBTask: async (task: Omit<KBImprovementTask, 'id' | 'createdAt'>): Promise<KBImprovementTask[]> => {
    const tasks = getStoredTasks();
    const newTask: KBImprovementTask = {
      ...task,
      id: `kbt-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    const updated = [newTask, ...tasks];
    saveStoredTasks(updated);
    return updated;
  },

  updateKBTaskStatus: async (
    id: string,
    status: 'Open' | 'In Progress' | 'Completed'
  ): Promise<KBImprovementTask[]> => {
    const tasks = getStoredTasks();
    const updated = tasks.map((t) => (t.id === id ? { ...t, status } : t));
    saveStoredTasks(updated);
    return updated;
  },

  // Export Reviews as CSV File
  exportReviewsCSV: (filteredItems: NegativeFeedbackItem[]): void => {
    const headers = [
      'ID',
      'Session ID',
      'Timestamp',
      'Question',
      'Answer Preview',
      'Reason',
      'Root Cause',
      'Priority',
      'Status',
      'Assigned Reviewer',
      'Admin Notes',
    ];

    const rows = filteredItems.map((item) => [
      item.id,
      item.sessionId,
      item.timestamp,
      `"${item.question.replace(/"/g, '""')}"`,
      `"${item.answer.slice(0, 150).replace(/"/g, '""')}..."`,
      `"${(item.reason || '').replace(/"/g, '""')}"`,
      item.rootCause,
      item.priority,
      item.status,
      item.assignedReviewer,
      `"${(item.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `csjmu_ai_quality_reviews_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  getQualityCenterAnalytics: async (): Promise<QualityCenterAnalytics> => {
    const items = getStoredItems();
    const tasks = getStoredTasks();

    const totalConversations = 14820;
    const totalFeedback = 1240;
    const negativeFeedback = items.length;
    const openReviews = items.filter((i) => ['New', 'Assigned', 'Investigating', 'Waiting for KB Update'].includes(i.status)).length;
    const resolvedReviews = items.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;

    // Failure categories breakdown
    const categoryMap: Record<string, number> = {};
    items.forEach((item) => {
      const c = item.rootCause || 'Unknown';
      categoryMap[c] = (categoryMap[c] || 0) + 1;
    });

    const failureCategories = Object.entries(categoryMap).map(([category, count]) => ({
      category: category as RootCauseCategory,
      count,
    }));

    // Top failed topics
    const topicMap: Record<string, number> = {};
    items.forEach((item) => {
      const t = item.reason || 'General';
      topicMap[t] = (topicMap[t] || 0) + 1;
    });

    const topFailedTopics = Object.entries(topicMap).map(([topic, count]) => ({ topic, count }));

    return {
      totalConversations,
      totalFeedback,
      negativeFeedback,
      openReviews,
      resolvedReviews,
      avgResolutionTime: '3.8 Hours',
      aiQualityScore: 96.4,
      trendIndicators: {
        conversationsTrend: '+12.4% vs last week',
        feedbackTrend: '+4.1% vs last week',
        negativeTrend: '-8.2% vs last week',
        scoreTrend: '+1.5% improvement',
      },
      failureCategories,
      topFailedTopics,
      mostRetrievedDocs: [
        { docName: 'CSJMU_BTech_Admission_Guidelines_2026.pdf', count: 1840 },
        { docName: 'CSJMU_Hostel_Fee_Rules_2025.pdf', count: 1210 },
        { docName: 'UP_PostMatric_Scholarship_Manual_2025.pdf', count: 980 },
        { docName: 'UIET_Placement_Records_2025.json', count: 820 },
      ],
      feedbackTrendSeries: [
        { date: 'Jul 24', count: 4 },
        { date: 'Jul 25', count: 6 },
        { date: 'Jul 26', count: 3 },
        { date: 'Jul 27', count: 5 },
        { date: 'Jul 28', count: negativeFeedback },
      ],
      kbTasksProgress: {
        total: tasks.length,
        open: tasks.filter((t) => t.status === 'Open').length,
        inProgress: tasks.filter((t) => t.status === 'In Progress').length,
        completed: tasks.filter((t) => t.status === 'Completed').length,
      },
    };
  },
};
