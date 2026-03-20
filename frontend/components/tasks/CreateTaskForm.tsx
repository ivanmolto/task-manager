"use client";

import { useState } from "react";
import {
  Paper,
  TextInput,
  Textarea,
  Button,
  Group,
  Collapse,
} from "@mantine/core";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateTaskInput } from "@task-manager/types";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters"),
  description: z
    .string()
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
});

interface CreateTaskFormProps {
  onSubmit: (data: CreateTaskInput) => void;
  isLoading: boolean;
}

export function CreateTaskForm({ onSubmit, isLoading }: CreateTaskFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: CreateTaskInput) => {
    onSubmit({
      title: data.title,
      description: data.description || undefined,
    });
    reset();
    setShowDescription(false);
  };

  const handleCancel = () => {
    reset();
    setExpanded(false);
    setShowDescription(false);
  };

  if (!expanded) {
    return (
      <Button
        variant="light"
        leftSection={<Plus className="h-4 w-4" />}
        onClick={() => setExpanded(true)}
        fullWidth
        className="h-12 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors"
      >
        Add a new task
      </Button>
    );
  }

  return (
    <Paper shadow="sm" p="lg" radius="lg" className="border border-indigo-200">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <TextInput
          placeholder="What needs to be done?"
          size="md"
          autoFocus
          error={errors.title?.message}
          {...register("title")}
        />

        <Collapse in={showDescription}>
          <Textarea
            placeholder="Add more details (optional)"
            autosize
            minRows={2}
            maxRows={4}
            error={errors.description?.message}
            {...register("description")}
          />
        </Collapse>

        <Group justify="space-between">
          <Button
            variant="subtle"
            size="xs"
            color="gray"
            onClick={() => setShowDescription(!showDescription)}
            rightSection={
              showDescription ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )
            }
          >
            {showDescription ? "Hide description" : "Add description"}
          </Button>

          <Group gap="xs">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={<Plus className="h-4 w-4" />}
            >
              Add Task
            </Button>
          </Group>
        </Group>
      </form>
    </Paper>
  );
}
