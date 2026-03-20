"use client";

import { Title, Text, Paper, Divider } from "@mantine/core";
import { useTasks } from "@/hooks";
import {
  TaskStats,
  TaskFilters,
  TaskList,
  CreateTaskForm,
  TaskPagination,
} from "@/components/tasks";

export default function DashboardPage() {
  const {
    tasks,
    pagination,
    stats,
    isLoading,
    isStatsLoading,
    filters,
    setPage,
    setLimit,
    setStatus,
    setSearch,
    setSortBy,
    setSortOrder,
    resetFilters,
    createTask,
    isCreating,
    updateTask,
    isUpdating,
    deleteTask,
    isDeleting,
    toggleComplete,
    isToggling,
  } = useTasks();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Title order={1} className="text-slate-800">
          Dashboard
        </Title>
        <Text c="dimmed" mt={4}>
          Manage your tasks and track your progress
        </Text>
      </div>

      {/* Stats */}
      <TaskStats stats={stats} isLoading={isStatsLoading} />

      {/* Task Management Section */}
      <Paper shadow="sm" p="xl" radius="lg" className="border border-slate-200">
        <Title order={2} size="h3" mb="lg">
          Your Tasks
        </Title>

        {/* Create Task Form */}
        <CreateTaskForm onSubmit={createTask} isLoading={isCreating} />

        <Divider my="xl" />

        {/* Filters */}
        <TaskFilters
          status={filters.status}
          search={filters.search}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onStatusChange={setStatus}
          onSearchChange={setSearch}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          onReset={resetFilters}
        />

        {/* Task List */}
        <div className="mt-6">
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onToggleComplete={toggleComplete}
            onUpdate={(id, data) => updateTask({ id, data })}
            onDelete={deleteTask}
            isToggling={isToggling}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </div>

        {/* Pagination */}
        <TaskPagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Paper>
    </div>
  );
}
