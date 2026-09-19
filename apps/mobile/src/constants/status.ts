import { TaskStatus } from "@/types/task";

export const statusLabels: Record<TaskStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusColors: Record<TaskStatus, string> = {
  new: "#2F80ED",
  in_progress: "#D98E04",
  completed: "#27AE60",
  cancelled: "#8A8F98",
};

export const statusOrder: TaskStatus[] = [
  "new",
  "in_progress",
  "completed",
  "cancelled",
];
