export type HistoryAction =
  | "created"
  | "updated"
  | "status_changed"
  | "attachment_added"
  | "attachment_removed"
  | "deleted"
  | "synced"
  | "sync_failed";

export type HistoryEntry = {
  id: string;
  taskId: string | null;
  taskTitle: string;
  action: HistoryAction;
  description: string;
  createdAt: string;
};
