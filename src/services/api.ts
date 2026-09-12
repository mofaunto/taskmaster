import { useSettings } from "@/store/settingsStore";
import { ServerTask, Task } from "@/types/task";

const TIMEOUT_MS = 8000;

function baseUrl() {
  return useSettings.getState().apiUrl.trim().replace(/\/$/, "");
}

async function send(path: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(`${baseUrl()}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Server did not respond in time");
    }
    throw new Error("Could not reach the server");
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await send(path, options);
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
  return response.json();
}

function toServerTask(task: Task): ServerTask {
  const { notificationId, syncStatus, ...serverTask } = task;
  return serverTask;
}

export function fetchTasks() {
  return request<ServerTask[]>("/tasks");
}

export function createTask(task: Task) {
  return request<ServerTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(toServerTask(task)),
  });
}

export function updateTask(task: Task) {
  return request<ServerTask>(`/tasks/${task.id}`, {
    method: "PUT",
    body: JSON.stringify(toServerTask(task)),
  });
}

export async function deleteTask(id: string) {
  const response = await send(`/tasks/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error(`Server responded with ${response.status}`);
  }
}

export async function ping() {
  await request<ServerTask[]>("/tasks");
}
