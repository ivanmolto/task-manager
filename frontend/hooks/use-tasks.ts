"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { tasksService, getErrorMessage } from "@/services";
import { useTaskFiltersStore } from "@/stores";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  Task,
  PaginatedTasks,
} from "@task-manager/types";

export function useTasks() {
  const queryClient = useQueryClient();
  const filters = useTaskFiltersStore();

  // Get tasks query
  const tasksQuery = useQuery({
    queryKey: [
      "tasks",
      filters.page,
      filters.limit,
      filters.status,
      filters.search,
      filters.sortBy,
      filters.sortOrder,
    ],
    queryFn: () =>
      tasksService.getTasks({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get stats query
  const statsQuery = useQuery({
    queryKey: ["taskStats"],
    queryFn: tasksService.getStats,
    staleTime: 60 * 1000, // 1 minute
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      notifications.show({
        title: "Task created",
        message: "Your task has been created successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to create task",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      tasksService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      notifications.show({
        title: "Task updated",
        message: "Your task has been updated successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to update task",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
      notifications.show({
        title: "Task deleted",
        message: "Your task has been deleted.",
        color: "blue",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Failed to delete task",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  // Toggle complete mutation with optimistic update
  const toggleCompleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.toggleComplete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData([
        "tasks",
        filters.page,
        filters.limit,
        filters.status,
        filters.search,
        filters.sortBy,
        filters.sortOrder,
      ]);

      // Optimistically update
      queryClient.setQueryData(
        [
          "tasks",
          filters.page,
          filters.limit,
          filters.status,
          filters.search,
          filters.sortBy,
          filters.sortOrder,
        ],
        (old: PaginatedTasks | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((task: Task) =>
              task.id === id
                ? {
                    ...task,
                    completed: !task.completed,
                    completedAt: !task.completed
                      ? new Date().toISOString()
                      : null,
                  }
                : task,
            ),
          };
        },
      );

      return { previousTasks };
    },
    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [
            "tasks",
            filters.page,
            filters.limit,
            filters.status,
            filters.search,
            filters.sortBy,
            filters.sortOrder,
          ],
          context.previousTasks,
        );
      }
      notifications.show({
        title: "Failed to update task",
        message: getErrorMessage(error),
        color: "red",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["taskStats"] });
    },
  });

  return {
    // Data
    tasks: tasksQuery.data?.data || [],
    pagination: tasksQuery.data?.meta,
    stats: statsQuery.data,

    // Loading states
    isLoading: tasksQuery.isLoading,
    isRefetching: tasksQuery.isRefetching,
    isStatsLoading: statsQuery.isLoading,

    // Filters
    filters,
    setPage: filters.setPage,
    setLimit: filters.setLimit,
    setStatus: filters.setStatus,
    setSearch: filters.setSearch,
    setSortBy: filters.setSortBy,
    setSortOrder: filters.setSortOrder,
    resetFilters: filters.resetFilters,

    // Mutations
    createTask: createMutation.mutate,
    isCreating: createMutation.isPending,

    updateTask: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteTask: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    toggleComplete: toggleCompleteMutation.mutate,
    isToggling: toggleCompleteMutation.isPending,

    // Refetch
    refetch: tasksQuery.refetch,
  };
}
