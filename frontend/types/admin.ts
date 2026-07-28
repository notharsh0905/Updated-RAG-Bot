import { DocumentSource } from './chat';

export type ReviewPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type RootCauseCategory =
  | 'Missing Document'
  | 'Outdated Information'
  | 'Incorrect Retrieval'
  | 'Prompt Issue'
  | 'Hallucination'
  | 'Metadata Error'
  | 'Duplicate Chunk'
  | 'Unknown';

export type ReviewerTeam =
  | 'Unassigned'
  | 'Admission Cell'
  | 'IT Cell'
  | 'Knowledge Base Team'
  | 'Registrar Office';

export type WorkflowStatus =
  | 'New'
  | 'Assigned'
  | 'Investigating'
  | 'Waiting for KB Update'
  | 'Resolved'
  | 'Closed';

export interface AIRecommendation {
  possibleCause: string;
  recommendedAction: string;
  potentialMissingDoc?: string;
  suggestedKBUpdate?: string;
}

export interface KBImprovementTask {
  id: string;
  reviewId: string;
  question: string;
  problemSummary: string;
  suggestedFix: string;
  requiredDocument: string;
  assignedTeam: ReviewerTeam;
  priority: ReviewPriority;
  status: 'Open' | 'In Progress' | 'Completed';
  dueDate?: string;
  createdAt: string;
}

export interface NegativeFeedbackItem {
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  sources?: DocumentSource[];
  timestamp: string;
  rating: number; // -1 for negative
  reason: string; // User feedback comment or short reason
  comments?: string;
  status: WorkflowStatus;
  priority: ReviewPriority;
  rootCause: RootCauseCategory;
  assignedReviewer: ReviewerTeam;
  adminNotes?: string;
  aiRecommendation?: AIRecommendation;
  updatedAt?: string;
  historyTimeline?: Array<{
    timestamp: string;
    action: string;
    actor: string;
  }>;
}

export interface QualityCenterAnalytics {
  totalConversations: number;
  totalFeedback: number;
  negativeFeedback: number;
  openReviews: number;
  resolvedReviews: number;
  avgResolutionTime: string;
  aiQualityScore: number; // e.g. 96.4
  trendIndicators: {
    conversationsTrend: string;
    feedbackTrend: string;
    negativeTrend: string;
    scoreTrend: string;
  };
  failureCategories: Array<{ category: RootCauseCategory; count: number }>;
  topFailedTopics: Array<{ topic: string; count: number }>;
  mostRetrievedDocs: Array<{ docName: string; count: number }>;
  feedbackTrendSeries: Array<{ date: string; count: number }>;
  kbTasksProgress: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
  };
}

export interface FeedbackFilter {
  searchQuery: string;
  status: WorkflowStatus | 'All' | 'OpenOnly';
  reviewer: ReviewerTeam | 'All';
  rootCause: RootCauseCategory | 'All';
  priority: ReviewPriority | 'All';
  sortBy: 'newest' | 'oldest' | 'priority' | 'status';
}
