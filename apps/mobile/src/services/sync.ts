import * as api from "@/services/api";
import { useHistory } from "@/store/historyStore";
import { useSettings } from "@/store/settingsStore";
import { useTasks } from "@/store/taskStore";
import { Task } from "@/types/task";
import { nowIso } from "@/utils/date";
import { mergeTasks } from "@/utils/mergeTasks";

export type SyncResult =
  | { ok: true; sent: number; received: number }
  | { ok: false; error: string };

let syncing = false;

export async function syncTasks(): Promise<SyncResult> {
  if (syncing) {
    return { ok: false, error: "Sync already running" };
  }
  if (useSettings.getState().apiUrl.trim() === "") {
    return { ok: false, error: "No server URL set" };
  }

  syncing = true;
  try {
    const serverTasks = await api.fetchTasks();
    const { tasks: localTasks, deletedIds } = useTasks.getState();
    const merged = mergeTasks(localTasks, serverTasks, deletedIds);
    const serverIds = new Set(serverTasks.map((task) => task.id));

    let sent = 0;
    let failed = 0;
    const tasks: Task[] = [];

    for (const task of merged.tasks) {
      if (task.syncStatus === "synced") {
        tasks.push(task);
        continue;
      }
      try {
        if (serverIds.has(task.id)) {
          await api.updateTask(task);
        } else {
          await api.createTask(task);
        }
        tasks.push({ ...task, syncStatus: "synced" });
        sent++;
      } catch {
        tasks.push({ ...task, syncStatus: "failed" });
        failed++;
      }
    }

    const remainingDeletes: string[] = [];
    for (const id of deletedIds) {
      try {
        await api.deleteTask(id);
      } catch {
        remainingDeletes.push(id);
      }
    }

    useTasks.getState().applySyncResult(tasks, remainingDeletes);
    useSettings.getState().setLastSyncAt(nowIso());

    if (failed > 0) {
      logSync("sync_failed", `${failed} task(s) could not be sent`);
      return { ok: false, error: `${failed} task(s) could not be sent` };
    }

    logSync("synced", `Synced: ${sent} sent, ${merged.received} received`);
    return { ok: true, sent, received: merged.received };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    useTasks.getState().markPendingAsFailed();
    logSync("sync_failed", `Sync failed: ${message}`);
    return { ok: false, error: message };
  } finally {
    syncing = false;
  }
}

function logSync(action: "synced" | "sync_failed", description: string) {
  useHistory.getState().addEntry({
    taskId: null,
    taskTitle: "Server sync",
    action,
    description,
  });
}
