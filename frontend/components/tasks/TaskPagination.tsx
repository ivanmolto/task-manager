"use client";

import { Group, Pagination, Select, Text } from "@mantine/core";
import type { PaginationMeta } from "@task-manager/types";

interface TaskPaginationProps {
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TaskPagination({
  pagination,
  onPageChange,
  onLimitChange,
}: TaskPaginationProps) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, limit, total, totalPages } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Group justify="space-between" mt="xl">
      <Text size="sm" c="dimmed">
        Showing {start}-{end} of {total} tasks
      </Text>

      <Group gap="md">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Per page:
          </Text>
          <Select
            value={limit.toString()}
            onChange={(value) => onLimitChange(parseInt(value || "10", 10))}
            data={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            size="xs"
            className="w-20"
          />
        </Group>

        <Pagination
          total={totalPages}
          value={page}
          onChange={onPageChange}
          size="sm"
          boundaries={1}
          siblings={1}
        />
      </Group>
    </Group>
  );
}
