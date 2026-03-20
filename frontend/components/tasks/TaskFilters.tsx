"use client";

import {
  TextInput,
  Select,
  Group,
  SegmentedControl,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { Search, SortAsc, SortDesc, RotateCcw } from "lucide-react";
import { useDebouncedCallback } from "@mantine/hooks";
import type { TaskStatus, SortBy, SortOrder } from "@task-manager/types";

interface TaskFiltersProps {
  status: TaskStatus;
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onStatusChange: (status: TaskStatus) => void;
  onSearchChange: (search: string) => void;
  onSortByChange: (sortBy: SortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  onReset: () => void;
}

export function TaskFilters({
  status,
  search,
  sortBy,
  sortOrder,
  onStatusChange,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: TaskFiltersProps) {
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 300);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <TextInput
          placeholder="Search tasks..."
          leftSection={<Search className="h-4 w-4 text-slate-400" />}
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="flex-1"
        />

        <Group gap="sm">
          <Select
            value={sortBy}
            onChange={(value) => onSortByChange(value as SortBy)}
            data={[
              { value: "createdAt", label: "Created Date" },
              { value: "updatedAt", label: "Updated Date" },
              { value: "completed", label: "Status" },
            ]}
            className="w-40"
          />

          <Tooltip label={sortOrder === "asc" ? "Ascending" : "Descending"}>
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() =>
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Reset filters">
            <ActionIcon
              variant="light"
              size="lg"
              color="gray"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <SegmentedControl
        value={status}
        onChange={(value) => onStatusChange(value as TaskStatus)}
        data={[
          { value: "all", label: "All Tasks" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
        ]}
        fullWidth
        className="max-w-md"
      />
    </div>
  );
}
