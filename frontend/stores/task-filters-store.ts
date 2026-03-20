import { create } from "zustand";
import type { TaskStatus, SortBy, SortOrder } from "@task-manager/types";

interface TaskFiltersState {
  page: number;
  limit: number;
  status: TaskStatus;
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;

  // Actions
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setStatus: (status: TaskStatus) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  page: 1,
  limit: 10,
  status: "all" as TaskStatus,
  search: "",
  sortBy: "createdAt" as SortBy,
  sortOrder: "desc" as SortOrder,
};

export const useTaskFiltersStore = create<TaskFiltersState>((set) => ({
  ...defaultFilters,

  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () => set(defaultFilters),
}));
