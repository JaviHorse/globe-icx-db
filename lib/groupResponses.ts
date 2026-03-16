export type ResponseRow = {
  id: string;
  group: string;
  question: string;
  answer: string;
  employeeId: string;
  timestamp: string;
  extraFields: Record<string, string>;
};

export type GroupedResponse = {
  question: string;
  rows: ResponseRow[];
};

export type ApiResponse = {
  success: boolean;
  totalResponses?: number;
  groups?: string[];
  groupedResponses?: Record<string, GroupedResponse>;
  updatedAt?: string;
  error?: string;
};