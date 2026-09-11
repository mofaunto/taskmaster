import { statusOrder } from "@/constants/status";
import { Task } from "@/types/task";

export type SortBy = "created" | "due" | "status";

export function sortTasks(tasks: Task[], sortBy: SortBy) {
  const sorted = [...tasks];

  if (sortBy === "created") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (sortBy === "due") {
    sorted.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  } else {
    sorted.sort((a, b) => {
      const byStatus =
        statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      return byStatus !== 0 ? byStatus : a.dueAt.localeCompare(b.dueAt);
    });
  }

  return sorted;
}
