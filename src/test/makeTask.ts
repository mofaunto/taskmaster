import { Task } from "@/types/task";

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Check the boiler",
    description: "Annual inspection",
    dueAt: "2026-09-20T10:00:00.000Z",
    address: "Amir Temur street 1",
    status: "new",
    attachments: [],
    syncStatus: "pending",
    createdAt: "2026-09-10T08:00:00.000Z",
    updatedAt: "2026-09-10T08:00:00.000Z",
    ...overrides,
  };
}
