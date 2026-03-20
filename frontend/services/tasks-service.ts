import apiClient from "./api-client";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  PaginatedResponse,
  TaskStats,
  ApiResponse,
} from "@task-manager/types";

export const tasksService = {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(
      `/tasks?${params.toString()}`,
    );
    return response.data.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async createTask(data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>("/tasks", data);
    return response.data.data;
  },

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${id}`,
      data,
    );
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async toggleComplete(id: string): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/tasks/${id}/complete`,
    );
    return response.data.data;
  },

  async getStats(): Promise<TaskStats> {
    const response =
      await apiClient.get<ApiResponse<TaskStats>>("/tasks/stats");
    return response.data.data;
  },
};
