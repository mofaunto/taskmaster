import { Task, TaskStatus } from "@/types/task";

export type StatusFilter = TaskStatus | "all";

export function filterTasks(
  tasks: Task[],
  query: string,
  status: StatusFilter,
) {
  const search = query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (status !== "all" && task.status !== status) {
      return false;
    }
    return search === "" || task.title.toLowerCase().includes(search);
  });
}
