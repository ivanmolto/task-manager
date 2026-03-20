"use client";

import { useState } from "react";
import {
  Paper,
  Text,
  Checkbox,
  ActionIcon,
  Group,
  Menu,
  Badge,
  Textarea,
  TextInput,
  Button,
} from "@mantine/core";
import { MoreVertical, Edit2, Trash2, Calendar, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Task, UpdateTaskInput } from "@task-manager/types";
import clsx from "clsx";

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
});

// 1. We infer the exact type from the Zod schema
type EditFormValues = z.infer<typeof editSchema>;

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onUpdate: (id: string, data: UpdateTaskInput) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function TaskItem({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
  isToggling,
  isUpdating,
  isDeleting,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // 2. Use the inferred type here instead of UpdateTaskInput
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
    },
  });

  // 3. Use the inferred type here as well
  const handleEdit = (data: EditFormValues) => {
    onUpdate(task.id, data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset({
      title: task.title,
      description: task.description || "",
    });
    setIsEditing(false);
  };

  // Ensure this handles both string and Date objects perfectly
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="lg"
      className={clsx(
        "border transition-all duration-200 hover:shadow-md",
        task.completed ? "border-green-200 bg-green-50/50" : "border-slate-200",
      )}
    >
      {!isEditing ? (
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            disabled={isToggling}
            size="md"
            color="green"
            className={clsx(
              "mt-0.5 transition-transform",
              task.completed && "animate-checkmark",
            )}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Text
                fw={500}
                className={clsx(
                  "transition-all",
                  task.completed && "line-through text-slate-500",
                )}
              >
                {task.title}
              </Text>

              <Menu shadow="md" width={160} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<Edit2 className="h-4 w-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<Trash2 className="h-4 w-4" />}
                    onClick={() => onDelete(task.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>

            {task.description && (
              <Text
                size="sm"
                c="dimmed"
                mt={4}
                className={clsx(task.completed && "line-through")}
              >
                {task.description}
              </Text>
            )}

            <Group gap="xs" mt="sm">
              <Badge
                size="sm"
                variant="light"
                color={task.completed ? "green" : "blue"}
              >
                {task.completed ? "Completed" : "Pending"}
              </Badge>
              <Group gap={4}>
                <Calendar className="h-3 w-3 text-slate-400" />
                <Text size="xs" c="dimmed">
                  {formatDate(task.createdAt)}
                </Text>
              </Group>
            </Group>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleEdit)} className="space-y-3">
          <TextInput
            placeholder="Task title"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            placeholder="Description (optional)"
            autosize
            minRows={2}
            maxRows={4}
            error={errors.description?.message}
            {...register("description")}
          />
          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={handleCancel}
              leftSection={<X className="h-4 w-4" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={isUpdating}
              leftSection={<Check className="h-4 w-4" />}
            >
              Save
            </Button>
          </Group>
        </form>
      )}
    </Paper>
  );
}
