export interface User {
  id: string;
  email: string;
  businessName: string;
}

export interface Question {
  _id: string;
  text: string;
  type: 'text' | 'radio' | 'checkbox' | 'textarea';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Form {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  publicUrl: string;
  shareLink?: string;
  responseCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface Response {
  _id: string;
  formId: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string | string[];
  }>;
  submittedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Analytics {
  summary: {
    totalResponses: number;
    completionRate: string;
    averageCompletionTime: string;
    lastResponseAt: string | null;
  };
  questionAnalytics: Array<{
    questionId: string;
    questionText: string;
    type: string;
    totalResponses: number;
    responses: any;
  }>;
  trends: {
    daily: Array<{
      date: string;
      responses: number;
    }>;
  };
}