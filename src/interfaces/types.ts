export interface Task {
  id: string
  title: string
  description: string
  status: "TODO" | "IN_PROGRESS" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  fullname: string
}

// DTO for creating/updating a task
export interface CreateTaskDTO {
	title: string;
	description: string;
	status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
	priority: "LOW" | "MEDIUM" | "HIGH";
	dueDate: string; // ISO string
}

// Pagination and filter params
export interface GetTasksParams {
	page?: number;
	size?: number;
	sortBy?: string;
	sortDir?: "ASC" | "DESC";
	status?: "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
	priority?: "ALL" | "LOW" | "MEDIUM" | "HIGH";
	fromDateTime?: string; // ISO string
	toDateTime?: string;   // ISO string
}

// Paged response type
export interface PagedDataDTO<T> {
	content: T[];
	currentPage: number;
	first: boolean;
	last: boolean;
	pageSize: number;
	totalElements: number;
	totalPages: number;
}


export interface SuggestionResponse {
  schedule: {
	taskId: number;
	title: string;
	suggestedStart: string;
	durationMinutes: number;
	summary: string;
  }[];
}