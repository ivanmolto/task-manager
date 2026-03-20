"use client";

import { Paper, Text, Group, SimpleGrid, Skeleton } from "@mantine/core";
import { CheckCircle, Circle, ListTodo, TrendingUp } from "lucide-react";
import type { TaskStats as TaskStatsType } from "@task-manager/types";

interface TaskStatsProps {
  stats?: TaskStatsType;
  isLoading: boolean;
}

export function TaskStats({ stats, isLoading }: TaskStatsProps) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={120} radius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  const statCards = [
    {
      label: "Total Tasks",
      value: stats?.total || 0,
      icon: ListTodo,
      color: "indigo",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Completed",
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Pending",
      value: stats?.pending || 0,
      icon: Circle,
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      icon: TrendingUp,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      isPercentage: true,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
      {statCards.map((stat) => (
        <Paper
          key={stat.label}
          shadow="sm"
          p="lg"
          radius="lg"
          className="border border-slate-100"
        >
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                {stat.label}
              </Text>
              <Text size="xl" fw={700} mt={4}>
                {stat.value}
              </Text>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
            </div>
          </Group>
          {stat.isPercentage && stats && (
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          )}
        </Paper>
      ))}
    </SimpleGrid>
  );
}
