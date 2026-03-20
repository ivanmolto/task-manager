import { PaginatedResponse } from "./common";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string | Date;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export type TaskStatus = "all" | "completed" | "pending";
export type SortBy = "createdAt" | "updatedAt" | "completed";
export type SortOrder = "asc" | "desc";

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export type PaginatedTasks = PaginatedResponse<Task>;
