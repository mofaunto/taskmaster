import { TaskStatus } from "@/types/task";

export const statusLabels: Record<TaskStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
