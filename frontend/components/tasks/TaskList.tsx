"use client";

import { Paper, Text, Stack, Skeleton, Center } from "@mantine/core";
import { ClipboardList } from "lucide-react";
import { TaskItem } from "./TaskItem";
import type { Task, UpdateTaskInput } from "@task-manager/types";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, data: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function TaskList({
  tasks,
  isLoading,
  onToggleComplete,
  onUpdate,
  onDelete,
  isToggling,
  isUpdating,
  isDeleting,
}: TaskListProps) {
  if (isLoading) {
    return (
      <Stack gap="md">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </Stack>
    );
  }

  if (tasks.length === 0) {
    return (
      <Paper
        shadow="xs"
        p="xl"
        radius="lg"
        className="border border-dashed border-slate-300"
      >
        <Center>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
            <Text fw={500} size="lg" c="dimmed">
              No tasks found
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Create a new task to get started or adjust your filters
            </Text>
          </div>
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem
            task={task}
            onToggleComplete={onToggleComplete}
            onUpdate={(id, data) => onUpdate(id, data)}
            onDelete={onDelete}
            isToggling={isToggling}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        </div>
      ))}
    </Stack>
  );
}
