import { create } from "zustand";
import { persist } from "zustand/middleware";

import { statusLabels } from "@/constants/status";
import { deleteAttachmentFile } from "@/services/attachments";
import { appStorage } from "@/storage/appStorage";
import { useHistory } from "@/store/historyStore";
import { Attachment, Task, TaskInput, TaskStatus } from "@/types/task";
import { formatDateTime, nowIso } from "@/utils/date";
import { newId } from "@/utils/id";

type TaskState = {
  tasks: Task[];
  deletedIds: string[]; // if device is offline, sync later to delete
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, input: TaskInput) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  addAttachment: (taskId: string, attachment: Attachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
};

export const useTasks = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      deletedIds: [],

      addTask: (input) => {
        const now = nowIso();
        const task: Task = {
          ...input,
          id: newId(),
          status: "new",
          attachments: [],
          syncStatus: "pending",
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ tasks: [task, ...state.tasks] }));

        useHistory.getState().addEntry({
          taskId: task.id,
          taskTitle: task.title,
          action: "created",
          description: `Created, due ${formatDateTime(task.dueAt)}`,
        });

        return task;
      },

      updateTask: (id, input) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task) {
          return;
        }

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...input,
                  updatedAt: nowIso(),
                  syncStatus: "pending",
                }
              : item,
          ),
        }));

        useHistory.getState().addEntry({
          taskId: id,
          taskTitle: input.title,
          action: "updated",
          description: "Details edited",
        });
      },

      setStatus: (id, status) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task || task.status === status) {
          return;
        }

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === id
              ? { ...item, status, updatedAt: nowIso(), syncStatus: "pending" }
              : item,
          ),
        }));

        useHistory.getState().addEntry({
          taskId: id,
          taskTitle: task.title,
          action: "status_changed",
          description: `${statusLabels[task.status]} → ${statusLabels[status]}`,
        });
      },

      deleteTask: (id) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task) {
          return;
        }

        task.attachments.forEach(deleteAttachmentFile);

        set((state) => ({
          tasks: state.tasks.filter((item) => item.id !== id),
          deletedIds: [...state.deletedIds, id],
        }));

        useHistory.getState().addEntry({
          taskId: null,
          taskTitle: task.title,
          action: "deleted",
          description: "Task deleted",
        });
      },

      addAttachment: (taskId, attachment) => {
        const task = get().tasks.find((item) => item.id === taskId);
        if (!task) {
          return;
        }

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  attachments: [...item.attachments, attachment],
                  updatedAt: nowIso(),
                  syncStatus: "pending",
                }
              : item,
          ),
        }));

        useHistory.getState().addEntry({
          taskId,
          taskTitle: task.title,
          action: "attachment_added",
          description: `Attached ${attachment.name}`,
        });
      },

      removeAttachment: (taskId, attachmentId) => {
        const task = get().tasks.find((item) => item.id === taskId);
        const attachment = task?.attachments.find((item) => item.id === attachmentId);
        if (!task || !attachment) {
          return;
        }

        deleteAttachmentFile(attachment);

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  attachments: item.attachments.filter((a) => a.id !== attachmentId),
                  updatedAt: nowIso(),
                  syncStatus: "pending",
                }
              : item,
          ),
        }));

        useHistory.getState().addEntry({
          taskId,
          taskTitle: task.title,
          action: "attachment_removed",
          description: `Removed ${attachment.name}`,
        });
      },
    }),
    {
      name: "taskmaster-tasks",
      storage: appStorage,
      partialize: (state) => ({
        tasks: state.tasks,
        deletedIds: state.deletedIds,
      }),
    },
  ),
);
