export type TaskStatus = "new" | "in_progress" | "completed" | "cancelled";

export type SyncStatus = "pending" | "synced" | "failed";

export type Attachment = {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  kind: "image" | "file";
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: TaskStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  notificationId?: string;
  syncStatus: SyncStatus;
};

export type ServerTask = Omit<Task, "notificationId" | "syncStatus">;

export type TaskInput = {
  title: string;
  description: string;
  dueAt: string;
  address: string;
  latitude?: number;
  longitude?: number;
};
