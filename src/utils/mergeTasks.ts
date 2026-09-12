import { ServerTask, Task } from "@/types/task";

export type MergeResult = {
  tasks: Task[];
  received: number;
};

export function mergeTasks(
  local: Task[],
  server: ServerTask[],
  deletedIds: string[],
): MergeResult {
  const serverById = new Map(server.map((task) => [task.id, task]));
  const localIds = new Set(local.map((task) => task.id));
  let received = 0;

  const tasks: Task[] = local.map((task) => {
    const remote = serverById.get(task.id);
    if (remote && remote.updatedAt > task.updatedAt) {
      received++;
      return {
        ...remote,
        notificationId: task.notificationId,
        syncStatus: "synced",
      };
    }
    return task;
  });

  for (const remote of server) {
    if (!localIds.has(remote.id) && !deletedIds.includes(remote.id)) {
      received++;
      tasks.push({ ...remote, syncStatus: "synced" });
    }
  }

  return { tasks, received };
}
