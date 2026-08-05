export type InquiryStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Closed';

export interface StudentInquiry {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface InquirySubmitPayload {
  name: string;
  email: string;
  category: string;
  message: string;
}

export interface InquiryCounts {
  Pending: number;
  'In Progress': number;
  Resolved: number;
  Closed: number;
  total: number;
}

export interface InquiryListResponse {
  success: boolean;
  inquiries: StudentInquiry[];
  counts: InquiryCounts;
}

export interface InquirySubmitResponse {
  success: boolean;
  reference_id: string;
}
